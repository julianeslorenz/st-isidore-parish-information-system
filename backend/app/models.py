from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="Parishioner", index=True)
    status: Mapped[str] = mapped_column(String(16), default="active", index=True)
    contact_number: Mapped[str | None] = mapped_column(String(32))
    barangay: Mapped[str | None] = mapped_column(String(120))
    profile: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    reset_token_hash: Mapped[str | None] = mapped_column(String(64), unique=True)
    reset_expires_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    requests: Mapped[list["SacramentRequest"]] = relationship(back_populates="requester")


class EmailVerification(Base):
    __tablename__ = "email_verifications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime)
    last_sent_at: Mapped[datetime | None] = mapped_column(DateTime)


class SacramentRequest(Base):
    __tablename__ = "sacrament_requests"
    __table_args__ = (Index("ix_request_type_status_created", "sacrament_type", "status", "created_at"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    public_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    sacrament_type: Mapped[str] = mapped_column(String(24), index=True)
    status: Mapped[str] = mapped_column(String(24), default="pending", index=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    schedule_at: Mapped[datetime | None] = mapped_column(DateTime, index=True)
    assigned_priest_id: Mapped[int | None] = mapped_column(ForeignKey("priests.id"))
    history: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    requester: Mapped[User] = relationship(back_populates="requests")
    documents: Mapped[list["RequestDocument"]] = relationship(back_populates="request", cascade="all, delete-orphan")


class RequestDocument(Base):
    __tablename__ = "request_documents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("sacrament_requests.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(180))
    original_filename: Mapped[str] = mapped_column(String(255))
    storage_key: Mapped[str] = mapped_column(String(64), unique=True)
    content_type: Mapped[str] = mapped_column(String(80))
    size_bytes: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    request: Mapped[SacramentRequest] = relationship(back_populates="documents")


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (Index("ix_appointment_start_status", "start_at", "status"), Index("uq_appointment_priest_start", "priest_id", "start_at", unique=True))
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    appointment_type: Mapped[str] = mapped_column(String(32), default="General")
    start_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    end_at: Mapped[datetime | None] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(24), default="scheduled", index=True)
    requester_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    priest_id: Mapped[int | None] = mapped_column(ForeignKey("priests.id"))
    request_id: Mapped[int | None] = mapped_column(ForeignKey("sacrament_requests.id"), unique=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class ParishEvent(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    category: Mapped[str] = mapped_column(String(48), default="Parish events")
    starts_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime)
    place: Mapped[str | None] = mapped_column(String(180))
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(24), default="upcoming", index=True)


class Priest(Base):
    __tablename__ = "priests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    title: Mapped[str | None] = mapped_column(String(80))
    email: Mapped[str | None] = mapped_column(String(254))
    phone: Mapped[str | None] = mapped_column(String(32))
    sacraments: Mapped[list[str]] = mapped_column(JSON, default=list)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500))
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    date_start: Mapped[datetime | None] = mapped_column(DateTime)
    date_end: Mapped[datetime | None] = mapped_column(DateTime)


class Certificate(Base):
    __tablename__ = "certificates"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    person_name: Mapped[str] = mapped_column(String(180))
    certificate_type: Mapped[str] = mapped_column(String(32), index=True)
    status: Mapped[str] = mapped_column(String(24), default="processing", index=True)
    request_id: Mapped[int | None] = mapped_column(ForeignKey("sacrament_requests.id"))
    requester_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    history: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ParishRecord(Base):
    __tablename__ = "parish_records"
    __table_args__ = (Index("ix_record_type_person", "sacrament_type", "person_name"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sacrament_type: Mapped[str] = mapped_column(String(24), index=True)
    record_number: Mapped[str | None] = mapped_column(String(80), index=True)
    person_name: Mapped[str] = mapped_column(String(180), index=True)
    record_date: Mapped[datetime | None] = mapped_column(DateTime, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (Index("ix_message_pair_created", "sender_id", "receiver_id", "created_at"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    receiver_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime)


class ConversationSetting(Base):
    __tablename__ = "conversation_settings"
    __table_args__ = (Index("uq_conversation_owner_peer", "owner_id", "peer_id", unique=True),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    peer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    archived: Mapped[bool] = mapped_column(Boolean, default=False)

