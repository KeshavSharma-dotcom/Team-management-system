from io import BytesIO
from unittest.mock import AsyncMock
from unittest.mock import patch

import pytest
from fastapi.testclient import (
    TestClient,
)

from resume_checker.main import app


client = TestClient(
    app,
)


VALID_PDF_CONTENT = (
    b"%PDF-1.4\n"
    b"1 0 obj\n"
    b"<< /Type /Catalog >>\n"
    b"endobj\n"
    b"trailer\n"
    b"<< /Root 1 0 R >>\n"
    b"%%EOF"
)


def build_pdf_upload():
    return (
        "resume.pdf",
        BytesIO(
            VALID_PDF_CONTENT
        ),
        "application/pdf",
    )


@pytest.mark.asyncio
async def test_root_endpoint_returns_success(
):
    response = client.get(
        "/",
    )

    assert (
        response.status_code
        == 200
    )

    payload = response.json()

    assert (
        payload["status"]
        == "ok"
    )

    assert (
        "service"
        in payload
    )

    assert (
        "version"
        in payload
    )


@pytest.mark.asyncio
async def test_health_endpoint_returns_success(
):
    response = client.get(
        "/health/",
    )

    assert (
        response.status_code
        == 200
    )

    payload = response.json()

    assert (
        payload["success"]
        is True
    )

    assert (
        payload["status"]
        in {
            "ok",
            "degraded",
        }
    )


@pytest.mark.asyncio
async def test_liveness_probe_returns_success(
):
    response = client.get(
        "/health/live",
    )

    assert (
        response.status_code
        == 200
    )

    payload = response.json()

    assert (
        payload["status"]
        == "ok"
    )


@pytest.mark.asyncio
async def test_readiness_probe_returns_success(
):
    response = client.get(
        "/health/ready",
    )

    assert (
        response.status_code
        == 200
    )

    payload = response.json()

    assert (
        payload["success"]
        is True
    )


@patch(
    "resume_checker.services.ats.pipeline_service.run_resume_analysis_pipeline",
    new_callable=AsyncMock,
)
@pytest.mark.asyncio
async def test_ats_analyze_endpoint_returns_analysis(
    mock_pipeline,
):
    mock_pipeline.return_value = {
        "ats_analysis": {
            "ats_score": 88,
            "breakdown": {
                "section_score": 90,
                "skill_score": 85,
                "content_score": 87,
                "format_score": 89,
            },
            "missing_sections": [],
        },
        "skills": {
            "skills": [
                "python",
                "fastapi",
            ],
        },
        "recommendations": [
            "Strong ATS compatibility",
        ],
    }

    response = client.post(
        "/api/ats/analyze",
        data={
            "job_description": (
                "Python FastAPI developer"
            ),
        },
        files={
            "file": (
                build_pdf_upload()
            )
        },
    )

    assert (
        response.status_code
        == 200
    )

    payload = response.json()

    assert (
        payload["success"]
        is True
    )

    assert (
        payload["ats_score"]
        == 88
    )

    assert (
        "breakdown"
        in payload
    )


@patch(
    "resume_checker.services.ats.pipeline_service.run_resume_analysis_pipeline",
    new_callable=AsyncMock,
)
@pytest.mark.asyncio
async def test_keyword_gap_endpoint_returns_analysis(
    mock_pipeline,
):
    mock_pipeline.return_value = {
        "keyword_analysis": {
            "matched_keywords": [
                "python",
            ],
            "missing_keywords": [
                "docker",
            ],
            "match_percentage": 75,
            "keyword_density": {
                "python": 4,
            },
            "optimization_status": (
                "moderate"
            ),
            "recommendations": [
                "Add Docker experience",
            ],
        },
    }

    response = client.post(
        "/api/ats/keyword-gap",
        data={
            "job_description": (
                "Python Docker engineer"
            ),
        },
        files={
            "file": (
                build_pdf_upload()
            )
        },
    )

    assert (
        response.status_code
        == 200
    )

    payload = response.json()

    assert (
        payload["success"]
        is True
    )

    assert (
        payload[
            "match_percentage"
        ]
        == 75
    )

    assert (
        "missing_keywords"
        in payload
    )


@patch(
    "resume_checker.services.ats.pipeline_service.run_resume_analysis_pipeline",
    new_callable=AsyncMock,
)
@pytest.mark.asyncio
async def test_recruiter_summary_endpoint_returns_summary(
    mock_pipeline,
):
    mock_pipeline.return_value = {
        "recruiter_summary": {
            "summary": (
                "Strong backend candidate"
            ),
            "strengths": [
                "FastAPI experience",
            ],
            "weaknesses": [
                "Missing Docker",
            ],
            "hiring_signal": (
                "strong"
            ),
            "missing_sections": [],
        },
    }

    response = client.post(
        "/api/ats/recruiter-summary",
        data={
            "job_description": (
                "Backend engineer"
            ),
        },
        files={
            "file": (
                build_pdf_upload()
            )
        },
    )

    assert (
        response.status_code
        == 200
    )

    payload = response.json()

    assert (
        payload["success"]
        is True
    )

    assert (
        payload[
            "hiring_signal"
        ]
        == "strong"
    )


@pytest.mark.asyncio
async def test_ats_endpoint_rejects_missing_file(
):
    response = client.post(
        "/api/ats/analyze",
        data={
            "job_description": (
                "Backend engineer"
            ),
        },
    )

    assert (
        response.status_code
        == 422
    )

    payload = response.json()

    assert (
        payload["success"]
        is False
    )


@pytest.mark.asyncio
async def test_ats_endpoint_rejects_invalid_file_type(
):
    response = client.post(
        "/api/ats/analyze",
        data={
            "job_description": (
                "Backend engineer"
            ),
        },
        files={
            "file": (
                "resume.txt",
                BytesIO(
                    b"not pdf"
                ),
                "text/plain",
            )
        },
    )

    assert (
        response.status_code
        in {
            400,
            415,
            422,
        }
    )


@pytest.mark.asyncio
async def test_nonexistent_route_returns_404(
):
    response = client.get(
        "/non-existent-route",
    )

    assert (
        response.status_code
        == 404
    )

    payload = response.json()

    assert (
        payload["success"]
        is False
    )


@pytest.mark.asyncio
async def test_request_id_header_exists(
):
    response = client.get(
        "/health/live",
    )

    assert (
        "X-Request-ID"
        in response.headers
    )


@pytest.mark.asyncio
async def test_process_time_header_exists(
):
    response = client.get(
        "/health/live",
    )

    assert (
        "X-Process-Time-MS"
        in response.headers
    )


@pytest.mark.asyncio
async def test_security_headers_exist(
):
    response = client.get(
        "/health/live",
    )

    expected_headers = [
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Content-Security-Policy",
        "Referrer-Policy",
    ]

    for header in (
        expected_headers
    ):
        assert (
            header
            in response.headers
        )


@pytest.mark.asyncio
async def test_invalid_payload_returns_validation_error(
):
    response = client.post(
        "/api/ats/analyze",
        data={
            "job_description": (
                "short"
            ),
        },
        files={
            "file": (
                build_pdf_upload()
            )
        },
    )

    assert (
        response.status_code
        == 422
    )

    payload = response.json()

    assert (
        payload["success"]
        is False
    )

    assert (
        "error"
        in payload
    )