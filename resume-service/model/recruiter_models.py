from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field


class RecruiterCandidateSkillModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    skill_name: str

    matched: bool

    proficiency_score: int = Field(
        ge=0,
        le=100,
    )


class RecruiterCandidateEntityModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    candidate_name: str | None = None

    emails: list[str]

    phone_numbers: list[str]

    linkedin_profiles: list[str]

    github_profiles: list[str]

    portfolio_urls: list[str]


class RecruiterCandidateScoreModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    ats_score: int = Field(
        ge=0,
        le=100,
    )

    ranking_score: int = Field(
        ge=0,
        le=100,
    )

    keyword_match_score: int = Field(
        ge=0,
        le=100,
    )

    formatting_score: int = Field(
        ge=0,
        le=100,
    )


class RecruiterCandidateInsightModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    strengths: list[str]

    weaknesses: list[str]

    hiring_signal: str

    recruiter_summary: str


class RecruiterCandidateResumeModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    candidate_id: str

    target_role: str | None = None

    years_of_experience: float = Field(
        ge=0,
    )

    extracted_skills: list[
        RecruiterCandidateSkillModel
    ]

    scorecard: (
        RecruiterCandidateScoreModel
    )

    insights: (
        RecruiterCandidateInsightModel
    )

    entities: (
        RecruiterCandidateEntityModel
    )

    missing_skills: list[str]

    matched_skills: list[str]

    recommended_for_interview: bool


class RecruiterCandidateRankingModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    candidate_id: str

    ranking_position: int = Field(
        ge=1,
    )

    ranking_score: int = Field(
        ge=0,
        le=100,
    )

    hiring_recommendation: str

    matched_skills: list[str]

    missing_skills: list[str]


class RecruiterSearchFilterModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    target_role: str | None = None

    required_skills: list[str]

    preferred_skills: list[str]

    minimum_ats_score: int = Field(
        default=60,
        ge=0,
        le=100,
    )

    minimum_experience: float = Field(
        default=0,
        ge=0,
    )


class RecruiterShortlistModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    shortlist_id: str

    role: str

    total_candidates: int = Field(
        ge=0,
    )

    shortlisted_candidates: list[
        RecruiterCandidateRankingModel
    ]


class RecruiterAnonymizedCandidateModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    candidate_id: str

    anonymized_resume: str

    redacted_fields: dict[
        str,
        list[str] | str | None
    ]


class RecruiterExportMetadataModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    exported_by: str

    export_format: str

    exported_candidates: int = Field(
        ge=0,
    )

    generated_at: str


class RecruiterExportResultModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    export_id: str

    file_name: str

    metadata: (
        RecruiterExportMetadataModel
    )

    download_url: str | None = None


class RecruiterHiringRecommendationModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    recommendation: str

    confidence_score: int = Field(
        ge=0,
        le=100,
    )

    reasoning: list[str]


class RecruiterDashboardMetricModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    total_candidates: int = Field(
        ge=0,
    )

    average_ats_score: float = Field(
        ge=0,
        le=100,
    )

    average_ranking_score: float = Field(
        ge=0,
        le=100,
    )

    strong_match_candidates: int = Field(
        ge=0,
    )

    moderate_match_candidates: int = Field(
        ge=0,
    )

    weak_match_candidates: int = Field(
        ge=0,
    )