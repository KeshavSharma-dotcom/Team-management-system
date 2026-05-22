from starlette.middleware.base import (
    BaseHTTPMiddleware,
)
from starlette.requests import Request
from starlette.responses import Response

from resume_checker.core.config import (
    settings,
)


DEFAULT_CONTENT_SECURITY_POLICY = (
    "default-src 'self'; "
    "img-src 'self' data:; "
    "style-src 'self' 'unsafe-inline'; "
    "script-src 'self'; "
    "font-src 'self'; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self';"
)


class SecurityHeadersMiddleware(
    BaseHTTPMiddleware
):
    async def dispatch(
        self,
        request: Request,
        call_next,
    ) -> Response:
        response = await call_next(
            request,
        )

        apply_security_headers(
            response,
        )

        return response


def apply_security_headers(
    response: Response,
) -> None:
    response.headers[
        "X-Content-Type-Options"
    ] = "nosniff"

    response.headers[
        "X-Frame-Options"
    ] = "DENY"

    response.headers[
        "Referrer-Policy"
    ] = (
        "strict-origin-when-cross-origin"
    )

    response.headers[
        "Permissions-Policy"
    ] = build_permissions_policy()

    response.headers[
        "Content-Security-Policy"
    ] = build_content_security_policy()

    response.headers[
        "Cross-Origin-Opener-Policy"
    ] = "same-origin"

    response.headers[
        "Cross-Origin-Resource-Policy"
    ] = "same-origin"

    response.headers[
        "Cross-Origin-Embedder-Policy"
    ] = "require-corp"

    response.headers[
        "X-Permitted-Cross-Domain-Policies"
    ] = "none"

    if settings.ENABLE_HSTS:
        response.headers[
            "Strict-Transport-Security"
        ] = (
            build_hsts_policy()
        )

    if not settings.DEBUG:
        response.headers[
            "Cache-Control"
        ] = (
            "no-store"
        )


def build_permissions_policy(
) -> str:
    permissions = {
        "accelerometer": "()",
        "camera": "()",
        "geolocation": "()",
        "gyroscope": "()",
        "magnetometer": "()",
        "microphone": "()",
        "payment": "()",
        "usb": "()",
    }

    return ", ".join(
        [
            (
                f"{feature}={policy}"
            )
            for (
                feature,
                policy,
            ) in permissions.items()
        ]
    )


def build_content_security_policy(
) -> str:
    if settings.CONTENT_SECURITY_POLICY:
        return (
            settings.CONTENT_SECURITY_POLICY
        )

    return (
        DEFAULT_CONTENT_SECURITY_POLICY
    )


def build_hsts_policy(
) -> str:
    max_age = (
        settings.HSTS_MAX_AGE
    )

    policy = (
        f"max-age={max_age}; "
        "includeSubDomains"
    )

    if settings.HSTS_PRELOAD:
        policy += "; preload"

    return policy