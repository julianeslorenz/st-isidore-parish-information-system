import os

os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret-key-that-is-long-enough-123456")
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("CORS_ORIGINS", '["http://testserver"]')

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.core.security import hash_password
from app.models import User
import app.api.routes.auth as auth_routes

test_engine = create_engine("sqlite+pysqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestSession = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)
sent_verification_tokens = {}


@pytest.fixture
def client(monkeypatch):
    sent_verification_tokens.clear()
    monkeypatch.setattr(auth_routes, "send_verification_email", lambda email, name, token: sent_verification_tokens.__setitem__(email, token))
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)
    with TestSession() as db:
        db.add_all([
            User(email="admin@example.org", name="Test Admin", hashed_password=hash_password("VeryStrongPassword42!"), role="Admin"),
            User(email="secretary@example.org", name="Test Secretary", hashed_password=hash_password("VeryStrongPassword42!"), role="Parish Secretary"),
            User(email="priest@example.org", name="Test Priest", hashed_password=hash_password("VeryStrongPassword42!"), role="Priest"),
        ])
        db.commit()

    def override_get_db():
        with TestSession() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(test_engine)


def token_for(client, email, password="VeryStrongPassword42!"):
    token = sent_verification_tokens.get(email)
    if token:
        verified = client.post("/api/v1/auth/verify-email", json={"token": token})
        assert verified.status_code == 200
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]
