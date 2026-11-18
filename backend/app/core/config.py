from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "St. Isidore Parish API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "mysql+pymysql://parish_app:change-me@127.0.0.1:3306/st_isidore_api?charset=utf8mb4"
    jwt_secret_key: str = ""
    jwt_access_token_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:5173"]
    auto_create_tables: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    frontend_base_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("jwt_secret_key")
    @classmethod
    def require_non_default_secret(cls, value: str) -> str:
        if len(value) < 32:
            raise ValueError("JWT_SECRET_KEY must be set to a random value of at least 32 characters")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
