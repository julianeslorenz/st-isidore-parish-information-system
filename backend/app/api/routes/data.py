from datetime import UTC, datetime, timedelta
import json
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse, Response
from pydantic import ValidationError
from sqlalchemy import and_, extract, func, or_, select

from app.api.deps import AdminUser, CertificateStaff, CurrentUser, DbSession, DecisionStaff, OfficeStaff, StaffUser
from app.services.certificate_pdf import build_certificate_pdf
from app.models import Appointment, Certificate, ConversationSetting, Message, ParishEvent, ParishRecord, Priest, RequestDocument, SacramentRequest, User
from app.schemas import AppointmentIn, AppointmentPatch, CertificateDetailsUpdate, CertificateIn, CertificateUpdate, ConversationUpdate, EventIn, MessageIn, PriestIn, RecordIn, RecordPatch, RequestCreate, RequestUpdate, RescheduleRequestIn, StaffCreateIn, UserOut, UserUpdate

router = APIRouter(tags=["parish data"])
DOCUMENT_STORAGE = Path(__file__).resolve().parents[3] / "storage" / "request-documents"
MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
MAX_DOCUMENTS_PER_REQUEST = 10


def utc_naive(value: datetime) -> datetime:
    return value.astimezone(UTC).replace(tzinfo=None) if value.tzinfo else value


def utc_iso(value: datetime | None) -> str | None:
    if value is None: return None
    return (value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)).isoformat()


def request_view(row: SacramentRequest) -> dict[str, Any]:
    details = row.details or {}
    history = row.history or []
    return {
        "id": row.public_id, "database_id": row.id, "type": row.sacrament_type,
        "status": row.status, "applicant": row.requester.name,
        "subject": details.get("person_name") or details.get("subject") or details.get("forWhom") or row.sacrament_type,
        "child": details.get("child_name") or details.get("person_name") or "",
        "requested": utc_iso(row.schedule_at) or "",
        "submitted": utc_iso(row.created_at) or "",
        "priest": details.get("priest_name", "Unassigned"), "details": details,
        "timeline": history, "note": details.get("note", ""), "requester_id": row.requester_id,
        "documents": [{"id": doc.id, "label": doc.label, "filename": doc.original_filename,
                       "content_type": doc.content_type, "size_bytes": doc.size_bytes}
                      for doc in row.documents],
    }


def inspect_document(upload: UploadFile) -> tuple[str, str, bytes]:
    filename = (upload.filename or "document").replace("\\", "/").split("/")[-1]
    suffix = Path(filename).suffix.lower()
    content = upload.file.read(MAX_DOCUMENT_BYTES + 1)
    if not content:
        raise HTTPException(400, f"{filename} is empty.")
    if len(content) > MAX_DOCUMENT_BYTES:
        raise HTTPException(413, f"{filename} is larger than 5 MB.")
    signatures = {
        ".pdf": ("application/pdf", lambda b: b.startswith(b"%PDF-")),
        ".jpg": ("image/jpeg", lambda b: b.startswith(b"\xff\xd8\xff")),
        ".jpeg": ("image/jpeg", lambda b: b.startswith(b"\xff\xd8\xff")),
        ".png": ("image/png", lambda b: b.startswith(b"\x89PNG\r\n\x1a\n")),
    }
    if suffix not in signatures:
        raise HTTPException(415, f"{filename} must be a PDF, JPG, or PNG file.")
    content_type, matches = signatures[suffix]
    if not matches(content):
        raise HTTPException(415, f"{filename} does not match its file type.")
    return filename, content_type, content


def slot_is_taken(db: DbSession, start: datetime, priest_id: int | None, excluding_id: int | None = None) -> bool:
    if priest_id is None:
        return False
    # Lock the priest row so simultaneous bookings for an otherwise-empty calendar
    # serialize before checking the time range, including overlapping start times.
    db.scalar(select(Priest.id).where(Priest.id == priest_id).with_for_update())
    rows = db.scalars(select(Appointment).where(Appointment.priest_id == priest_id, Appointment.status.notin_(["cancelled", "completed"])).with_for_update()).all()
    start = utc_naive(start)
    proposed_end = start + timedelta(minutes=30)
    for row in rows:
        if excluding_id is not None and row.id == excluding_id: continue
        row_start = utc_naive(row.start_at)
        row_end = utc_naive(row.end_at) if row.end_at else row_start + timedelta(minutes=30)
        if start < row_end and proposed_end > row_start: return True
    return False


