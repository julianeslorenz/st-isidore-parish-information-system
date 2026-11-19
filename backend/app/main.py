from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError

from app.api.routes import auth, data
from app.core.config import settings
from app.db import Base, engine
from app import models  # Register table metadata before optional development table creation.


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)
    # Convert records from the retired priest-signature workflow to the
    # equivalent office-ready state so existing certificates remain usable.
    with engine.begin() as connection:
        connection.execute(
            update(models.Certificate)
            .where(models.Certificate.status == "signature")
            .values(status="ready")
        )
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type"])
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(data.router, prefix=settings.api_v1_prefix)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(_: Request, __: IntegrityError):
    return JSONResponse(status_code=409, content={"detail": "The operation conflicts with an existing record or appointment."})


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
