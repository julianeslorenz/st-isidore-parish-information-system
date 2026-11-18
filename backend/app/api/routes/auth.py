import hashlib
import logging
import secrets
import smtplib
import ssl
from datetime import UTC, datetime, timedelta
from email.message import EmailMessage

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token, hash_password, verify_password
from app.models import EmailVerification, User
from app.core.config import settings
from app.schemas import ChangePasswordIn, DeleteAccountIn, EmailAddressIn, EmailVerificationIn, LoginIn, PasswordResetConfirm, PasswordResetRequest, ProfileUpdate, RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)
VERIFICATION_HOURS = 24
VERIFICATION_RESEND_SECONDS = 60


def send_email(message: EmailMessage) -> None:
    if not all([settings.smtp_host, settings.smtp_username, settings.smtp_password, settings.smtp_from_email]):
        raise RuntimeError("SMTP is not configured")
    if settings.smtp_port == 465:
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=15, context=ssl.create_default_context()) as smtp:
            smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
        return
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
        smtp.ehlo()
        smtp.starttls(context=ssl.create_default_context())
        smtp.ehlo()
        smtp.login(settings.smtp_username, settings.smtp_password)
        smtp.send_message(message)


def send_verification_email(email: str, name: str, token: str) -> None:
    message = EmailMessage()
    message["Subject"] = "Verify your St. Isidore Parish account"
    message["From"] = settings.smtp_from_email
    message["To"] = email
    link = f"{settings.frontend_base_url.rstrip('/')}/verify-email?token={token}"
    message.set_content(f"Hello {name},\n\nVerify your email address within {VERIFICATION_HOURS} hours by opening this link:\n{link}\n\nIf you did not create this account, you can ignore this message.")
    send_email(message)


def send_reset_email(email: str, name: str, token: str) -> None:
    message = EmailMessage()
    message["Subject"] = "Reset your St. Isidore Parish password"
    message["From"] = settings.smtp_from_email
    message["To"] = email
    message.set_content(f"Hello {name},\n\nUse this link within one hour to reset your password:\n{settings.frontend_base_url.rstrip('/')}/reset-password?token={token}\n\nIf you did not request a reset, you can ignore this message.")
    send_email(message)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: DbSession):
    email = str(payload.email).lower()
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(email=email, name=payload.name.strip(), hashed_password=hash_password(payload.password), role="Parishioner", contact_number=payload.contact_number, barangay=payload.barangay)
    db.add(user)
    db.flush()
    token = secrets.token_urlsafe(40)
    now = datetime.now(UTC).replace(tzinfo=None)
    verification = EmailVerification(user_id=user.id, token_hash=hashlib.sha256(token.encode()).hexdigest(),
                                     expires_at=now + timedelta(hours=VERIFICATION_HOURS))
    db.add(verification)
    db.commit()
    db.refresh(user)
    email_sent = False
    try:
        send_verification_email(user.email, user.name, token)
        verification.last_sent_at = now
        db.commit()
        email_sent = True
    except Exception as exc:
        logger.error("Verification email could not be sent: %s", type(exc).__name__)
    return {
        **UserOut.model_validate(user).model_dump(mode="json"),
        "message": "Account created. Verify your email before signing in.",
        "email_sent": email_sent,
    }


@router.post("/verify-email")
def verify_email(payload: EmailVerificationIn, db: DbSession):
    digest = hashlib.sha256(payload.token.encode()).hexdigest()
    verification = db.scalar(select(EmailVerification).where(EmailVerification.token_hash == digest))
    if not verification:
        raise HTTPException(status_code=400, detail="Verification link is invalid or expired")
    if verification.verified_at:
        return {"message": "Email is already verified. You can sign in."}
    now = datetime.now(UTC).replace(tzinfo=None)
    if verification.expires_at <= now:
        raise HTTPException(status_code=400, detail="Verification link is invalid or expired")
    verification.verified_at = now
    db.commit()
    return {"message": "Email verified. You can now sign in."}