@router.get("/events")
def list_events(db: DbSession, include_past: bool = False):
    query = select(ParishEvent).order_by(ParishEvent.starts_at)
    if not include_past:
        query = query.where(ParishEvent.starts_at >= datetime.now())
    rows = db.scalars(query).all()
    return [{"id": r.id, "title": r.title, "category": r.category, "starts_at": utc_iso(r.starts_at), "ends_at": utc_iso(r.ends_at), "place": r.place, "description": r.description, "image_url": r.image_url, "status": r.status} for r in rows]


@router.post("/events", status_code=201)
def create_event(payload: EventIn, _: DecisionStaff, db: DbSession):
    values = payload.model_dump(); values["starts_at"] = utc_naive(values["starts_at"]); values["ends_at"] = utc_naive(values["ends_at"]) if values["ends_at"] else None
    row = ParishEvent(**values)
    db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, **payload.model_dump()}


@router.patch("/events/{event_id}")
def update_event(event_id: int, payload: EventIn, _: DecisionStaff, db: DbSession):
    row = db.get(ParishEvent, event_id)
    if not row: raise HTTPException(404, "Event not found")
    for key, value in payload.model_dump().items(): setattr(row, key, utc_naive(value) if key in {"starts_at", "ends_at"} and value else value)
    db.commit(); db.refresh(row)
    return {"id": row.id, **payload.model_dump()}


@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: int, _: DecisionStaff, db: DbSession):
    row = db.get(ParishEvent, event_id)
    if not row: raise HTTPException(404, "Event not found")
    db.delete(row); db.commit()


@router.get("/priests")
def list_priests(db: DbSession, _: OfficeStaff):
    return [{"id": p.id, "name": p.name, "role": p.title or "Priest", "status": "active" if p.active else "inactive", "email": p.email or "", "phone": p.phone or "", "sacraments": p.sacraments or [], "description": p.description, "image_url": p.image_url} for p in db.scalars(select(Priest).order_by(Priest.name)).all()]


@router.post("/priests", status_code=201)
def create_priest(payload: PriestIn, _: OfficeStaff, db: DbSession):
    row = Priest(**payload.model_dump()); db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "name": row.name, "role": row.title or "Priest", "status": "active" if row.active else "inactive", "email": row.email or "", "phone": row.phone or "", "sacraments": row.sacraments or []}


@router.patch("/priests/{priest_id}")
def update_priest(priest_id: int, payload: PriestIn, _: OfficeStaff, db: DbSession):
    row = db.get(Priest, priest_id)
    if not row: raise HTTPException(404, "Priest not found")
    for key, value in payload.model_dump().items(): setattr(row, key, value)
    db.commit(); db.refresh(row)
    return {"id": row.id, "name": row.name, "role": row.title or "Priest", "status": "active" if row.active else "inactive", "email": row.email or "", "phone": row.phone or "", "sacraments": row.sacraments or []}


@router.get("/requests")
def list_requests(user: CurrentUser, db: DbSession, sacrament_type: str | None = None, request_status: str | None = Query(default=None, alias="status"), limit: int = Query(default=100, ge=1, le=250), offset: int = Query(default=0, ge=0)):
    if user.role == "Priest": raise HTTPException(403, "Request management access required")
    query = select(SacramentRequest).order_by(SacramentRequest.created_at.desc()).limit(limit).offset(offset)
    if user.role not in {"Admin", "Parish Secretary", "Parish Staff", "Priest"}:
        query = query.where(SacramentRequest.requester_id == user.id)
    if sacrament_type: query = query.where(SacramentRequest.sacrament_type == sacrament_type)
    if request_status: query = query.where(SacramentRequest.status == request_status)
    return [request_view(row) for row in db.scalars(query).all()]


@router.post("/requests", status_code=201)
def create_request(payload: RequestCreate, user: CurrentUser, db: DbSession):
    prefix = {"Baptism": "BR", "Marriage": "MR", "Confirmation": "CR", "Funeral": "FR"}[payload.sacrament_type]
    public_id = f"{prefix}-{datetime.now().year}-{uuid4().hex[:8].upper()}"
    row = SacramentRequest(public_id=public_id, sacrament_type=payload.sacrament_type, requester_id=user.id,
        details=payload.details, schedule_at=utc_naive(payload.schedule_at) if payload.schedule_at else None,
        history=[{"text": "Request submitted", "when": datetime.now(UTC).isoformat(), "state": "done"}])
    db.add(row); db.commit(); db.refresh(row)
    return request_view(row)


