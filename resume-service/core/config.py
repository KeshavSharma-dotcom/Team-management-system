from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


def parse_bool(
    value: str | None,
    default: bool,
) -> bool:
    if value is None:
        return default

    normalized_value = value.strip().lower()

    if normalized_value in {
        "1",
        "true",
        "yes",
        "on",
    }:
        return True

    if normalized_value in {
        "0",
        "false",
        "no",
        "off",
    }:
        return False

    return default


def parse_int(
    value: str | None,
    default: int,
) -> int:
    if value is None:
        return default

    try:
        return int(value)

    except ValueError:
        return default


def parse_csv(
    value: str | None,
    default: list[str],
) -> list[str]:
    if value is None:
        return default

    parsed_values = [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]

    return parsed_values or default


class Settings(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
        frozen=True,
    )

    APP_NAME: str = "Resume Checker API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"

    API_V1_PREFIX: str = "/api"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    ENABLE_DOCS: bool = True

    MAX_UPLOAD_SIZE_MB: int = 10
    MAX_TEXT_LENGTH: int = 200000

    RATE_LIMIT_PER_MINUTE: int = 60

    REQUEST_TIMEOUT_SECONDS: int = 30

    ALLOWED_FILE_EXTENSIONS: tuple[str, ...] = (
        ".pdf",
        ".docx",
    )

    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4.1-mini"

    LOG_LEVEL: Literal[
        "DEBUG",
        "INFO",
        "WARNING",
        "ERROR",
        "CRITICAL",
    ] = "INFO"

    ENABLE_REQUEST_LOGGING: bool = True

    ENABLE_SECURITY_HEADERS: bool = True

    CONTENT_SECURITY_POLICY: str | None = None

    ENABLE_HSTS: bool = False

    HSTS_MAX_AGE: int = 31536000

    HSTS_PRELOAD: bool = False

    ENABLE_AI_FEATURES: bool = True

    CORS_ALLOW_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            APP_NAME=(
                os.getenv("APP_NAME")
                or cls.model_fields["APP_NAME"].default
            ),
            APP_VERSION=(
                os.getenv("APP_VERSION")
                or cls.model_fields["APP_VERSION"].default
            ),
            DEBUG=parse_bool(
                os.getenv("DEBUG"),
                cls.model_fields["DEBUG"].default,
            ),
            ENVIRONMENT=(
                os.getenv("ENVIRONMENT")
                or cls.model_fields["ENVIRONMENT"].default
            ),
            API_V1_PREFIX=(
                os.getenv("API_V1_PREFIX")
                or cls.model_fields["API_V1_PREFIX"].default
            ),
            HOST=(
                os.getenv("HOST")
                or cls.model_fields["HOST"].default
            ),
            PORT=parse_int(
                os.getenv("PORT"),
                cls.model_fields["PORT"].default,
            ),
            ENABLE_DOCS=parse_bool(
                os.getenv("ENABLE_DOCS"),
                cls.model_fields["ENABLE_DOCS"].default,
            ),
            MAX_UPLOAD_SIZE_MB=parse_int(
                os.getenv("MAX_UPLOAD_SIZE_MB"),
                cls.model_fields["MAX_UPLOAD_SIZE_MB"].default,
            ),
            MAX_TEXT_LENGTH=parse_int(
                os.getenv("MAX_TEXT_LENGTH"),
                cls.model_fields["MAX_TEXT_LENGTH"].default,
            ),
            RATE_LIMIT_PER_MINUTE=parse_int(
                os.getenv("RATE_LIMIT_PER_MINUTE"),
                cls.model_fields["RATE_LIMIT_PER_MINUTE"].default,
            ),
            REQUEST_TIMEOUT_SECONDS=parse_int(
                os.getenv("REQUEST_TIMEOUT_SECONDS"),
                cls.model_fields["REQUEST_TIMEOUT_SECONDS"].default,
            ),
            ALLOWED_FILE_EXTENSIONS=tuple(
                parse_csv(
                    os.getenv("ALLOWED_FILE_EXTENSIONS"),
                    list(
                        cls.model_fields[
                            "ALLOWED_FILE_EXTENSIONS"
                        ].default
                    ),
                )
            ),
            OPENAI_API_KEY=(
                os.getenv("OPENAI_API_KEY")
                or None
            ),
            OPENAI_MODEL=(
                os.getenv("OPENAI_MODEL")
                or cls.model_fields["OPENAI_MODEL"].default
            ),
            LOG_LEVEL=(
                os.getenv("LOG_LEVEL")
                or cls.model_fields["LOG_LEVEL"].default
            ),
            ENABLE_REQUEST_LOGGING=parse_bool(
                os.getenv("ENABLE_REQUEST_LOGGING"),
                cls.model_fields[
                    "ENABLE_REQUEST_LOGGING"
                ].default,
            ),
            ENABLE_SECURITY_HEADERS=parse_bool(
                os.getenv("ENABLE_SECURITY_HEADERS"),
                cls.model_fields[
                    "ENABLE_SECURITY_HEADERS"
                ].default,
            ),
            CONTENT_SECURITY_POLICY=(
                os.getenv("CONTENT_SECURITY_POLICY")
                or None
            ),
            ENABLE_HSTS=parse_bool(
                os.getenv("ENABLE_HSTS"),
                cls.model_fields["ENABLE_HSTS"].default,
            ),
            HSTS_MAX_AGE=parse_int(
                os.getenv("HSTS_MAX_AGE"),
                cls.model_fields["HSTS_MAX_AGE"].default,
            ),
            HSTS_PRELOAD=parse_bool(
                os.getenv("HSTS_PRELOAD"),
                cls.model_fields["HSTS_PRELOAD"].default,
            ),
            ENABLE_AI_FEATURES=parse_bool(
                os.getenv("ENABLE_AI_FEATURES"),
                cls.model_fields[
                    "ENABLE_AI_FEATURES"
                ].default,
            ),
            CORS_ALLOW_ORIGINS=parse_csv(
                os.getenv("CORS_ALLOW_ORIGINS"),
                list(
                    cls.model_fields[
                        "CORS_ALLOW_ORIGINS"
                    ].default
                ),
            ),
        )

    @field_validator("PORT")
    @classmethod
    def validate_port(cls, value: int) -> int:
        if not 1 <= value <= 65535:
            raise ValueError("PORT must be between 1 and 65535")
        return value

    @field_validator("MAX_UPLOAD_SIZE_MB")
    @classmethod
    def validate_upload_size(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("MAX_UPLOAD_SIZE_MB must be greater than 0")
        return value

    @field_validator("RATE_LIMIT_PER_MINUTE")
    @classmethod
    def validate_rate_limit(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("RATE_LIMIT_PER_MINUTE must be greater than 0")
        return value

    @field_validator("REQUEST_TIMEOUT_SECONDS")
    @classmethod
    def validate_timeout(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("REQUEST_TIMEOUT_SECONDS must be greater than 0")
        return value

    @field_validator("HSTS_MAX_AGE")
    @classmethod
    def validate_hsts_max_age(cls, value: int) -> int:
        if value < 0:
            raise ValueError("HSTS_MAX_AGE cannot be negative")
        return value

    @field_validator("OPENAI_API_KEY")
    @classmethod
    def validate_openai_key(
        cls,
        value: str | None,
    ) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("OPENAI_API_KEY cannot be empty")
        return value

    @field_validator("CORS_ALLOW_ORIGINS")
    @classmethod
    def validate_cors_origins(
        cls,
        value: list[str],
    ) -> list[str]:
        if not value:
            raise ValueError("CORS_ALLOW_ORIGINS cannot be empty")
        return value

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings.from_environment()


settings = get_settings()