@router.post("/verification/resend", status_code=status.HTTP_202_ACCEPTED)
def resend_verification(payload: EmailAddressIn, db: DbSession):
    generic_message = "If this address has an unverified account, verification instructions will be sent."
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if not user or user.role != "Parishioner" or user.status != "active":
        return {"message": generic_message}
    verification = db.scalar(select(EmailVerification).where(EmailVerification.user_id == user.id))
    if not verification or verification.verified_at:
        return {"message": generic_message}
    now = datetime.now(UTC).replace(tzinfo=None)
    if verification.last_sent_at and (now - verification.last_sent_at).total_seconds() < VERIFICATION_RESEND_SECONDS:
        return {"message": generic_message}
    token = secrets.token_urlsafe(40)
    verification.token_hash = hashlib.sha256(token.encode()).hexdigest()
    verification.expires_at = now + timedelta(hours=VERIFICATION_HOURS)
    db.commit()
    try:
        send_verification_email(user.email, user.name, token)
        verification.last_sent_at = now
        db.commit()
    except Exception as exc:
        logger.error("Verification resend could not be sent: %s", type(exc).__name__)
    return {"message": generic_message}


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: DbSession):
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if not user or not verify_password(payload.password, user.hashed_password) or user.status != "active":
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    verification = db.scalar(select(EmailVerification).where(EmailVerification.user_id == user.id))
    if verification and not verification.verified_at:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in.")
    return TokenOut(access_token=create_access_token(str(user.id)), user=user)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(payload: DeleteAccountIn, user: CurrentUser, db: DbSession):
    if user.role != "Parishioner":
        raise HTTPException(status_code=403, detail="Only parishioners can delete their own account")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="The password is incorrect")

    verification = db.scalar(select(EmailVerification).where(EmailVerification.user_id == user.id))
    if verification:
        db.delete(verification)
    user.email = f"deleted-{user.id}-{secrets.token_hex(6)}@example.org"
    user.name = "Deleted account"
    user.hashed_password = hash_password(secrets.token_urlsafe(48))
    user.status = "inactive"
    user.contact_number = None
    user.barangay = None
    user.profile = {}
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/me", response_model=UserOut)
def update_me(payload: ProfileUpdate, user: CurrentUser, db: DbSession):
    changes = payload.model_dump(exclude_unset=True)
    if "email" in changes and changes["email"] is not None:
        email = str(changes["email"]).lower()
        duplicate = db.scalar(select(User.id).where(User.email == email, User.id != user.id))
        if duplicate: raise HTTPException(409, "An account with this email already exists")
        changes["email"] = email
    if "profile" in changes and changes["profile"] is not None:
        changes["profile"] = {**(user.profile or {}), **changes["profile"]}
    for key, value in changes.items(): setattr(user, key, value)
    db.commit(); db.refresh(user)
    return user


@router.post("/change-password", response_model=TokenOut)
def change_password(payload: ChangePasswordIn, user: CurrentUser, db: DbSession):
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(400, "Current password is incorrect")
    user.hashed_password = hash_password(payload.new_password)
    db.commit(); db.refresh(user)
    return TokenOut(access_token=create_access_token(str(user.id)), user=user)


@router.post("/password-reset", status_code=202)
def request_password_reset(payload: PasswordResetRequest, db: DbSession):
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if user and user.status == "active":
        token = secrets.token_urlsafe(40)
        user.reset_token_hash = hashlib.sha256(token.encode()).hexdigest()
        user.reset_expires_at = datetime.now(UTC).replace(tzinfo=None) + timedelta(hours=1)
        db.commit()
        try:
            send_reset_email(user.email, user.name, token)
        except Exception as exc:
            # Do not expose email-service or account-existence details to the caller.
            logger.error("Password reset email could not be sent: %s", type(exc).__name__)
    return {"message": "If an account uses that email, password reset instructions will be sent."}


@router.post("/password-reset/confirm")
def confirm_password_reset(payload: PasswordResetConfirm, db: DbSession):
    digest = hashlib.sha256(payload.token.encode()).hexdigest()
    user = db.scalar(select(User).where(User.reset_token_hash == digest, User.reset_expires_at > datetime.now(UTC).replace(tzinfo=None)))
    if not user: raise HTTPException(400, "Reset link is invalid or expired")
    user.hashed_password = hash_password(payload.password)
    user.reset_token_hash = None
    user.reset_expires_at = None
    db.commit()
    return {"message": "Password has been reset. You can now sign in."}