@router.post("/requests/submit", status_code=201)
def submit_request_with_documents(
    user: CurrentUser,
    db: DbSession,
    request_payload: str = Form(...),
    document_labels: str = Form("[]"),
    files: list[UploadFile] = File(default=[]),
):
    try:
        payload = RequestCreate.model_validate_json(request_payload)
        labels = json.loads(document_labels)
        if not isinstance(labels, list) or len(labels) != len(files) or any(not isinstance(label, str) or not label.strip() for label in labels):
            raise ValueError("Each uploaded document needs a label.")
    except (ValidationError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(422, "The request details or document labels are invalid.") from exc
    if len(files) > MAX_DOCUMENTS_PER_REQUEST:
        raise HTTPException(413, f"No more than {MAX_DOCUMENTS_PER_REQUEST} files can be attached at once.")

    inspected = [inspect_document(upload) for upload in files]
    if sum(len(item[2]) for item in inspected) > 20 * 1024 * 1024:
        raise HTTPException(413, "The total size of attached documents cannot exceed 20 MB.")

    prefix = {"Baptism": "BR", "Marriage": "MR", "Confirmation": "CR", "Funeral": "FR"}[payload.sacrament_type]
    row = SacramentRequest(
        public_id=f"{prefix}-{datetime.now().year}-{uuid4().hex[:8].upper()}",
        sacrament_type=payload.sacrament_type,
        requester_id=user.id,
        details=payload.details,
        schedule_at=utc_naive(payload.schedule_at) if payload.schedule_at else None,
        history=[{"text": "Request submitted", "when": datetime.now(UTC).isoformat(), "state": "done"}],
    )
    saved_paths: list[Path] = []
    try:
        db.add(row)
        db.flush()
        DOCUMENT_STORAGE.mkdir(parents=True, exist_ok=True)
        for label, (filename, content_type, content) in zip(labels, inspected):
            storage_key = f"{uuid4().hex}{Path(filename).suffix.lower()}"
            path = DOCUMENT_STORAGE / storage_key
            path.write_bytes(content)
            saved_paths.append(path)
            db.add(RequestDocument(request_id=row.id, label=label.strip()[:180], original_filename=filename[:255],
                                   storage_key=storage_key, content_type=content_type, size_bytes=len(content)))
        db.commit()
        db.refresh(row)
        return request_view(row)
    except Exception:
        db.rollback()
        for path in saved_paths:
            path.unlink(missing_ok=True)
        raise


@router.get("/requests/{public_id}/documents/{document_id}")
def download_request_document(public_id: str, document_id: int, user: CurrentUser, db: DbSession):
    row = db.scalar(select(SacramentRequest).where(SacramentRequest.public_id == public_id))
    if not row or (row.requester_id != user.id and user.role not in {"Admin", "Parish Secretary", "Parish Staff"}):
        raise HTTPException(404, "Document not found")
    document = db.get(RequestDocument, document_id)
    if not document or document.request_id != row.id:
        raise HTTPException(404, "Document not found")
    path = DOCUMENT_STORAGE / document.storage_key
    if not path.is_file():
        raise HTTPException(404, "Document file is missing")
    return FileResponse(path, media_type=document.content_type, filename=document.original_filename,
                        content_disposition_type="attachment", headers={"X-Content-Type-Options": "nosniff"})


@router.patch("/requests/{public_id}")
def update_request(public_id: str, payload: RequestUpdate, user: DecisionStaff, db: DbSession):
    row = db.scalar(select(SacramentRequest).where(SacramentRequest.public_id == public_id))
    if not row: raise HTTPException(404, "Request not found")
    data = payload.model_dump(exclude_unset=True)
    note = data.pop("note", None)
    if "details" in data and data["details"] is not None: row.details = data.pop("details")
    for key, value in data.items(): setattr(row, key, value)
    if note:
        details = dict(row.details or {}); details["note"] = note; row.details = details
    if payload.status:
        history = list(row.history or [])
        history.append({"text": f"Status changed to {payload.status}" + (f": {note}" if note else ""), "when": datetime.now(UTC).isoformat(), "state": "done", "by": user.name})
        row.history = history
    appointment = db.scalar(select(Appointment).where(Appointment.request_id == row.id))
    if payload.status == "approved" and row.schedule_at and not appointment:
        priest_name = (row.details or {}).get("priest") or (row.details or {}).get("priest_name")
        priest = db.scalar(select(Priest).where(Priest.name == priest_name)) if priest_name else None
        if slot_is_taken(db, row.schedule_at, priest.id if priest else None): raise HTTPException(409, "The selected appointment time is no longer available")
        appointment = Appointment(title=f"{row.sacrament_type} appointment", appointment_type=row.sacrament_type, start_at=row.schedule_at,
            status="confirmed", requester_id=row.requester_id, priest_id=priest.id if priest else None,
            request_id=row.id, details={"who": row.details.get("forWhom", ""), "priest": priest_name or "", "note": note or ""})
        db.add(appointment)
    elif appointment and payload.schedule_at:
        if slot_is_taken(db, payload.schedule_at, appointment.priest_id, appointment.id): raise HTTPException(409, "The selected appointment time is no longer available")
        appointment.start_at = payload.schedule_at
    db.commit(); db.refresh(row)
    return request_view(row)


@router.post("/requests/{public_id}/cancel")
def cancel_request(public_id: str, user: CurrentUser, db: DbSession):
    row = db.scalar(select(SacramentRequest).where(SacramentRequest.public_id == public_id, SacramentRequest.requester_id == user.id))
    if not row: raise HTTPException(404, "Request not found")
    if row.status in {"completed", "cancelled", "rejected"}: raise HTTPException(409, "This request can no longer be cancelled")
    row.status = "cancelled"; db.commit(); db.refresh(row)
    return request_view(row)


@router.get("/appointments")
def list_appointments(user: CurrentUser, db: DbSession):
    query = select(Appointment).order_by(Appointment.start_at)
    if user.role == "Priest":
        priest_id = db.scalar(select(Priest.id).where(Priest.name == user.name))
        query = query.where(Appointment.priest_id == priest_id) if priest_id else query.where(Appointment.id == -1)
    elif user.role not in {"Admin", "Parish Secretary", "Parish Staff"}:
        query = query.where(Appointment.requester_id == user.id)
    return [{"id": a.id, "title": a.title, "type": a.appointment_type, "date": utc_iso(a.start_at), "start_at": utc_iso(a.start_at), "status": a.status, "who": a.details.get("who", "") if a.details else "", "priest": a.details.get("priest", "") if a.details else "", "note": a.details.get("note", "") if a.details else "", "details": a.details or {}} for a in db.scalars(query).all()]


@router.post("/appointments", status_code=201)
def create_appointment(payload: AppointmentIn, user: DecisionStaff, db: DbSession):
    start_at = utc_naive(payload.start_at)
    end_at = utc_naive(payload.end_at) if payload.end_at else None
    if end_at and end_at < start_at: raise HTTPException(422, "end_at must be after start_at")
    priest_id = payload.priest_id
    if priest_id is None and payload.details.get("priest"):
        priest = db.scalar(select(Priest).where(Priest.name == payload.details["priest"], Priest.active.is_(True)))
        priest_id = priest.id if priest else None
    if slot_is_taken(db, start_at, priest_id): raise HTTPException(409, "The selected appointment time is unavailable for this priest")
    values = payload.model_dump(); values["priest_id"] = priest_id; values["start_at"] = start_at; values["end_at"] = end_at
    row = Appointment(**values); db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "title": row.title, "date": row.start_at.isoformat(), "status": row.status}


