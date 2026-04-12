from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.schemas.attendance import (
    ValidateQRRequest,
    MarkAttendanceRequest,
    SessionStartRequest,
    SessionEndRequest
)
from app.dependencies import get_current_user
from app.services import firebase_service
from app.services.sheets_service import SheetsService
from app.utils.qr_validator import validate_qr_payload

router = APIRouter()
sheets_service = SheetsService()

@router.post("/validate-qr")
def validate_qr(req: ValidateQRRequest, user: dict = Depends(get_current_user)):
    print(f"[validate-qr] payload received: {req.payload}")
    
    # 1. Fetch the sheet config to know what columns are expected
    sheet = firebase_service.get_sheet(req.sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")

    mapping = sheet.get("qr_key_mapping", {})
    pk_col_name = sheet.get("primary_key_column")
    print(f"[validate-qr] mapping={mapping}, pk_col_name={pk_col_name}")

    pk_key = None
    other_keys = []
    
    for json_key, col_header in mapping.items():
        if col_header == pk_col_name:
            pk_key = json_key
        else:
            other_keys.append(json_key)
    
    print(f"[validate-qr] resolved pk_key={pk_key}, other_keys={other_keys}")
            
    if not pk_key:
        raise HTTPException(status_code=400, detail="Primary key column is not mapped in QR settings")

    # 2. Validate payload using our dedicated utility
    result = validate_qr_payload(req.payload, pk_key, other_keys)
    print(f"[validate-qr] result={result}")
    return result

@router.post("/mark")
def mark_attendance(req: MarkAttendanceRequest, user: dict = Depends(get_current_user)):
    sheet = firebase_service.get_sheet(req.sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")

    google_sheet_id = sheet.get("google_sheet_id")
    if not google_sheet_id:
        raise HTTPException(status_code=400, detail="Google sheet ID missing")

    client = sheets_service.build_client()
    try:
        row_index = sheets_service.mark_attendance(
            sheet_id=google_sheet_id,
            client=client,
            pk_col=sheet.get("primary_key_column"),
            pk_value=req.pk_value,
            date_col=req.date_column,
            att_value=req.attendance_value
        )
        return {"marked": True, "row_index": row_index}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/session/start")
def start_session(req: SessionStartRequest, user: dict = Depends(get_current_user)):
    try:
        print(f"[session/start] sheet_id={req.sheet_id}, date={req.date}, user={user['uid']}")
        
        sheet = firebase_service.get_sheet(req.sheet_id)
        if not sheet:
            raise HTTPException(status_code=404, detail="Sheet not found")
        print(f"[session/start] Sheet found: {sheet.get('display_name')}")

        # Check if a session already exists for this sheet and date
        existing_session = firebase_service.get_session_by_sheet_and_date(req.sheet_id, req.date)
        if existing_session:
            print(f"[session/start] Returning existing session: {existing_session.get('session_id')}")
            return existing_session

        # Fetch total students to initialize total_students count
        google_sheet_id = sheet.get("google_sheet_id")
        print(f"[session/start] Fetching students from Google Sheet: {google_sheet_id}")
        client = sheets_service.build_client()
        print("[session/start] gspread client built successfully")
        
        students = sheets_service.get_students(google_sheet_id, client)
        print(f"[session/start] Found {len(students)} students")
        
        # Create the session document
        new_session = firebase_service.create_session(
            sheet_id=req.sheet_id,
            org_id=sheet.get("org_id", ""),
            owner_uid=user["uid"],
            date_column=req.date,
            total_students=len(students)
        )
        print(f"[session/start] Session created: {new_session.get('session_id')}")
        return new_session
    except HTTPException:
        raise
    except Exception as e:
        print(f"[session/start] CRASH: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {type(e).__name__}: {str(e)}")

@router.post("/session/end")
def end_session(req: SessionEndRequest, user: dict = Depends(get_current_user)):
    # 1. Fetch current session
    session = firebase_service.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    sheet = firebase_service.get_sheet(req.sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")

    # 2. Process unmarked defaults if necessary
    if req.unmarked_default == "absent" and req.absent_value:
        client = sheets_service.build_client()
        google_sheet_id = sheet.get("google_sheet_id")
        pk_col_name = sheet.get("primary_key_column")
        
        # Get all students and figure out who is unmarked
        all_students = sheets_service.get_students(google_sheet_id, client)
        marked_ids_set = set(req.scanned_ids + req.manually_marked_ids)
        
        unmarked_pks = []
        for stud in all_students:
            pk_val = str(stud.get(pk_col_name, "")).strip()
            if pk_val and pk_val not in marked_ids_set:
                unmarked_pks.append(pk_val)
        
        if unmarked_pks:
            # We must batch update them all
            # The backend SRD asks to "mark_attendance() in a single batch write (ws.batch_update()), not one-by-one."
            sheets_service.batch_mark_attendance(
                sheet_id=google_sheet_id,
                client=client,
                pk_col=pk_col_name,
                pk_values=unmarked_pks,
                date_col=req.date_column,
                att_value=req.absent_value
            )

    # 3. Update session doc in Firestore
    updates = {
        "scanned_ids": req.scanned_ids,
        "manually_marked_ids": req.manually_marked_ids,
        "value_counts": req.value_counts,
        "unmarked_default": req.unmarked_default,
        "ended_at": firebase_service.now_ts()
    }
    updated_session = firebase_service.update_session(req.session_id, updates)
    return updated_session
