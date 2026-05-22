import hashlib
import hmac
import secrets
from ipaddress import ip_address
from typing import Final

from fastapi import Request, UploadFile

from resume_checker.core.config import settings
from resume_checker.core.constants import (
    SUPPORTED_FILE_EXTENSIONS,
    SUPPORTED_MIME_TYPES,
)
from resume_checker.exceptions.custom_exceptions import (
    AuthenticationException,
    FileTooLargeException,
    FileValidationException,
    UnsupportedFileTypeException,
)


MAX_FILENAME_LENGTH: Final[int] = 255

ALLOWED_HOST_HEADERS: Final[set[str]] = {
    "localhost",
    "127.0.0.1",
}


def validate_uploaded_file(
    file: UploadFile,
    file_size: int,
) -> None:
    validate_file_presence(file)
    validate_file_size(file_size)
    validate_file_extension(file.filename)
    validate_content_type(file.content_type)
    validate_filename_length(file.filename)


def validate_file_presence(
    file: UploadFile,
) -> None:
    if not file:
        raise FileValidationException(
            message="No file uploaded",
        )

    if not file.filename:
        raise FileValidationException(
            message="Filename is missing",
        )


def validate_file_size(
    file_size: int,
) -> None:
    if file_size <= 0:
        raise FileValidationException(
            message="Uploaded file is empty",
        )

    if (
        file_size
        > settings.max_upload_size_bytes
    ):
        raise FileTooLargeException(
            details={
                "max_upload_size_mb": (
                    settings.MAX_UPLOAD_SIZE_MB
                ),
            },
        )


def validate_file_extension(
    filename: str,
) -> None:
    normalized_filename = filename.lower().strip()

    if "." not in normalized_filename:
        raise UnsupportedFileTypeException(
            message="File extension is missing",
        )

    is_supported = any(
        normalized_filename.endswith(extension)
        for extension in SUPPORTED_FILE_EXTENSIONS
    )

    if not is_supported:
        raise UnsupportedFileTypeException(
            details={
                "supported_extensions": (
                    SUPPORTED_FILE_EXTENSIONS
                ),
            },
        )


def validate_content_type(
    content_type: str | None,
) -> None:
    if not content_type:
        raise UnsupportedFileTypeException(
            message="Missing content type",
        )

    normalized_content_type = (
        content_type.lower().strip()
    )

    if (
        normalized_content_type
        not in SUPPORTED_MIME_TYPES
    ):
        raise UnsupportedFileTypeException(
            details={
                "supported_mime_types": (
                    SUPPORTED_MIME_TYPES
                ),
            },
        )


def validate_filename_length(
    filename: str,
) -> None:
    if len(filename) > MAX_FILENAME_LENGTH:
        raise FileValidationException(
            message="Filename is too long",
        )


def sanitize_filename(
    filename: str,
) -> str:
    sanitized = (
        filename.replace("\\", "_")
        .replace("/", "_")
        .replace("..", "_")
        .replace("\x00", "")
        .strip()
    )

    if not sanitized:
        raise FileValidationException(
            message="Invalid filename",
        )

    return sanitized


def generate_secure_token(
    length: int = 32,
) -> str:
    if length <= 0:
        raise ValueError(
            "Token length must be greater than 0"
        )

    return secrets.token_urlsafe(length)


def generate_sha256_hash(
    value: str,
) -> str:
    encoded_value = value.encode("utf-8")

    return hashlib.sha256(
        encoded_value
    ).hexdigest()


def verify_signature(
    payload: bytes,
    secret: str,
    signature: str,
) -> bool:
    expected_signature = hmac.new(
        key=secret.encode("utf-8"),
        msg=payload,
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(
        expected_signature,
        signature,
    )


def extract_client_ip(
    request: Request,
) -> str:
    forwarded_for = request.headers.get(
        "x-forwarded-for"
    )

    if forwarded_for:
        return (
            forwarded_for.split(",")[0]
            .strip()
        )

    real_ip = request.headers.get(
        "x-real-ip"
    )

    if real_ip:
        return real_ip.strip()

    if request.client:
        return request.client.host

    return "unknown"


def validate_ip_address(
    ip: str,
) -> bool:
    try:
        ip_address(ip)
        return True

    except ValueError:
        return False


def validate_host_header(
    request: Request,
) -> None:
    host = request.headers.get("host")

    if not host:
        raise AuthenticationException(
            message="Missing host header",
        )

    normalized_host = (
        host.split(":")[0]
        .lower()
        .strip()
    )

    if (
        settings.is_production
        and normalized_host
        not in ALLOWED_HOST_HEADERS
    ):
        raise AuthenticationException(
            message="Invalid host header",
        )


def mask_sensitive_value(
    value: str,
    visible_characters: int = 4,
) -> str:
    if visible_characters < 0:
        raise ValueError(
            "visible_characters cannot be negative"
        )

    if len(value) <= visible_characters:
        return "*" * len(value)

    visible_part = value[
        -visible_characters:
    ]

    masked_part = "*" * (
        len(value) - visible_characters
    )

    return masked_part + visible_part