@router.patch("/appointments/{appointment_id}")
def update_appointment(appointment_id: int, payload: AppointmentPatch, _: DecisionStaff, db: DbSession):
    row = db.get(Appointment, appointment_id)
    if not row: raise HTTPException(404, "Appointment not found")
    values = payload.model_dump(exclude_unset=True)
    candidate_start = utc_naive(values.get("start_at", row.start_at))
    candidate_priest = values.get("priest_id", row.priest_id)
    if "details" in values and "priest" in (values["details"] or {}):
        priest = db.scalar(select(Priest).where(Priest.name == values["details"]["priest"], Priest.active.is_(True)))
        candidate_priest = priest.id if priest else None
        values["priest_id"] = candidate_priest
    if slot_is_taken(db, candidate_start, candidate_priest, row.id): raise HTTPException(409, "The selected appointment time is unavailable for this priest")
    for key, value in values.items(): setattr(row, key, utc_naive(value) if key in {"start_at", "end_at"} and value else value)
    if row.end_at and row.end_at < row.start_at: raise HTTPException(422, "end_at must be after start_at")
    db.commit(); db.refresh(row)
    return {"id": row.id, "title": row.title, "date": row.start_at.isoformat(), "status": row.status}


@router.post("/appointments/{appointment_id}/reschedule-requests", status_code=201)
def request_appointment_reschedule(appointment_id: int, payload: RescheduleRequestIn, user: CurrentUser, db: DbSession):
    row = db.get(Appointment, appointment_id)
    if not row or row.requester_id != user.id: raise HTTPException(404, "Appointment not found")
    if row.status in {"cancelled", "completed"}: raise HTTPException(409, "This appointment can no longer be rescheduled")
    details = dict(row.details or {})
    if details.get("reschedule_request", {}).get("status") == "pending": raise HTTPException(409, "A reschedule request is already pending")
    details["reschedule_request"] = {"preferred_at": payload.preferred_at.isoformat(), "reason": payload.reason, "status": "pending", "created_at": datetime.now(UTC).isoformat()}
    row.details = details
    db.commit()
    return {"message": "Your reschedule request was sent to the parish office."}


