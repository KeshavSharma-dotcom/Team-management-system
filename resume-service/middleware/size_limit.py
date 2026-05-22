from starlette.middleware.base import (
    BaseHTTPMiddleware,
)
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.responses import Response

from resume_checker.core.config import settings
from resume_checker.exceptions.custom_exceptions import (
    FileTooLargeException,
    ValidationException,
)


class SizeLimitMiddleware(
    BaseHTTPMiddleware
):
    async def dispatch(
        self,
        request: Request,
        call_next,
    ) -> Response:
        if should_skip_size_validation(
            request,
        ):
            return await call_next(
                request,
            )

        try:
            content_length = (
                extract_content_length(
                    request,
                )
            )

            validate_content_length(
                content_length,
            )

        except (
            FileTooLargeException,
            ValidationException,
        ) as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "error": {
                        "code": exc.error_code,
                        "message": exc.message,
                        "details": exc.details,
                    },
                },
            )

        return await call_next(
            request,
        )


def should_skip_size_validation(
    request: Request,
) -> bool:
    allowed_methods = {
        "POST",
        "PUT",
        "PATCH",
    }

    if request.method not in allowed_methods:
        return True

    content_type = (
        request.headers.get(
            "content-type",
            "",
        )
        .lower()
        .strip()
    )

    if not content_type:
        return True

    upload_content_types = (
        "multipart/form-data",
        "application/pdf",
        "application/octet-stream",
    )

    return not any(
        upload_type in content_type
        for upload_type in upload_content_types
    )


def extract_content_length(
    request: Request,
) -> int:
    content_length = request.headers.get(
        "content-length",
    )

    if content_length is None:
        raise ValidationException(
            message=(
                "Missing Content-Length header"
            ),
        )

    try:
        parsed_content_length = int(
            content_length,
        )

    except ValueError as exc:
        raise ValidationException(
            message=(
                "Invalid Content-Length header"
            ),
        ) from exc

    return parsed_content_length


def validate_content_length(
    content_length: int,
) -> None:
    if content_length <= 0:
        raise ValidationException(
            message=(
                "Content-Length must be greater than 0"
            ),
        )

    if (
        content_length
        > settings.max_upload_size_bytes
    ):
        raise FileTooLargeException(
            details={
                "max_upload_size_mb": (
                    settings.MAX_UPLOAD_SIZE_MB
                ),
                "received_size_bytes": (
                    content_length
                ),
            },
        )