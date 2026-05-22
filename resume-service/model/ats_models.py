
from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field


class ATSScoreBreakdownModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    section_score: int = Field(
        ge=0,
        le=100,
    )

    skill_score: int = Field(
        ge=0,
        le=100,
    )

    content_score: int = Field(
        ge=0,
        le=100,
    )

    format_score: int = Field(
        ge=0,
        le=100,
    )


class ATSKeywordCoverageModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    matched_keywords: list[str]

    missing_keywords: list[str]

    match_percentage: int = Field(
        ge=0,
        le=100,
    )

    optimization_status: str


class ATSFormattingAuditModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    formatting_score: int = Field(
        ge=0,
        le=100,
    )

    readability_rating: str

    issues: list[str]

    estimated_pages: int = Field(
        ge=1,
    )

    section_order: list[str]


class ATSRecruiterInsightModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    summary: str

    strengths: list[str]

    weaknesses: list[str]

    hiring_signal: str

    missing_sections: list[str]


class ATSResumeMetadataModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    page_count: int = Field(
        ge=0,
    )

    title: str | None = None

    author: str | None = None

    creator: str | None = None

    producer: str | None = None


class ATSSectionModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    section_name: str

    content: str

    word_count: int = Field(
        ge=0,
    )


class ATSExtractedSkillModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    total_skills: int = Field(
        ge=0,
    )

    skills: list[str]

    categories: dict[
        str,
        list[str],
    ]


class ATSAnalysisModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    ats_score: int = Field(
        ge=0,
        le=100,
    )

    breakdown: ATSScoreBreakdownModel

    keyword_analysis: (
        ATSKeywordCoverageModel
    )

    formatting_audit: (
        ATSFormattingAuditModel
    )

    recruiter_insights: (
        ATSRecruiterInsightModel
    )

    missing_sections: list[str]

    recommendations: list[str]


class ATSPipelineResultModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    extracted_text: str

    metadata: ATSResumeMetadataModel

    sections: list[
        ATSSectionModel
    ]

    skills: ATSExtractedSkillModel

    analysis: ATSAnalysisModel


class ATSOptimizationSuggestionModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    category: str

    priority: str

    recommendation: str

    impact_score: int = Field(
        ge=0,
        le=100,
    )


class ATSOptimizationResultModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    optimized_sections: dict[
        str,
        str,
    ]

    rewritten_bullets: list[str]

    recommendations: list[
        ATSOptimizationSuggestionModel
    ]

    predicted_ats_score: int = Field(
        ge=0,
        le=100,
    )


class ATSKeywordFrequencyModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    keyword: str

    frequency: int = Field(
        ge=0,
    )

    relevance_score: int = Field(
        ge=0,
        le=100,
    )


class ATSKeywordAnalysisResultModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    extracted_keywords: list[str]

    keyword_frequency: list[
        ATSKeywordFrequencyModel
    ]

    missing_keywords: list[str]

    matched_keywords: list[str]


class ATSHealthIndicatorModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
    )

    parser_status: str

    scoring_status: str

    ai_optimization_status: str

    keyword_analysis_status: str