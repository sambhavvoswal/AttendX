from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class OrgCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class OrgUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class OrgResponse(BaseModel):
    org_id: str
    name: str
    description: str
    owner_uid: str
    created_at: datetime
    sheet_count: int
