from typing import Annotated

from fastapi import Depends
from fastapi import Header
from fastapi import Request
from fastapi import UploadFile

from resume_checker.core.config import settings
from resume_checker.core.security import (
    extract_client_ip,
    sanitize_filename,
    validate_file_presence,
    validate_host_header,
)
from resume_checker.exceptions.custom_exceptions import (
    AuthenticationException,
    ValidationException,
)


async def get_request_id(
    request: Request,
) -> str:
    request_id = getattr(
        request.state,
        "request_id",
        None,
    )

    if request_id:
        return request_id

    return "unknown"


async def get_client_ip_dependency(
    request: Request,
) -> str:
    return extract_client_ip(request)


async def validate_request_host(
    request: Request,
) -> None:
    validate_host_header(request)


async def validate_upload_file(
    file: UploadFile,
) -> UploadFile:
    validate_file_presence(file)

    file.filename = sanitize_filename(
        file.filename,
    )

    return file


async def validate_content_length(
    content_length: Annotated[
        int | None,
        Header(alias="content-length"),
    ] = None,
) -> int:
    if content_length is None:
        raise ValidationException(
            message=(
                "Missing Content-Length header"
            ),
        )

    if content_length <= 0:
        raise ValidationException(
            message=(
                "Invalid Content-Length header"
            ),
        )

    if (
        content_length
        > settings.max_upload_size_bytes
    ):
        raise ValidationException(
            message=(
                "Uploaded file exceeds allowed size"
            ),
            details={
                "max_upload_size_mb": (
                    settings.MAX_UPLOAD_SIZE_MB
                ),
            },
        )

    return content_length


async def validate_api_key(
    x_api_key: Annotated[
        str | None,
        Header(alias="x-api-key"),
    ] = None,
) -> str:
    if settings.is_development:
        return "development"

    if not x_api_key:
        raise AuthenticationException(
            message="Missing API key",
        )

    expected_key = settings.OPENAI_API_KEY

    if not expected_key:
        raise AuthenticationException(
            message=(
                "Server API key configuration missing"
            ),
        )

    if x_api_key != expected_key:
        raise AuthenticationException(
            message="Invalid API key",
        )

    return x_api_key


async def get_request_context(
    request: Request,
    request_id: Annotated[
        str,
        Depends(get_request_id),
    ],
    client_ip: Annotated[
        str,
        Depends(get_client_ip_dependency),
    ],
) -> dict:
    return {
        "request_id": request_id,
        "client_ip": client_ip,
        "path": request.url.path,
        "method": request.method,
    }


RequestContext = Annotated[
    dict,
    Depends(get_request_context),
]


ValidatedUploadFile = Annotated[
    UploadFile,
    Depends(validate_upload_file),
]