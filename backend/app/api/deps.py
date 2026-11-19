from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User
from app.core.config import settings

DbSession = Annotated[Session, Depends(get_db)]
bearer = HTTPBearer(auto_error=False)
STAFF_ROLES = {"Admin", "Parish Secretary", "Parish Staff", "Priest"}
DECISION_ROLES = {"Admin", "Parish Secretary", "Parish Staff"}
OFFICE_ROLES = {"Admin", "Parish Secretary"}
CERTIFICATE_ROLES = {"Admin", "Parish Secretary"}


def current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: DbSession,
) -> User:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required", headers={"WWW-Authenticate": "Bearer"})
    if credentials is None:
        raise unauthorized
    try:
        subject = jwt.decode(credentials.credentials, settings.jwt_secret_key, algorithms=["HS256"]).get("sub")
    except InvalidTokenError:
        raise unauthorized from None
    user = db.get(User, int(subject)) if subject and str(subject).isdigit() else None
    if not user or user.status != "active":
        raise unauthorized
    return user


CurrentUser = Annotated[User, Depends(current_user)]


def require_staff(user: CurrentUser) -> User:
    if user.role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="Staff access required")
    return user


def require_admin(user: CurrentUser) -> User:
    if user.role != "Admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    return user


def require_decision_staff(user: CurrentUser) -> User:
    if user.role not in DECISION_ROLES: raise HTTPException(status_code=403, detail="Request management access required")
    return user


def require_office_staff(user: CurrentUser) -> User:
    if user.role not in OFFICE_ROLES: raise HTTPException(status_code=403, detail="Parish office access required")
    return user


def require_certificate_staff(user: CurrentUser) -> User:
    if user.role not in CERTIFICATE_ROLES: raise HTTPException(status_code=403, detail="Certificate workflow access required")
    return user


StaffUser = Annotated[User, Depends(require_staff)]
AdminUser = Annotated[User, Depends(require_admin)]
DecisionStaff = Annotated[User, Depends(require_decision_staff)]
OfficeStaff = Annotated[User, Depends(require_office_staff)]
CertificateStaff = Annotated[User, Depends(require_certificate_staff)]
