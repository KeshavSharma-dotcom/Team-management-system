import mimetypes
import re
from pathlib import Path
from urllib.parse import urlparse

from fastapi import UploadFile

from resume_checker.core.constants import (
    SUPPORTED_FILE_EXTENSIONS,
    SUPPORTED_MIME_TYPES,
)
from resume_checker.core.security import (
    validate_content_type,
    validate_file_extension,
)
from resume_checker.exceptions.custom_exceptions import (
    FileValidationException,
    UnsupportedFileTypeException,
    ValidationException,
)


EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
)

PHONE_PATTERN = re.compile(
    r"^\+?[0-9\s\-()]{7,20}$"
)

LINKEDIN_PATTERN = re.compile(
    r"^(https?:\/\/)?(www\.)?linkedin\.com\/.*$",
    re.IGNORECASE,
)

GITHUB_PATTERN = re.compile(
    r"^(https?:\/\/)?(www\.)?github\.com\/.*$",
    re.IGNORECASE,
)

URL_PATTERN = re.compile(
    r"^(https?:\/\/)?.+\..+$",
    re.IGNORECASE,
)

SKILL_PATTERN = re.compile(
    r"^[a-zA-Z0-9\s\-\+#\.]{1,50}$"
)


def validate_resume_upload(
    file: UploadFile,
) -> None:
    validate_file_object(file)
    validate_file_extension(
        file.filename,
    )
    validate_content_type(
        file.content_type,
    )
    validate_mime_extension_match(
        file.filename,
        file.content_type,
    )


def validate_file_object(
    file: UploadFile,
) -> None:
    if not file:
        raise FileValidationException(
            message="File is required",
        )

    if not file.filename:
        raise FileValidationException(
            message="Filename is missing",
        )

    if not file.content_type:
        raise FileValidationException(
            message=(
                "Content type is missing"
            ),
        )


def validate_email(
    email: str,
) -> str:
    normalized_email = (
        email.strip().lower()
    )

    if not normalized_email:
        raise ValidationException(
            message="Email is required",
        )

    if not EMAIL_PATTERN.match(
        normalized_email,
    ):
        raise ValidationException(
            message="Invalid email format",
        )

    return normalized_email


def validate_phone_number(
    phone: str,
) -> str:
    normalized_phone = (
        phone.strip()
    )

    if not normalized_phone:
        raise ValidationException(
            message=(
                "Phone number is required"
            ),
        )

    if not PHONE_PATTERN.match(
        normalized_phone,
    ):
        raise ValidationException(
            message=(
                "Invalid phone number format"
            ),
        )

    return normalized_phone


def validate_linkedin_url(
    url: str,
) -> str:
    normalized_url = normalize_url(
        url,
    )

    if not LINKEDIN_PATTERN.match(
        normalized_url,
    ):
        raise ValidationException(
            message=(
                "Invalid LinkedIn URL"
            ),
        )

    return normalized_url


def validate_github_url(
    url: str,
) -> str:
    normalized_url = normalize_url(
        url,
    )

    if not GITHUB_PATTERN.match(
        normalized_url,
    ):
        raise ValidationException(
            message=(
                "Invalid GitHub URL"
            ),
        )

    return normalized_url


def validate_url(
    url: str,
) -> str:
    normalized_url = normalize_url(
        url,
    )

    parsed_url = urlparse(
        normalized_url,
    )

    if (
        not parsed_url.scheme
        or not parsed_url.netloc
    ):
        raise ValidationException(
            message="Invalid URL",
        )

    return normalized_url


def normalize_url(
    url: str,
) -> str:
    normalized_url = (
        url.strip()
    )

    if not normalized_url:
        raise ValidationException(
            message="URL is required",
        )

    if not normalized_url.startswith(
        ("http://", "https://")
    ):
        normalized_url = (
            f"https://{normalized_url}"
        )

    if not URL_PATTERN.match(
        normalized_url,
    ):
        raise ValidationException(
            message="Invalid URL format",
        )

    return normalized_url


def validate_skill_name(
    skill: str,
) -> str:
    normalized_skill = (
        skill.strip().lower()
    )

    if not normalized_skill:
        raise ValidationException(
            message="Skill is required",
        )

    if not SKILL_PATTERN.match(
        normalized_skill,
    ):
        raise ValidationException(
            message=(
                "Invalid skill format"
            ),
        )

    return normalized_skill


def validate_file_name(
    filename: str,
) -> str:
    normalized_filename = (
        filename.strip()
    )

    if not normalized_filename:
        raise ValidationException(
            message="Filename is required",
        )

    path = Path(
        normalized_filename
    )

    if (
        path.suffix.lower()
        not in SUPPORTED_FILE_EXTENSIONS
    ):
        raise UnsupportedFileTypeException(
            details={
                "supported_extensions": (
                    SUPPORTED_FILE_EXTENSIONS
                ),
            },
        )

    return normalized_filename


def validate_mime_extension_match(
    filename: str,
    content_type: str,
) -> None:
    guessed_mime_type, _ = (
        mimetypes.guess_type(
            filename,
        )
    )

    if not guessed_mime_type:
        raise UnsupportedFileTypeException(
            message=(
                "Unable to determine MIME type"
            ),
        )

    if (
        guessed_mime_type
        not in SUPPORTED_MIME_TYPES
    ):
        raise UnsupportedFileTypeException(
            message=(
                "Unsupported MIME type"
            ),
        )

    if (
        guessed_mime_type
        != content_type
    ):
        raise UnsupportedFileTypeException(
            message=(
                "MIME type does not match file extension"
            ),
            details={
                "expected": (
                    guessed_mime_type
                ),
                "received": (
                    content_type
                ),
            },
        )