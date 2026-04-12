from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ValidateQRRequest(BaseModel):
    sheet_id: str
    payload: Dict[str, Any]

class MarkAttendanceRequest(BaseModel):
    sheet_id: str
    pk_value: str
    date_column: str
    attendance_value: str

class SessionStartRequest(BaseModel):
    sheet_id: str
    date: str

class SessionEndRequest(BaseModel):
    session_id: str
    sheet_id: str
    date_column: str
    scanned_ids: List[str]
    manually_marked_ids: List[str]
    value_counts: Dict[str, int]
    unmarked_default: str  # "empty" or "absent"
    absent_value: Optional[str] = None
