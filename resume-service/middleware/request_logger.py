import logging
import time
from uuid import uuid4

from starlette.middleware.base import (
    BaseHTTPMiddleware,
)
from starlette.requests import Request
from starlette.responses import Response


logger = logging.getLogger(
    __name__,
)


EXCLUDED_PATHS = {
    "/health",
    "/health/live",
}


class RequestLoggerMiddleware(
    BaseHTTPMiddleware
):
    async def dispatch(
        self,
        request: Request,
        call_next,
    ) -> Response:
        request_id = str(
            uuid4(),
        )

        request.state.request_id = (
            request_id
        )

        start_time = time.perf_counter()

        client_ip = (
            extract_client_ip(
                request,
            )
        )

        log_request_started(
            request=request,
            request_id=request_id,
            client_ip=client_ip,
        )

        try:
            response = (
                await call_next(
                    request,
                )
            )

        except Exception:
            logger.exception(
                "request_processing_failed",
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

            raise

        process_time = round(
            (
                time.perf_counter()
                - start_time
            )
            * 1000,
            2,
        )

        response.headers[
            "X-Request-ID"
        ] = request_id

        response.headers[
            "X-Process-Time-MS"
        ] = str(
            process_time
        )

        log_request_completed(
            request=request,
            response=response,
            request_id=request_id,
            process_time=process_time,
            client_ip=client_ip,
        )

        return response


def log_request_started(
    request: Request,
    request_id: str,
    client_ip: str,
) -> None:
    if should_skip_logging(
        request.url.path,
    ):
        return

    logger.info(
        "request_started",
        extra={
            "request_id": (
                request_id
            ),
            "method": (
                request.method
            ),
            "path": (
                request.url.path
            ),
            "client_ip": (
                client_ip
            ),
            "query_params": (
                str(
                    request.query_params
                )
            ),
        },
    )


def log_request_completed(
    request: Request,
    response: Response,
    request_id: str,
    process_time: float,
    client_ip: str,
) -> None:
    if should_skip_logging(
        request.url.path,
    ):
        return

    log_payload = {
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": (
            response.status_code
        ),
        "process_time_ms": (
            process_time
        ),
        "client_ip": client_ip,
    }

    if response.status_code >= 500:
        logger.error(
            "request_completed",
            extra=log_payload,
        )

        return

    if response.status_code >= 400:
        logger.warning(
            "request_completed",
            extra=log_payload,
        )

        return

    logger.info(
        "request_completed",
        extra=log_payload,
    )


def extract_client_ip(
    request: Request,
) -> str:
    forwarded_for = (
        request.headers.get(
            "x-forwarded-for",
        )
    )

    if forwarded_for:
        return (
            forwarded_for.split(
                ","
            )[0].strip()
        )

    real_ip = request.headers.get(
        "x-real-ip",
    )

    if real_ip:
        return real_ip.strip()

    if request.client:
        return (
            request.client.host
        )

    return "unknown"


def should_skip_logging(
    path: str,
) -> bool:
    return path in EXCLUDED_PATHS