from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional

from app.schemas.user import UserResponse, UserMoveOrg
from app.schemas.org import OrgCreate, OrgUpdate, OrgResponse
from app.dependencies import require_admin, require_superadmin
from app.services.firebase_service import (
    get_users, update_user_status, update_user_org,
    get_orgs, get_org, update_org, delete_org, create_org_doc, now_ts
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/users")
async def list_users(org_id: Optional[str] = None, status: Optional[str] = None, current_user: dict = Depends(require_admin)):
    users = get_users(org_id=org_id, status=status)
    return users

@router.put("/users/{uid}/disable")
async def disable_user(uid: str, current_user: dict = Depends(require_superadmin)):
    user = update_user_status(uid, "disabled", disabled_by=current_user["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"uid": uid, "status": "disabled"}

@router.put("/users/{uid}/enable")
async def enable_user(uid: str, current_user: dict = Depends(require_superadmin)):
    user = update_user_status(uid, "active")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"uid": uid, "status": "active"}

@router.put("/users/{uid}/move-org")
async def move_user_org(uid: str, payload: UserMoveOrg, current_user: dict = Depends(require_admin)):
    user = update_user_org(uid, payload.org_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/orgs")
async def create_org(payload: OrgCreate, current_user: dict = Depends(require_admin)):
    org = create_org_doc(owner_uid=current_user["uid"], org_name=payload.name)
    if payload.description:
        update_org(org["org_id"], {"description": payload.description})
        org["description"] = payload.description
    return org

@router.get("/orgs")
async def list_orgs(current_user: dict = Depends(require_admin)):
    return get_orgs()

@router.get("/orgs/{org_id}")
async def get_org_details(org_id: str, current_user: dict = Depends(require_admin)):
    org = get_org(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    org["users"] = get_users(org_id=org_id)
    return org

@router.put("/orgs/{org_id}")
async def update_org_endpoint(org_id: str, payload: OrgUpdate, current_user: dict = Depends(require_admin)):
    updates = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if not updates:
        return get_org(org_id)
    org = update_org(org_id, updates)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    return org

@router.delete("/orgs/{org_id}")
async def delete_org_endpoint(org_id: str, current_user: dict = Depends(require_admin)):
    success = delete_org(org_id)
    if not success:
        raise HTTPException(status_code=404, detail="Org not found")
    return {"deleted": True}
