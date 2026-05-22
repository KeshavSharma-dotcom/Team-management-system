from typing import Literal

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field
from pydantic import field_validator

from resume_checker.utils.text_cleaner import (
    normalize_keyword,
)
from resume_checker.utils.validators import (
    validate_skill_name,
    validate_url,
)


class BaseRequestModel(
    BaseModel,
):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )


class ATSResumeRequest(
    BaseRequestModel,
):
    job_description: str | None = Field(
        default=None,
        min_length=20,
        max_length=20000,
    )

    target_role: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    include_keyword_analysis: bool = True

    include_recruiter_summary: bool = True

    @field_validator(
        "job_description",
    )
    @classmethod
    def validate_job_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return value

        cleaned_value = value.strip()

        if not cleaned_value:
            raise ValueError(
                "Job description cannot be empty"
            )

        return cleaned_value


class KeywordGapRequest(
    BaseRequestModel,
):
    keywords: list[str] = Field(
        min_length=1,
        max_length=250,
    )

    strict_matching: bool = False

    @field_validator(
        "keywords",
    )
    @classmethod
    def validate_keywords(
        cls,
        values: list[str],
    ) -> list[str]:
        normalized_keywords = []

        for keyword in values:
            normalized_keyword = (
                normalize_keyword(
                    keyword,
                )
            )

            if not normalized_keyword:
                continue

            normalized_keywords.append(
                normalized_keyword,
            )

        unique_keywords = sorted(
            set(normalized_keywords),
        )

        if not unique_keywords:
            raise ValueError(
                "At least one valid keyword is required"
            )

        return unique_keywords


class SkillAnalysisRequest(
    BaseRequestModel,
):
    skills: list[str] = Field(
        min_length=1,
        max_length=200,
    )

    include_categories: bool = True

    @field_validator(
        "skills",
    )
    @classmethod
    def validate_skills(
        cls,
        values: list[str],
    ) -> list[str]:
        validated_skills = []

        for skill in values:
            validated_skill = (
                validate_skill_name(
                    skill,
                )
            )

            validated_skills.append(
                validated_skill,
            )

        return sorted(
            set(validated_skills),
        )


class RecruiterRankingRequest(
    BaseRequestModel,
):
    target_role: str = Field(
        min_length=2,
        max_length=100,
    )

    required_skills: list[str] = Field(
        min_length=1,
        max_length=100,
    )

    preferred_skills: list[str] = Field(
        default_factory=list,
        max_length=100,
    )

    minimum_ats_score: int = Field(
        default=60,
        ge=0,
        le=100,
    )

    @field_validator(
        "required_skills",
        "preferred_skills",
    )
    @classmethod
    def validate_skill_lists(
        cls,
        values: list[str],
    ) -> list[str]:
        normalized_skills = []

        for skill in values:
            validated_skill = (
                validate_skill_name(
                    skill,
                )
            )

            normalized_skills.append(
                validated_skill,
            )

        return sorted(
            set(normalized_skills),
        )


class ResumeOptimizationRequest(
    BaseRequestModel,
):
    target_role: str = Field(
        min_length=2,
        max_length=100,
    )

    target_company: str | None = Field(
        default=None,
        max_length=100,
    )

    focus_areas: list[
        Literal[
            "ats",
            "skills",
            "projects",
            "experience",
            "summary",
            "formatting",
        ]
    ] = Field(
        default_factory=list,
        max_length=10,
    )

    prioritize_keyword_matching: bool = True


class PortfolioAnalysisRequest(
    BaseRequestModel,
):
    portfolio_url: str

    github_url: str | None = None

    linkedin_url: str | None = None

    @field_validator(
        "portfolio_url",
        "github_url",
        "linkedin_url",
    )
    @classmethod
    def validate_optional_urls(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return value

        return validate_url(
            value,
        )