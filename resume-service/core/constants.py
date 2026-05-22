from typing import Final


API_VERSION: Final[str] = "v1"


SUPPORTED_FILE_EXTENSIONS: Final[tuple[str, ...]] = (
    ".pdf",
    ".docx",
)


SUPPORTED_MIME_TYPES: Final[tuple[str, ...]] = (
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
)


MAX_PDF_PAGE_COUNT: Final[int] = 25

MIN_RESUME_CHARACTER_LENGTH: Final[int] = 50

MAX_RESUME_CHARACTER_LENGTH: Final[int] = 200000


ATS_SCORE_MIN: Final[int] = 0
ATS_SCORE_MAX: Final[int] = 100


DEFAULT_SECTION_WEIGHT: Final[float] = 1.0


SECTION_WEIGHTS: Final[dict[str, float]] = {
    "skills": 1.2,
    "experience": 1.5,
    "projects": 1.3,
    "education": 1.0,
    "certifications": 0.8,
    "summary": 0.7,
}


RESUME_SECTIONS: Final[tuple[str, ...]] = (
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "achievements",
)


SECTION_ALIASES: Final[dict[str, tuple[str, ...]]] = {
    "summary": (
        "professional summary",
        "profile",
        "career objective",
        "objective",
    ),
    "experience": (
        "work experience",
        "employment history",
        "professional experience",
    ),
    "education": (
        "academic background",
        "education details",
    ),
    "skills": (
        "technical skills",
        "core skills",
        "technologies",
    ),
    "projects": (
        "personal projects",
        "academic projects",
    ),
    "certifications": (
        "licenses",
        "courses",
    ),
}


COMMON_SKILL_CATEGORIES: Final[
    dict[str, tuple[str, ...]]
] = {
    "frontend": (
        "html",
        "css",
        "javascript",
        "react",
        "nextjs",
    ),
    "backend": (
        "python",
        "java",
        "nodejs",
        "fastapi",
        "django",
    ),
    "database": (
        "mysql",
        "postgresql",
        "mongodb",
        "redis",
    ),
    "devops": (
        "docker",
        "kubernetes",
        "aws",
        "github actions",
    ),
}


ACTION_VERBS: Final[tuple[str, ...]] = (
    "developed",
    "implemented",
    "optimized",
    "designed",
    "engineered",
    "built",
    "created",
    "improved",
    "automated",
)


CONTACT_SECTION_PATTERNS: Final[
    tuple[str, ...]
] = (
    "email",
    "phone",
    "linkedin",
    "github",
    "portfolio",
)


DEFAULT_REQUEST_TIMEOUT_SECONDS: Final[int] = 30

DEFAULT_RATE_LIMIT_PER_MINUTE: Final[int] = 60


AI_RETRY_LIMIT: Final[int] = 3

AI_MAX_TOKENS: Final[int] = 2000


LOG_TRUNCATION_LENGTH: Final[int] = 5000


HEALTH_STATUS_OK: Final[str] = "ok"

HEALTH_STATUS_DEGRADED: Final[str] = "degraded"

HEALTH_STATUS_FAILED: Final[str] = "failed"