@router.get("/certificates")
def list_certificates(user: CurrentUser, db: DbSession):
    if user.role == "Parish Staff": raise HTTPException(403, "Certificate workflow access required")
    query = select(Certificate).order_by(Certificate.created_at.desc())
    if user.role not in {"Admin", "Parish Secretary", "Parish Staff", "Priest"}:
        query = query.where(or_(Certificate.requester_id == user.id, Certificate.request_id.in_(select(SacramentRequest.id).where(SacramentRequest.requester_id == user.id))))
    return [{"id": c.id, "number": c.number, "name": c.person_name, "type": c.certificate_type, "status": c.status, "date": c.created_at.isoformat(), "history": c.history or [], "details": c.details or {}} for c in db.scalars(query).all()]


@router.post("/certificates", status_code=201)
def create_certificate(payload: CertificateIn, _: OfficeStaff, db: DbSession):
    prefix = {"Baptism": "BC", "Confirmation": "CF", "Marriage": "MC", "Funeral": "FC"}.get(payload.certificate_type, "PC")
    row = Certificate(number=f"{prefix}-{datetime.now().year}-{uuid4().hex[:8].upper()}", **payload.model_dump(), history=[{"date": datetime.now(UTC).isoformat(), "text": "Certificate request received"}])
    db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "number": row.number, "name": row.person_name, "type": row.certificate_type, "status": row.status}


@router.post("/certificates/request", status_code=201)
def request_certificate(payload: CertificateIn, user: CurrentUser, db: DbSession):
    prefix = {"Baptism": "BC", "Confirmation": "CF", "Marriage": "MC", "Funeral": "FC"}.get(payload.certificate_type, "PC")
    row = Certificate(number=f"{prefix}-{datetime.now().year}-{uuid4().hex[:8].upper()}", person_name=payload.person_name, certificate_type=payload.certificate_type, details=payload.details, request_id=payload.request_id, requester_id=user.id, history=[{"date": datetime.now(UTC).isoformat(), "text": "Certificate request received"}])
    db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "number": row.number, "name": row.person_name, "type": row.certificate_type, "status": row.status}


@router.patch("/certificates/{certificate_id}/details")
def update_certificate_details(certificate_id: int, payload: CertificateDetailsUpdate, user: OfficeStaff, db: DbSession):
    row = db.get(Certificate, certificate_id)
    if not row:
        raise HTTPException(404, "Certificate not found")
    if row.status not in {"processing", "signature"}:
        raise HTTPException(409, "Certificate details can only be edited while it is being prepared")
    row.person_name = payload.person_name.strip()
    row.details = payload.details
    history = list(row.history or [])
    history.append({"date": datetime.now(UTC).isoformat(), "text": "Certificate details prepared or updated", "by": user.name})
    row.history = history
    db.commit(); db.refresh(row)
    return {"id": row.id, "number": row.number, "name": row.person_name, "type": row.certificate_type, "status": row.status, "details": row.details, "history": row.history}


@router.get("/certificates/{certificate_id}/pdf")
def get_certificate_pdf(certificate_id: int, _: OfficeStaff, db: DbSession, background: bool = Query(default=True)):
    row = db.get(Certificate, certificate_id)
    if not row:
        raise HTTPException(404, "Certificate not found")
    if row.status not in {"processing", "signature"}:
        raise HTTPException(409, "Only certificates being prepared can be printed for review")
    try:
        pdf_bytes = build_certificate_pdf(row, include_background=background)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from None
    copy_type = "report" if background else "preprinted"
    filename = f"{row.certificate_type.lower()}-certificate-{copy_type}-{row.number}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.patch("/certificates/{certificate_id}")
