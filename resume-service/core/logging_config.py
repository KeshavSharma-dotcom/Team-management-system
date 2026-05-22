import json
import logging
import logging.config
import sys
from datetime import datetime
from datetime import timezone
from typing import Any

from resume_checker.core.config import settings


LOG_FORMAT = (
    "%(asctime)s | %(levelname)s | %(name)s | "
    "%(message)s"
)


class JsonFormatter(logging.Formatter):
    def format(
        self,
        record: logging.LogRecord,
    ) -> str:
        payload = {
            "timestamp": datetime.now(
                timezone.utc,
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        payload.update(
            extract_extra_fields(
                record,
            )
        )

        if record.exc_info:
            payload["exception"] = (
                self.formatException(
                    record.exc_info,
                )
            )

        return json.dumps(
            sanitize_sensitive_data(
                payload,
            ),
            default=str,
        )


def configure_logging() -> None:
    logging.config.dictConfig(
        build_logging_config(),
    )

    suppress_external_loggers()


def build_logging_config() -> dict[str, Any]:
    formatter_name = (
        "json"
        if settings.is_production
        else "default"
    )

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": LOG_FORMAT,
            },
            "json": {
                "()": JsonFormatter,
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": formatter_name,
                "stream": sys.stdout,
            },
        },
        "root": {
            "handlers": ["console"],
            "level": settings.LOG_LEVEL,
        },
        "loggers": {
            "uvicorn": {
                "handlers": ["console"],
                "level": settings.LOG_LEVEL,
                "propagate": False,
            },
            "uvicorn.error": {
                "handlers": ["console"],
                "level": settings.LOG_LEVEL,
                "propagate": False,
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": settings.LOG_LEVEL,
                "propagate": False,
            },
            "fastapi": {
                "handlers": ["console"],
                "level": settings.LOG_LEVEL,
                "propagate": False,
            },
        },
    }


def extract_extra_fields(
    record: logging.LogRecord,
) -> dict[str, Any]:
    reserved_fields = set(
        logging.makeLogRecord(
            {},
        ).__dict__.keys()
    )

    return {
        key: value
        for key, value in record.__dict__.items()
        if key not in reserved_fields
        and not key.startswith("_")
    }


def sanitize_sensitive_data(
    event_dict: dict[str, Any],
) -> dict[str, Any]:
    sensitive_keys = {
        "password",
        "token",
        "authorization",
        "api_key",
        "openai_api_key",
        "secret",
        "resume_text",
        "raw_resume",
        "pdf_base64",
        "file_bytes",
    }

    sanitized_event = {}

    for key, value in event_dict.items():
        normalized_key = key.lower()

        if normalized_key in sensitive_keys:
            sanitized_event[key] = "[REDACTED]"
            continue

        if isinstance(value, str) and len(value) > 5000:
            sanitized_event[key] = (
                value[:5000]
                + "...[TRUNCATED]"
            )
            continue

        sanitized_event[key] = value

    return sanitized_event


def suppress_external_loggers() -> None:
    suppressed_loggers = [
        "httpx",
        "urllib3",
        "asyncio",
        "multipart",
    ]

    for logger_name in suppressed_loggers:
        logging.getLogger(logger_name).setLevel(
            logging.WARNING,
        )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
