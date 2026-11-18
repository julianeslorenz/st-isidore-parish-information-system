from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    name: str
    role: str
    status: str
    contact_number: str | None = None
    barangay: str | None = None
    profile: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class RegisterIn(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=160)
    password: str = Field(min_length=8, max_length=128)
    contact_number: str | None = Field(default=None, max_length=32)
    barangay: str | None = Field(default=None, max_length=120)


class EmailAddressIn(BaseModel):
    email: EmailStr


class EmailVerificationIn(BaseModel):
    token: str = Field(min_length=32, max_length=200)


class StaffCreateIn(RegisterIn):
    role: Literal["Admin", "Parish Secretary", "Parish Staff", "Priest"] = "Parish Staff"
    password: str = Field(min_length=12, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class DeleteAccountIn(BaseModel):
    password: str = Field(min_length=1, max_length=128)
    confirmation: Literal["DELETE"]


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    email: EmailStr | None = None
    contact_number: str | None = Field(default=None, max_length=32)
    barangay: str | None = Field(default=None, max_length=120)
    profile: dict[str, Any] | None = None


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(min_length=32, max_length=200)
    password: str = Field(min_length=8, max_length=128)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RequestCreate(BaseModel):
    sacrament_type: Literal["Baptism", "Marriage", "Confirmation", "Funeral"]
    details: dict[str, Any] = Field(default_factory=dict)
    schedule_at: datetime | None = None


class RequestUpdate(BaseModel):
    status: Literal["pending", "under_review", "needs_information", "approved", "rejected", "completed", "cancelled", "rescheduled"] | None = None
    details: dict[str, Any] | None = None
    schedule_at: datetime | None = None
    assigned_priest_id: int | None = None
    note: str | None = Field(default=None, max_length=1000)


class EventIn(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    category: str = Field(default="Parish events", max_length=48)
    starts_at: datetime
    ends_at: datetime | None = None
    place: str | None = Field(default=None, max_length=180)
    description: str | None = None
    image_url: str | None = Field(default=None, max_length=500)
    status: str = "upcoming"

    @field_validator("ends_at")
    @classmethod
    def end_after_start(cls, value: datetime | None, info):
        start = info.data.get("starts_at")
        if value and start and value < start:
            raise ValueError("ends_at must be after starts_at")
        return value


class PriestIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    title: str | None = Field(default=None, max_length=80)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=32)
    sacraments: list[str] = Field(default_factory=list)
    description: str | None = None
    image_url: str | None = Field(default=None, max_length=500)
    active: bool = True
    date_start: datetime | None = None
    date_end: datetime | None = None


class AppointmentIn(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    appointment_type: str = "General"
    start_at: datetime
    end_at: datetime | None = None
    status: str = "scheduled"
    requester_id: int | None = None
    priest_id: int | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class AppointmentPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=180)
    appointment_type: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    status: str | None = None
    requester_id: int | None = None
    priest_id: int | None = None
    details: dict[str, Any] | None = None


class RescheduleRequestIn(BaseModel):
    preferred_at: datetime
    reason: str = Field(min_length=3, max_length=1000)


class CertificateIn(BaseModel):
    person_name: str = Field(min_length=1, max_length=180)
    certificate_type: Literal["Baptism", "Confirmation", "Marriage", "Funeral"]
    details: dict[str, Any] = Field(default_factory=dict)
    request_id: int | None = None


class RecordIn(BaseModel):
    sacrament_type: Literal["Baptism", "Marriage", "Confirmation", "Funeral"]
    person_name: str = Field(min_length=1, max_length=180)
    record_number: str | None = Field(default=None, max_length=80)
    record_date: datetime | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class RecordPatch(BaseModel):
    sacrament_type: Literal["Baptism", "Marriage", "Confirmation", "Funeral"] | None = None
    person_name: str | None = Field(default=None, min_length=1, max_length=180)
    record_number: str | None = Field(default=None, max_length=80)
    record_date: datetime | None = None
    details: dict[str, Any] | None = None


class CertificateUpdate(BaseModel):
    status: Literal["processing", "signature", "ready", "released", "cancelled", "revoked"]
    note: str | None = Field(default=None, max_length=500)


class CertificateDetailsUpdate(BaseModel):
    person_name: str = Field(min_length=1, max_length=180)
    details: dict[str, Any] = Field(default_factory=dict)


class MessageIn(BaseModel):
    receiver_id: int
    body: str = Field(min_length=1, max_length=5000)


class ConversationUpdate(BaseModel):
    archived: bool | None = None
    unread: bool | None = None


class UserUpdate(BaseModel):
    role: Literal["Admin", "Parish Secretary", "Parish Staff", "Priest", "Parishioner"] | None = None
    status: Literal["active", "inactive"] | None = None

