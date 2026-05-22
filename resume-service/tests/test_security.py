from fastapi import FastAPI
from fastapi.testclient import (
    TestClient,
)

from resume_checker.middleware.security_headers import (
    SecurityHeadersMiddleware,
)


def create_test_application(
) -> TestClient:
    app = FastAPI()

    app.add_middleware(
        SecurityHeadersMiddleware,
    )

    @app.get("/health")
    async def health():
        return {
            "status": "ok",
        }

    return TestClient(
        app,
    )


client = create_test_application(
)


def test_security_headers_are_present(
):
    response = client.get(
        "/health",
    )

    expected_headers = [
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Content-Security-Policy",
        "Referrer-Policy",
        "Permissions-Policy",
        "Cross-Origin-Opener-Policy",
        "Cross-Origin-Resource-Policy",
        "Cross-Origin-Embedder-Policy",
        "X-Permitted-Cross-Domain-Policies",
    ]

    for header in (
        expected_headers
    ):
        assert (
            header
            in response.headers
        )


def test_x_content_type_options_is_nosniff(
):
    response = client.get(
        "/health",
    )

    assert (
        response.headers[
            "X-Content-Type-Options"
        ]
        == "nosniff"
    )


def test_x_frame_options_is_deny(
):
    response = client.get(
        "/health",
    )

    assert (
        response.headers[
            "X-Frame-Options"
        ]
        == "DENY"
    )


def test_referrer_policy_is_secure(
):
    response = client.get(
        "/health",
    )

    assert (
        response.headers[
            "Referrer-Policy"
        ]
        == (
            "strict-origin-when-cross-origin"
        )
    )


def test_permissions_policy_exists(
):
    response = client.get(
        "/health",
    )

    permissions_policy = (
        response.headers.get(
            "Permissions-Policy"
        )
    )

    assert permissions_policy

    assert (
        "camera=()"
        in permissions_policy
    )

    assert (
        "microphone=()"
        in permissions_policy
    )


def test_content_security_policy_exists(
):
    response = client.get(
        "/health",
    )

    csp = response.headers.get(
        "Content-Security-Policy"
    )

    assert csp

    assert (
        "default-src 'self'"
        in csp
    )


def test_cross_origin_opener_policy_is_same_origin(
):
    response = client.get(
        "/health",
    )

    assert (
        response.headers[
            "Cross-Origin-Opener-Policy"
        ]
        == "same-origin"
    )


def test_cross_origin_resource_policy_is_same_origin(
):
    response = client.get(
        "/health",
    )

    assert (
        response.headers[
            "Cross-Origin-Resource-Policy"
        ]
        == "same-origin"
    )


def test_cross_origin_embedder_policy_is_require_corp(
):
    response = client.get(
        "/health",
    )

    assert (
        response.headers[
            "Cross-Origin-Embedder-Policy"
        ]
        == "require-corp"
    )


def test_x_permitted_cross_domain_policies_is_none(
):
    response = client.get(
        "/health",
    )

    assert (
        response.headers[
            "X-Permitted-Cross-Domain-Policies"
        ]
        == "none"
    )


def test_security_headers_persist_on_multiple_requests(
):
    first_response = client.get(
        "/health",
    )

    second_response = client.get(
        "/health",
    )

    assert (
        first_response.headers[
            "X-Frame-Options"
        ]
        == "DENY"
    )

    assert (
        second_response.headers[
            "X-Frame-Options"
        ]
        == "DENY"
    )


def test_security_headers_exist_on_404_routes(
):
    response = client.get(
        "/non-existent-route",
    )

    assert (
        "X-Frame-Options"
        in response.headers
    )

    assert (
        "Content-Security-Policy"
        in response.headers
    )


def test_cache_control_exists_in_production(
):
    response = client.get(
        "/health",
    )

    cache_control = (
        response.headers.get(
            "Cache-Control"
        )
    )

    if cache_control:
        assert (
            cache_control
            == "no-store"
        )


def test_content_security_policy_blocks_frames(
):
    response = client.get(
        "/health",
    )

    csp = response.headers[
        "Content-Security-Policy"
    ]

    assert (
        "frame-ancestors 'none'"
        in csp
    )


def test_permissions_policy_blocks_sensitive_features(
):
    response = client.get(
        "/health",
    )

    permissions_policy = (
        response.headers[
            "Permissions-Policy"
        ]
    )

    blocked_features = [
        "camera=()",
        "microphone=()",
        "geolocation=()",
        "payment=()",
    ]

    for feature in (
        blocked_features
    ):
        assert (
            feature
            in permissions_policy
        )


def test_security_headers_do_not_modify_response_body(
):
    response = client.get(
        "/health",
    )

    payload = response.json()

    assert (
        payload["status"]
        == "ok"
    )


def test_security_headers_work_with_json_response(
):
    response = client.get(
        "/health",
    )

    assert (
        response.headers[
            "content-type"
        ].startswith(
            "application/json"
        )
    )