def update_certificate(certificate_id: int, payload: CertificateUpdate, user: CertificateStaff, db: DbSession):
    row = db.get(Certificate, certificate_id)
    if not row: raise HTTPException(404, "Certificate not found")
    next_status = {"processing": "signature", "signature": "ready", "ready": "released"}.get(row.status)
    if payload.status == "revoked" and user.role != "Admin": raise HTTPException(403, "Administrator access required to revoke certificates")
    if payload.status == "ready" and row.status == "signature" and user.role not in {"Admin", "Priest"}: raise HTTPException(403, "A priest must sign certificates")
    if payload.status == "released" and row.status == "ready" and user.role not in {"Admin", "Parish Secretary"}: raise HTTPException(403, "A parish secretary must release certificates")
    if payload.status == "signature" and row.status == "processing" and user.role not in {"Admin", "Parish Secretary"}: raise HTTPException(403, "Only an administrator or parish secretary can prepare certificates")
    if payload.status not in {next_status, "cancelled", "revoked"}:
        raise HTTPException(409, "That certificate status transition is not allowed")
    if row.status in {"released", "cancelled", "revoked"}:
        raise HTTPException(409, "This certificate is already in a final status")
    row.status = payload.status
    history = list(row.history or []); history.append({"date": datetime.now(UTC).isoformat(), "text": f"Status changed to {payload.status}" + (f": {payload.note}" if payload.note else "")}); row.history = history
    db.commit(); db.refresh(row)
    return {"id": row.id, "number": row.number, "status": row.status, "history": row.history}


@router.get("/users", response_model=list[UserOut])
def list_users(user: StaffUser, db: DbSession, role: str | None = None):
    if user.role != "Admin" and not (user.role == "Parish Secretary" and role == "Parishioner"):
        raise HTTPException(403, "Administrator access required")
    query = select(User).order_by(User.name)
    if role: query = query.where(User.role == role)
    return db.scalars(query.limit(250)).all()


@router.post("/users", response_model=UserOut, status_code=201)
def create_staff(payload: StaffCreateIn, _: AdminUser, db: DbSession):
    email = str(payload.email).lower()
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(409, "An account with this email already exists")
    from app.core.security import hash_password
    row = User(email=email, name=payload.name.strip(), hashed_password=hash_password(payload.password), role=payload.role, contact_number=payload.contact_number, barangay=payload.barangay)
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, admin: AdminUser, db: DbSession):
    row = db.get(User, user_id)
    if not row: raise HTTPException(404, "User not found")
    if row.id == admin.id and payload.status == "inactive": raise HTTPException(409, "You cannot deactivate your own account")
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(row, key, value)
    db.commit(); db.refresh(row)
    return row


@router.get("/records")
def list_records(_: OfficeStaff, db: DbSession, sacrament_type: str | None = None, query: str | None = None, limit: int = Query(default=100, ge=1, le=250), offset: int = Query(default=0, ge=0)):
    statement = select(ParishRecord).order_by(ParishRecord.record_date.desc(), ParishRecord.id.desc()).limit(limit).offset(offset)
    if sacrament_type: statement = statement.where(ParishRecord.sacrament_type == sacrament_type)
    if query: statement = statement.where(ParishRecord.person_name.ilike(f"%{query}%"))
    return [{"id": r.id, "type": r.sacrament_type, "record_number": r.record_number, "name": r.person_name, "date": r.record_date.isoformat() if r.record_date else None, "details": r.details or {}} for r in db.scalars(statement).all()]


@router.post("/records", status_code=201)
def create_record(payload: RecordIn, _: OfficeStaff, db: DbSession):
    row = ParishRecord(**payload.model_dump()); db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "type": row.sacrament_type, "record_number": row.record_number, "name": row.person_name, "date": row.record_date.isoformat() if row.record_date else None, "details": row.details}


@router.patch("/records/{record_id}")
def update_record(record_id: int, payload: RecordPatch, _: OfficeStaff, db: DbSession):
    row = db.get(ParishRecord, record_id)
    if not row: raise HTTPException(404, "Record not found")
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(row, key, value)
    db.commit(); db.refresh(row)
    return {"id": row.id, "type": row.sacrament_type, "record_number": row.record_number, "name": row.person_name, "date": row.record_date.isoformat() if row.record_date else None, "details": row.details or {}}


@router.delete("/records/{record_id}", status_code=204)
def delete_record(record_id: int, admin: OfficeStaff, db: DbSession):
    row = db.get(ParishRecord, record_id)
    if not row: raise HTTPException(404, "Record not found")
    db.delete(row); db.commit()


