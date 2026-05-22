import logging
import time
from collections import defaultdict
from collections import deque
from collections.abc import Awaitable
from collections.abc import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.responses import Response

from resume_checker.core.config import settings
from resume_checker.core.security import extract_client_ip


logger = logging.getLogger(__name__)


RATE_LIMIT_WINDOW_SECONDS = 60


request_history: dict[str, deque[float]] = defaultdict(
    deque,
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[
            [Request],
            Awaitable[Response],
        ],
    ) -> Response:
        if should_skip_rate_limit(request):
            return await call_next(request)

        client_ip = extract_client_ip(request)
        current_time = time.monotonic()

        prune_old_requests(
            client_ip=client_ip,
            current_time=current_time,
        )

        if is_rate_limited(client_ip):
            logger.warning(
                "rate_limit_exceeded",
                extra={
                    "path": request.url.path,
                    "method": request.method,
                    "client_ip": client_ip,
                },
            )

            return build_rate_limit_response(
                request,
            )

        request_history[client_ip].append(
            current_time,
        )

        response = await call_next(request)

        response.headers["X-RateLimit-Limit"] = str(
            settings.RATE_LIMIT_PER_MINUTE,
        )
        response.headers["X-RateLimit-Window"] = str(
            RATE_LIMIT_WINDOW_SECONDS,
        )

        return response


def should_skip_rate_limit(
    request: Request,
) -> bool:
    return request.url.path in {
        "/health",
        "/health/",
        "/health/live",
        "/health/ready",
    }


def prune_old_requests(
    client_ip: str,
    current_time: float,
) -> None:
    history = request_history[client_ip]

    while history and (
        current_time - history[0]
        > RATE_LIMIT_WINDOW_SECONDS
    ):
        history.popleft()


def is_rate_limited(
    client_ip: str,
) -> bool:
    return (
        len(request_history[client_ip])
        >= settings.RATE_LIMIT_PER_MINUTE
    )


def build_rate_limit_response(
    request: Request,
) -> JSONResponse:
    request_id = getattr(
        request.state,
        "request_id",
        None,
    )

    content = {
        "success": False,
        "error": {
            "code": "rate_limit_exceeded",
            "message": "Too many requests",
            "details": {
                "limit": settings.RATE_LIMIT_PER_MINUTE,
                "window_seconds": RATE_LIMIT_WINDOW_SECONDS,
            },
        },
    }

    if request_id:
        content["request_id"] = request_id

    return JSONResponse(
        status_code=429,
        content=content,
        headers={
            "Retry-After": str(
                RATE_LIMIT_WINDOW_SECONDS,
            ),
            "X-RateLimit-Limit": str(
                settings.RATE_LIMIT_PER_MINUTE,
            ),
            "X-RateLimit-Window": str(
                RATE_LIMIT_WINDOW_SECONDS,
            ),
        },
    )
