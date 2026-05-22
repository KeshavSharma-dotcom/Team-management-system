from datetime import datetime
from datetime import timezone

from fastapi import APIRouter
from fastapi import status

from resume_checker.core.config import settings
from resume_checker.core.constants import (
    HEALTH_STATUS_DEGRADED,
    HEALTH_STATUS_FAILED,
    HEALTH_STATUS_OK,
)
from resume_checker.models.response_models import (
    HealthResponse,
)


router = APIRouter()


@router.get(
    "/",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
)
async def health_check() -> HealthResponse:
    system_status = determine_system_status()

    return HealthResponse(
        success=True,
        message="Service is healthy",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        status=system_status,
        request_id=None,
    )


@router.get(
    "/live",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
)
async def liveness_probe() -> HealthResponse:
    return HealthResponse(
        success=True,
        message="Application is alive",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        status=HEALTH_STATUS_OK,
        request_id=None,
    )


@router.get(
    "/ready",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
)
async def readiness_probe() -> HealthResponse:
    readiness_status = (
        await check_readiness()
    )

    return HealthResponse(
        success=True,
        message="Application is ready",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        status=readiness_status,
        request_id=None,
    )


@router.get(
    "/details",
    status_code=status.HTTP_200_OK,
)
async def detailed_health_check() -> dict:
    timestamp = datetime.now(
        timezone.utc,
    ).isoformat()

    checks = await run_system_checks()

    overall_status = (
        calculate_overall_status(
            checks,
        )
    )

    return {
        "success": True,
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": (
            settings.ENVIRONMENT
        ),
        "status": overall_status,
        "timestamp": timestamp,
        "checks": checks,
    }


def determine_system_status() -> str:
    if settings.DEBUG:
        return HEALTH_STATUS_DEGRADED

    return HEALTH_STATUS_OK


async def check_readiness() -> str:
    checks = await run_system_checks()

    return calculate_overall_status(
        checks,
    )


async def run_system_checks() -> dict:
    checks = {
        "application": (
            check_application_state()
        ),
        "configuration": (
            check_configuration()
        ),
        "ai_features": (
            check_ai_configuration()
        ),
    }

    return checks


def check_application_state() -> dict:
    return {
        "status": HEALTH_STATUS_OK,
        "details": (
            "Application is operational"
        ),
    }


def check_configuration() -> dict:
    if not settings.APP_NAME:
        return {
            "status": (
                HEALTH_STATUS_FAILED
            ),
            "details": (
                "Application name is missing"
            ),
        }

    if not settings.APP_VERSION:
        return {
            "status": (
                HEALTH_STATUS_FAILED
            ),
            "details": (
                "Application version is missing"
            ),
        }

    return {
        "status": HEALTH_STATUS_OK,
        "details": (
            "Configuration loaded successfully"
        ),
    }


def check_ai_configuration() -> dict:
    if not settings.ENABLE_AI_FEATURES:
        return {
            "status": (
                HEALTH_STATUS_DEGRADED
            ),
            "details": (
                "AI features are disabled"
            ),
        }

    if not settings.OPENAI_API_KEY:
        return {
            "status": (
                HEALTH_STATUS_DEGRADED
            ),
            "details": (
                "OpenAI API key is not configured"
            ),
        }

    return {
        "status": HEALTH_STATUS_OK,
        "details": (
            "AI configuration is valid"
        ),
    }


def calculate_overall_status(
    checks: dict,
) -> str:
    statuses = {
        value["status"]
        for value in checks.values()
    }

    if HEALTH_STATUS_FAILED in statuses:
        return HEALTH_STATUS_FAILED

    if HEALTH_STATUS_DEGRADED in statuses:
        return HEALTH_STATUS_DEGRADED

    return HEALTH_STATUS_OK