@router.get("/messages")
def list_messages(user: CurrentUser, db: DbSession, with_user: int | None = None, limit: int = Query(default=100, ge=1, le=250)):
    query = select(Message).where(or_(Message.sender_id == user.id, Message.receiver_id == user.id)).order_by(Message.created_at.desc()).limit(limit)
    if with_user: query = query.where(or_(and_(Message.sender_id == user.id, Message.receiver_id == with_user), and_(Message.sender_id == with_user, Message.receiver_id == user.id)))
    rows = list(reversed(db.scalars(query).all()))
    peer_ids = {m.receiver_id if m.sender_id == user.id else m.sender_id for m in rows}
    users = {u.id: u.name for u in db.scalars(select(User).where(User.id.in_(peer_ids | {user.id}))).all()} if rows else {}
    settings_by_peer = {s.peer_id: s.archived for s in db.scalars(select(ConversationSetting).where(ConversationSetting.owner_id == user.id, ConversationSetting.peer_id.in_(peer_ids))).all()} if peer_ids else {}
    unread_by_peer = {}
    if peer_ids:
        for peer_id, unread_count in db.execute(select(Message.sender_id, func.count()).where(Message.receiver_id == user.id, Message.sender_id.in_(peer_ids), Message.read_at.is_(None)).group_by(Message.sender_id)).all():
            unread_by_peer[peer_id] = unread_count
    return [{"id": m.id, "sender_id": m.sender_id, "sender_name": users.get(m.sender_id, ""), "receiver_id": m.receiver_id, "receiver_name": users.get(m.receiver_id, ""), "body": m.body, "created_at": m.created_at.isoformat(), "archived": settings_by_peer.get(m.receiver_id if m.sender_id == user.id else m.sender_id, False), "unread_count": unread_by_peer.get(m.receiver_id if m.sender_id == user.id else m.sender_id, 0)} for m in rows]


@router.patch("/messages/conversations/{peer_id}")
def update_conversation(peer_id: int, payload: ConversationUpdate, user: CurrentUser, db: DbSession):
    if peer_id == user.id or not db.get(User, peer_id): raise HTTPException(404, "Conversation not found")
    setting = db.scalar(select(ConversationSetting).where(ConversationSetting.owner_id == user.id, ConversationSetting.peer_id == peer_id))
    if not setting:
        setting = ConversationSetting(owner_id=user.id, peer_id=peer_id)
        db.add(setting)
    if payload.archived is not None: setting.archived = payload.archived
    messages = db.scalars(select(Message).where(Message.sender_id == peer_id, Message.receiver_id == user.id).order_by(Message.created_at.desc())).all()
    if payload.unread is False:
        for message in messages:
            if message.read_at is None: message.read_at = datetime.now(UTC).replace(tzinfo=None)
    elif payload.unread is True and messages:
        messages[0].read_at = None
    db.commit()
    return {"peer_id": peer_id, "archived": setting.archived, "unread": bool(messages and messages[0].read_at is None)}


@router.get("/messages/contacts")
def message_contacts(user: CurrentUser, db: DbSession):
    staff_roles = {"Admin", "Parish Secretary", "Parish Staff", "Priest"}
    if user.role in staff_roles:
        rows = db.scalars(select(User).where(User.role == "Parishioner", User.status == "active").order_by(User.name).limit(250)).all()
    else:
        rows = db.scalars(select(User).where(User.role.in_(staff_roles), User.status == "active").order_by(User.role, User.name).limit(10)).all()
    return [{"id": row.id, "name": row.name, "role": row.role} for row in rows]


@router.post("/messages", status_code=201)
def send_message(payload: MessageIn, user: CurrentUser, db: DbSession):
    receiver = db.get(User, payload.receiver_id)
    if not receiver or receiver.status != "active": raise HTTPException(404, "Recipient not found")
    if receiver.role in {"Admin", "Parish Secretary", "Parish Staff", "Priest"} and user.role in {"Admin", "Parish Secretary", "Parish Staff", "Priest"}:
        raise HTTPException(403, "Staff messages must be addressed to a parishioner")
    row = Message(sender_id=user.id, receiver_id=receiver.id, body=payload.body.strip())
    db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "sender_id": row.sender_id, "receiver_id": row.receiver_id, "body": row.body, "created_at": row.created_at.isoformat()}


@router.get("/dashboard")
def dashboard(_: StaffUser, db: DbSession):
    return {
        "requests": db.scalar(select(func.count()).select_from(SacramentRequest)) or 0,
        "pending_requests": db.scalar(select(func.count()).select_from(SacramentRequest).where(SacramentRequest.status.in_(["pending", "under_review"]))) or 0,
        "appointments": db.scalar(select(func.count()).select_from(Appointment).where(Appointment.status.in_(["scheduled", "confirmed"]))) or 0,
        "parishioners": db.scalar(select(func.count()).select_from(User).where(User.role == "Parishioner")) or 0,
        "upcoming_events": db.scalar(select(func.count()).select_from(ParishEvent).where(ParishEvent.starts_at >= datetime.now())) or 0,
    }


