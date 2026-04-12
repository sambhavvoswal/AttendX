from datetime import datetime
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field


class AttendanceValueSchema(BaseModel):
    label: str = Field(..., max_length=15)
    value: str = Field(..., max_length=3, pattern="^[A-Z0-9]+$")
    color: str # "green", "red", "amber", "blue", "slate", "coral", "violet", "teal"
    is_positive: bool


class SheetCreate(BaseModel):
    display_name: str
    sheet_url: str
    access_method: str
    primary_key_column: str
    qr_key_mapping: Dict[str, str]
    attendance_values: List[AttendanceValueSchema]


class SheetUpdate(BaseModel):
    display_name: Optional[str] = None
    primary_key_column: Optional[str] = None
    qr_key_mapping: Optional[Dict[str, str]] = None


class SheetValuesUpdate(BaseModel):
    attendance_values: List[AttendanceValueSchema]


class SheetVerifyRequest(BaseModel):
    sheet_url: str


class SheetConnectGoogle(BaseModel):
    code: str


class SheetResponse(BaseModel):
    sheet_id: str
    owner_uid: str
    org_id: str
    display_name: str
    google_sheet_id: str
    sheet_url: str
    access_method: str
    primary_key_column: str
    qr_key_mapping: Dict[str, str]
    attendance_values: List[AttendanceValueSchema]
    created_at: datetime
    last_accessed: Optional[datetime] = None

class StudentAddRequest(BaseModel):
    student_data: Dict[str, Any]
