import logging
import traceback
from uuid import uuid4

from fastapi import FastAPI
from fastapi import Request
from fastapi.exceptions import (
    RequestValidationError,
)
from fastapi.responses import JSONResponse
from starlette.exceptions import (
    HTTPException as StarletteHTTPException,
)

from resume_checker.core.config import (
    settings,
)
from resume_checker.exceptions.custom_exceptions import (
    ResumeCheckerException,
)


logger = logging.getLogger(
    __name__,
)


def register_exception_handlers(
    app: FastAPI,
) -> None:
    app.add_exception_handler(
        ResumeCheckerException,
        handle_application_exception,
    )

    app.add_exception_handler(
        RequestValidationError,
        handle_validation_exception,
    )

    app.add_exception_handler(
        StarletteHTTPException,
        handle_http_exception,
    )

    app.add_exception_handler(
        Exception,
        handle_unexpected_exception,
    )


async def handle_application_exception(
    request: Request,
    exc: ResumeCheckerException,
) -> JSONResponse:
    request_id = (
        get_request_id(
            request,
        )
    )

    log_exception(
        request=request,
        request_id=request_id,
        status_code=exc.status_code,
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "request_id": (
                request_id
            ),
            "error": {
                "code": (
                    exc.error_code
                ),
                "message": (
                    exc.message
                ),
                "details": (
                    exc.details
                ),
            },
        },
    )


async def handle_validation_exception(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    request_id = (
        get_request_id(
            request,
        )
    )

    validation_errors = (
        build_validation_errors(
            exc.errors(),
        )
    )

    log_exception(
        request=request,
        request_id=request_id,
        status_code=422,
        error_code=(
            "request_validation_error"
        ),
        message=(
            "Request validation failed"
        ),
        details={
            "validation_errors": (
                validation_errors
            ),
        },
    )

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "request_id": (
                request_id
            ),
            "error": {
                "code": (
                    "request_validation_error"
                ),
                "message": (
                    "Invalid request payload"
                ),
                "details": {
                    "validation_errors": (
                        validation_errors
                    ),
                },
            },
        },
    )


async def handle_http_exception(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    request_id = (
        get_request_id(
            request,
        )
    )

    log_exception(
        request=request,
        request_id=request_id,
        status_code=(
            exc.status_code
        ),
        error_code="http_error",
        message=str(
            exc.detail,
        ),
        details={},
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "request_id": (
                request_id
            ),
            "error": {
                "code": "http_error",
                "message": (
                    str(exc.detail)
                ),
                "details": {},
            },
        },
    )


async def handle_unexpected_exception(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    request_id = (
        get_request_id(
            request,
        )
    )

    logger.exception(
        "unexpected_application_error",
        extra={
            "request_id": (
                request_id
            ),
            "path": (
                request.url.path
            ),
            "method": (
                request.method
            ),
        },
    )

    if settings.DEBUG:
        details = {
            "exception_type": (
                type(exc).__name__
            ),
            "traceback": (
                traceback.format_exc()
            ),
        }

    else:
        details = {}

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "request_id": (
                request_id
            ),
            "error": {
                "code": (
                    "internal_server_error"
                ),
                "message": (
                    "An unexpected error occurred"
                ),
                "details": details,
            },
        },
    )


def build_validation_errors(
    validation_errors: list[dict],
) -> list[dict]:
    formatted_errors = []

    for error in validation_errors:
        formatted_errors.append(
            {
                "field": ".".join(
                    [
                        str(item)
                        for item
                        in error.get(
                            "loc",
                            [],
                        )
                    ]
                ),
                "message": (
                    error.get(
                        "msg",
                        "Invalid value",
                    )
                ),
                "type": (
                    error.get(
                        "type",
                        "validation_error",
                    )
                ),
            }
        )

    return formatted_errors


def get_request_id(
    request: Request,
) -> str:
    existing_request_id = (
        getattr(
            request.state,
            "request_id",
            None,
        )
    )

    if existing_request_id:
        return existing_request_id

    generated_request_id = str(
        uuid4(),
    )

    request.state.request_id = (
        generated_request_id
    )

    return generated_request_id


def log_exception(
    request: Request,
    request_id: str,
    status_code: int,
    error_code: str,
    message: str,
    details: dict,
) -> None:
    log_payload = {
        "request_id": request_id,
        "path": request.url.path,
        "method": request.method,
        "status_code": status_code,
        "error_code": error_code,
        "details": details,
    }

    if status_code >= 500:
        logger.error(
            message,
            extra=log_payload,
        )

        return

    logger.warning(
        message,
        extra=log_payload,
    )