@router.get("/reports")
def request_report(_: StaffUser, db: DbSession, months: int = Query(default=6, ge=1, le=24), sacrament_type: str | None = None):
    now = datetime.now(UTC).replace(tzinfo=None)
    year, month = now.year, now.month
    first_month = month - months + 1
    start_year = year + (first_month - 1) // 12
    start_month = (first_month - 1) % 12 + 1
    start_at = datetime(start_year, start_month, 1)
    resource_options = {"Appointments": (Appointment, Appointment.start_at), "Parishioners": (User, User.created_at), "Certificates": (Certificate, Certificate.created_at), "Events": (ParishEvent, ParishEvent.starts_at)}
    if sacrament_type in resource_options:
        model, date_column = resource_options[sacrament_type]
        statement = select(model.status, extract("year", date_column), extract("month", date_column), func.count()).where(date_column >= start_at)
        if sacrament_type == "Parishioners": statement = statement.where(User.role == "Parishioner")
        grouped = [(sacrament_type, row_status, row_year, row_month, count) for row_status, row_year, row_month, count in db.execute(
            statement.group_by(model.status, extract("year", date_column), extract("month", date_column))
        ).all()]
        types = [sacrament_type]
        resource_report = True
    else:
        grouped = db.execute(
            select(SacramentRequest.sacrament_type, SacramentRequest.status,
                   extract("year", SacramentRequest.created_at), extract("month", SacramentRequest.created_at), func.count())
            .where(SacramentRequest.created_at >= start_at)
            .group_by(SacramentRequest.sacrament_type, SacramentRequest.status,
                      extract("year", SacramentRequest.created_at), extract("month", SacramentRequest.created_at))
        ).all()
        resource_report = False
    keys = []
    for offset in range(months):
        month_index = start_month - 1 + offset
        keys.append((start_year + month_index // 12, month_index % 12 + 1))
    types = ["Baptism", "Marriage", "Confirmation", "Funeral"] if not resource_report else types
    selected_types = types if not sacrament_type or sacrament_type == "All requests" else [sacrament_type]
    if any(kind not in types for kind in selected_types): raise HTTPException(422, "Unknown report type")
    counts: dict[tuple[str, str, int, int], int] = {}
    for kind, request_status, row_year, row_month, count in grouped:
        counts[(kind, request_status, int(row_year), int(row_month))] = int(count)
    status_counts: dict[str, int] = {}
    type_counts = {kind: 0 for kind in types}
    monthly = []
    for y, m in keys:
        total = 0
        for kind in selected_types:
            for (record_kind, request_status, record_year, record_month), count in counts.items():
                if record_kind == kind and record_year == y and record_month == m:
                    total += count
                    type_counts[kind] = type_counts.get(kind, 0) + count
                    if resource_report:
                        labels = {
                            "Appointments": {"scheduled": "Scheduled", "confirmed": "Confirmed", "pending": "Pending", "rescheduled": "Rescheduled", "cancelled": "Cancelled", "completed": "Completed"},
                            "Parishioners": {"active": "Active", "inactive": "Inactive"},
                            "Certificates": {"processing": "In preparation", "signature": "Awaiting signature", "ready": "Ready for release", "released": "Released", "cancelled": "Cancelled", "revoked": "Revoked"},
                            "Events": {"upcoming": "Upcoming", "ongoing": "Ongoing", "completed": "Held", "cancelled": "Cancelled"},
                        }
                        bucket = labels.get(sacrament_type, {}).get(request_status, request_status.replace("_", " ").title())
                    else:
                        bucket = "Completed" if request_status == "completed" else "Rejected" if request_status == "rejected" else "Cancelled" if request_status == "cancelled" else "Pending"
                    status_counts[bucket] = status_counts.get(bucket, 0) + count
        monthly.append({"year": y, "month": m, "label": datetime(y, m, 1).strftime("%b %Y"), "count": total})
    total = sum(item["count"] for item in monthly)
    breakdown = [{"label": label, "count": count, "share": (count / total if total else 0)} for label, count in status_counts.items()]
    sacraments = [{"label": kind, "count": count, "share": (count / total if total else 0)} for kind, count in type_counts.items()]
    return {"months": monthly, "total": total, "breakdown": breakdown, "sacraments": sacraments, "sacrament_type": sacrament_type or "All requests"}
