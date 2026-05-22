import base64
import binascii
import re
from io import BytesIO

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import status
from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field
from pydantic import model_validator

from resume_checker.core.config import settings
from resume_checker.exceptions.custom_exceptions import (
    FileTooLargeException,
    InvalidPDFSignatureException,
    ValidationException,
)
from resume_checker.services.ats.scoring_service import (
    calculate_ats_score,
)
from resume_checker.services.ats.section_parser import (
    parse_resume_sections,
)
from resume_checker.services.parsing.skill_service import (
    categorize_skill,
    extract_skills,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
    normalize_keyword,
)


router = APIRouter()


TOKEN_PATTERN = re.compile(
    r"[A-Za-z][A-Za-z0-9+#.\-/]{2,}",
)


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    text: str | None = Field(
        default=None,
        max_length=300000,
    )

    pdf_base64: str | None = Field(
        default=None,
        max_length=15000000,
    )

    requirements: str = Field(
        min_length=10,
        max_length=20000,
    )

    candidate_name: str | None = Field(
        default=None,
        max_length=120,
    )

    @model_validator(mode="after")
    def validate_resume_source(
        self,
    ) -> "AnalyzeRequest":
        if self.text or self.pdf_base64:
            return self

        raise ValueError(
            "Provide resume text or a base64 encoded PDF",
        )


class SkillResult(BaseModel):
    skill: str

    category: str


class AnalyzeResponse(BaseModel):
    score: int = Field(
        ge=0,
        le=100,
    )

    matchedSkills: list[str]

    missingSkills: list[str]

    extractedSkills: list[SkillResult]

    summary: str

    recommendations: list[str]

    textStats: dict[str, int]


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_resume(
    payload: AnalyzeRequest,
) -> AnalyzeResponse:
    resume_text = await extract_resume_source_text(
        payload,
    )

    parsed_sections = parse_resume_sections(
        resume_text,
    )

    job_keywords = extract_requirement_keywords(
        payload.requirements,
    )

    ats_result = calculate_ats_score(
        text=resume_text,
        parsed_sections=parsed_sections,
        job_keywords=job_keywords,
    )

    resume_skill_data = extract_skills(
        resume_text,
    )

    requirement_skill_data = extract_skills(
        payload.requirements,
    )

    resume_skills = set(
        resume_skill_data["skills"],
    )

    requirement_skills = set(
        requirement_skill_data["skills"],
    )

    matched_skills = sorted(
        resume_skills.intersection(
            requirement_skills,
        )
    )

    missing_skills = sorted(
        requirement_skills.difference(
            resume_skills,
        )
    )

    score = adjust_score_for_requirement_match(
        ats_score=ats_result["ats_score"],
        matched_skills=matched_skills,
        requirement_skills=sorted(
            requirement_skills,
        ),
    )

    extracted_skills = build_skill_results(
        resume_skill_data,
    )

    return AnalyzeResponse(
        score=score,
        matchedSkills=matched_skills,
        missingSkills=missing_skills,
        extractedSkills=extracted_skills,
        summary=build_summary(
            score=score,
            matched=matched_skills,
            missing=missing_skills,
        ),
        recommendations=build_recommendations(
            missing=missing_skills,
            score=score,
        ),
        textStats={
            "wordCount": len(
                resume_text.split(),
            ),
            "requirementSkillCount": len(
                requirement_skills,
            ),
            "matchedRequirementSkillCount": len(
                matched_skills,
            ),
        },
    )


async def extract_resume_source_text(
    payload: AnalyzeRequest,
) -> str:
    if payload.pdf_base64:
        return await extract_pdf_base64_text(
            payload.pdf_base64,
        )

    if not payload.text:
        raise ValidationException(
            message=(
                "Provide resume text or a base64 encoded PDF"
            ),
        )

    return clean_resume_text(
        payload.text,
    )


async def extract_pdf_base64_text(
    encoded_pdf: str,
) -> str:
    stripped_pdf = strip_data_uri_prefix(
        encoded_pdf,
    )

    try:
        pdf_bytes = base64.b64decode(
            stripped_pdf,
            validate=True,
        )

    except (binascii.Error, ValueError) as exc:
        raise ValidationException(
            message="Invalid PDF base64 payload",
            details={
                "field": "pdf_base64",
            },
        ) from exc

    if len(pdf_bytes) > settings.max_upload_size_bytes:
        raise FileTooLargeException(
            details={
                "max_upload_size_mb": (
                    settings.MAX_UPLOAD_SIZE_MB
                ),
                "received_size_bytes": len(
                    pdf_bytes,
                ),
            },
        )

    if not pdf_bytes.startswith(b"%PDF"):
        raise InvalidPDFSignatureException()

    upload_file = UploadFile(
        filename="resume.pdf",
        file=BytesIO(pdf_bytes),
        headers={
            "content-type": "application/pdf",
        },
    )

    from resume_checker.services.pdf.pdf_service import (
        extract_resume_text,
    )

    extraction_result = await extract_resume_text(
        upload_file,
    )

    return extraction_result["text"]


def strip_data_uri_prefix(
    value: str,
) -> str:
    if "," not in value:
        return value.strip()

    prefix, payload = value.split(
        ",",
        1,
    )

    if prefix.lower().startswith("data:"):
        return payload.strip()

    return value.strip()


def extract_requirement_keywords(
    requirements: str,
) -> list[str]:
    normalized_requirements = normalize_keyword(
        requirements,
    )

    keywords = {
        token.strip(".,:;()[]{}<>").lower()
        for token in TOKEN_PATTERN.findall(
            normalized_requirements,
        )
    }

    return sorted(
        keyword
        for keyword in keywords
        if len(keyword) >= 3
    )


def build_skill_results(
    skill_data: dict,
) -> list[SkillResult]:
    results = []

    for skill in skill_data["skills"]:
        results.append(
            SkillResult(
                skill=skill,
                category=(
                    categorize_skill(skill)
                    or "uncategorized"
                ),
            )
        )

    return results


def adjust_score_for_requirement_match(
    ats_score: int,
    matched_skills: list[str],
    requirement_skills: list[str],
) -> int:
    if not requirement_skills:
        return ats_score

    match_ratio = (
        len(matched_skills)
        / len(requirement_skills)
    )

    requirement_score = round(
        match_ratio * 100,
    )

    return max(
        0,
        min(
            100,
            round(
                (ats_score * 0.65)
                + (requirement_score * 0.35)
            ),
        ),
    )


def build_summary(
    score: int,
    matched: list[str],
    missing: list[str],
) -> str:
    if score >= 80:
        fit = "strong"
    elif score >= 55:
        fit = "moderate"
    else:
        fit = "limited"

    matched_text = (
        ", ".join(matched[:5])
        if matched
        else "no direct requirement skills"
    )

    missing_text = (
        ", ".join(missing[:5])
        if missing
        else "no major mapped gaps"
    )

    return (
        f"This resume shows a {fit} match. "
        f"Matched skills include {matched_text}. "
        f"Missing mapped requirements include {missing_text}."
    )


def build_recommendations(
    missing: list[str],
    score: int,
) -> list[str]:
    recommendations = []

    if missing:
        recommendations.append(
            "Probe experience with: "
            + ", ".join(missing[:5])
            + "."
        )

    if score < 70:
        recommendations.append(
            "Ask for concrete project examples before shortlisting.",
        )

    recommendations.append(
        (
            "Validate seniority, ownership level, and recent "
            "hands-on usage during the interview."
        )
    )

    return recommendations
