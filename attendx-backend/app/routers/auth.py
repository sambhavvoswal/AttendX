from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from app.dependencies import get_current_user
from app.services.firebase_service import (
    create_org_doc,
    create_user_doc,
    get_user_doc,
    verify_firebase_id_token,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    name: str = Field(min_length=1)
    org_name: str = Field(min_length=1)
    email: str = Field(min_length=3)


class GoogleSetupBody(BaseModel):
    name: str = Field(min_length=1)
    org_name: str = Field(min_length=1)


@router.post("/register")
def register(body: RegisterBody, authorization: str = Header(default="")):
    """
    Called AFTER Firebase creates the account.
    Even though this is not "protected" by having an existing user doc,
    we still require a valid Firebase ID token to obtain the UID safely.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    decoded = verify_firebase_id_token(token)
    uid = decoded["uid"]

    existing = get_user_doc(uid)
    if existing:
        return {"uid": uid, "status": existing.get("status"), "org_id": existing.get("org_id")}

    org = create_org_doc(owner_uid=uid, org_name=body.org_name)
    user = create_user_doc(
        uid=uid,
        email=body.email,
        name=body.name,
        org_name=body.org_name,
        org_id=org["org_id"],
        auth_provider="email",
    )
    return {"uid": uid, "status": user["status"], "org_id": org["org_id"]}


@router.post("/google-setup")
def google_setup(body: GoogleSetupBody, authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    decoded = verify_firebase_id_token(token)
    uid = decoded["uid"]

    existing = get_user_doc(uid)
    if existing:
        return {"uid": uid, "status": existing.get("status"), "org_id": existing.get("org_id")}

    # Email comes from token for Google provider users
    email = decoded.get("email") or ""

    org = create_org_doc(owner_uid=uid, org_name=body.org_name)
    user = create_user_doc(
        uid=uid,
        email=email,
        name=body.name,
        org_name=body.org_name,
        org_id=org["org_id"],
        auth_provider="google",
    )
    return {"uid": uid, "status": user["status"], "org_id": org["org_id"]}


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user

