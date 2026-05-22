from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from api.routes import router as main_router
from api.ats_routes import router as ats_router
from api.recruiter_routes import router as recruiter_router
from api.health_routes import router as health_router

from core.config import settings
from core.logging_config import configure_logging

from middleware.size_limit import SizeLimitMiddleware
from middleware.rate_limit import RateLimitMiddleware
from middleware.security_headers import SecurityHeadersMiddleware
from middleware.request_logger import RequestLoggerMiddleware
from middleware.abuse_detection import AbuseDetectionMiddleware

from exceptions.handlers import register_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()

    yield


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        docs_url="/docs" if settings.ENABLE_DOCS else None,
        redoc_url="/redoc" if settings.ENABLE_DOCS else None,
        openapi_url="/openapi.json" if settings.ENABLE_DOCS else None,
        lifespan=lifespan,
    )

    register_middlewares(app)
    register_routes(app)
    register_exception_handlers(app)

    return app


def register_middlewares(app: FastAPI) -> None:
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestLoggerMiddleware)
    app.add_middleware(AbuseDetectionMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(SizeLimitMiddleware)


def register_routes(app: FastAPI) -> None:
    app.include_router(health_router, prefix="/health", tags=["Health"])
    app.include_router(main_router, tags=["Analysis"])
    app.include_router(ats_router, prefix="/api/ats", tags=["ATS"])
    app.include_router(recruiter_router, prefix="/api/recruiter", tags=["Recruiter"])


app = create_application()


@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
        },
    )
