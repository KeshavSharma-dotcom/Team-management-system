from typing import Any

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field


class BaseResponseModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )


class ErrorDetailResponse(
    BaseResponseModel,
):
    code: str

    message: str

    details: dict[str, Any] | None = None


class APIResponse(
    BaseResponseModel,
):
    success: bool = True

    request_id: str | None = None

    message: str | None = None


class ErrorResponse(
    APIResponse,
):
    success: bool = False

    error: ErrorDetailResponse


class HealthResponse(
    APIResponse,
):
    service: str

    version: str

    environment: str

    status: str


class ATSBreakdownResponse(
    BaseResponseModel,
):
    section_score: int

    skill_score: int

    content_score: int

    format_score: int


class ATSScoreResponse(
    APIResponse,
):
    ats_score: int = Field(
        ge=0,
        le=100,
    )

    breakdown: ATSBreakdownResponse

    missing_sections: list[str]

    detected_skills: list[str]

    recommendations: list[str]


class KeywordGapResponse(
    APIResponse,
):
    matched_keywords: list[str]

    missing_keywords: list[str]

    match_percentage: int = Field(
        ge=0,
        le=100,
    )

    keyword_density: dict[str, int]

    optimization_status: str

    recommendations: list[str]


class RecruiterSummaryResponse(
    APIResponse,
):
    summary: str

    strengths: list[str]

    weaknesses: list[str]

    hiring_signal: str

    missing_sections: list[str]


class SkillCategoryResponse(
    BaseResponseModel,
):
    category: str

    skills: list[str]


class SkillAnalysisResponse(
    APIResponse,
):
    skills: list[str]

    categories: dict[
        str,
        list[str],
    ]

    total_skills: int


class ResumeMetadataResponse(
    BaseResponseModel,
):
    page_count: int

    title: str | None = None

    author: str | None = None

    creator: str | None = None

    producer: str | None = None


class ResumeParsingResponse(
    APIResponse,
):
    extracted_text: str

    parsed_sections: dict[
        str,
        str,
    ]

    metadata: ResumeMetadataResponse


class ResumeOptimizationResponse(
    APIResponse,
):
    optimized_summary: str | None = None

    optimized_bullets: list[str]

    suggested_keywords: list[str]

    optimization_tips: list[str]


class RecruiterCandidateResponse(
    BaseResponseModel,
):
    candidate_id: str

    ats_score: int

    matched_skills: list[str]

    missing_skills: list[str]

    hiring_signal: str


class RecruiterRankingResponse(
    APIResponse,
):
    ranked_candidates: list[
        RecruiterCandidateResponse
    ]

    total_candidates: int


class PaginationResponse(
    BaseResponseModel,
):
    page: int

    page_size: int

    total_items: int

    total_pages: int


class PaginatedResponse(
    APIResponse,
):
    pagination: PaginationResponse

    items: list[Any]