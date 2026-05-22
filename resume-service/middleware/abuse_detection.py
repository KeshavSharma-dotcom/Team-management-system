import logging
import re
from collections import defaultdict
from time import time

from starlette.middleware.base import (
    BaseHTTPMiddleware,
)
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.responses import Response

from resume_checker.core.security import (
    extract_client_ip,
)


logger = logging.getLogger(__name__)


REQUEST_WINDOW_SECONDS = 60

MAX_SUSPICIOUS_REQUESTS = 20

MAX_PATH_LENGTH = 2048

MAX_QUERY_LENGTH = 4096


SUSPICIOUS_PATTERNS = (
    r"\.\./",
    r"<script",
    r"union\s+select",
    r"drop\s+table",
    r"select\s+\*",
    r"sleep\(",
    r"benchmark\(",
    r"/etc/passwd",
    r"cmd=",
    r"powershell",
    r"wget\s",
    r"curl\s",
)


BLOCKED_USER_AGENTS = (
    "sqlmap",
    "nikto",
    "nmap",
    "acunetix",
    "masscan",
    "burpsuite",
    "python-requests",
)


request_tracker = defaultdict(list)


class AbuseDetectionMiddleware(
    BaseHTTPMiddleware
):
    async def dispatch(
        self,
        request: Request,
        call_next,
    ) -> Response:
        client_ip = extract_client_ip(
            request,
        )

        if is_suspicious_request(
            request,
        ):
            log_abuse_attempt(
                request=request,
                client_ip=client_ip,
                reason="suspicious_request",
            )

            return build_blocked_response(
                message=(
                    "Suspicious request detected"
                ),
            )

        if is_abusive_client(
            client_ip,
        ):
            log_abuse_attempt(
                request=request,
                client_ip=client_ip,
                reason="abusive_request_rate",
            )

            return build_blocked_response(
                message=(
                    "Too many suspicious requests"
                ),
            )

        track_request(
            client_ip,
        )

        return await call_next(
            request,
        )


def is_suspicious_request(
    request: Request,
) -> bool:
    if is_suspicious_path(
        request.url.path,
    ):
        return True

    if is_suspicious_query(
        str(request.url.query),
    ):
        return True

    if is_suspicious_user_agent(
        request.headers.get(
            "user-agent",
            "",
        ),
    ):
        return True

    return False


def is_suspicious_path(
    path: str,
) -> bool:
    normalized_path = (
        path.lower().strip()
    )

    if len(normalized_path) > MAX_PATH_LENGTH:
        return True

    return contains_suspicious_pattern(
        normalized_path,
    )


def is_suspicious_query(
    query: str,
) -> bool:
    normalized_query = (
        query.lower().strip()
    )

    if len(normalized_query) > MAX_QUERY_LENGTH:
        return True

    return contains_suspicious_pattern(
        normalized_query,
    )


def is_suspicious_user_agent(
    user_agent: str,
) -> bool:
    normalized_agent = (
        user_agent.lower().strip()
    )

    if not normalized_agent:
        return True

    return any(
        blocked_agent
        in normalized_agent
        for blocked_agent
        in BLOCKED_USER_AGENTS
    )


def contains_suspicious_pattern(
    value: str,
) -> bool:
    return any(
        re.search(
            pattern,
            value,
            re.IGNORECASE,
        )
        for pattern in SUSPICIOUS_PATTERNS
    )


def track_request(
    client_ip: str,
) -> None:
    current_time = time()

    request_tracker[
        client_ip
    ].append(current_time)

    request_tracker[
        client_ip
    ] = [
        timestamp
        for timestamp
        in request_tracker[client_ip]
        if current_time - timestamp
        <= REQUEST_WINDOW_SECONDS
    ]


def is_abusive_client(
    client_ip: str,
) -> bool:
    current_time = time()

    recent_requests = [
        timestamp
        for timestamp
        in request_tracker[client_ip]
        if current_time - timestamp
        <= REQUEST_WINDOW_SECONDS
    ]

    request_tracker[
        client_ip
    ] = recent_requests

    return (
        len(recent_requests)
        >= MAX_SUSPICIOUS_REQUESTS
    )


def log_abuse_attempt(
    request: Request,
    client_ip: str,
    reason: str,
) -> None:
    logger.warning(
        "abuse_attempt_detected",
        extra={
            "reason": reason,
            "path": request.url.path,
            "method": request.method,
            "client_ip": client_ip,
            "user_agent": request.headers.get(
                "user-agent",
                "unknown",
            ),
        },
    )


def build_blocked_response(
    message: str,
) -> JSONResponse:
    return JSONResponse(
        status_code=403,
        content={
            "success": False,
            "error": {
                "code": (
                    "request_blocked"
                ),
                "message": message,
            },
        },
    )
# }