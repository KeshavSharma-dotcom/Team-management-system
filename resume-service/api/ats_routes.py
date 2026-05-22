from fastapi import APIRouter
from fastapi import File
from fastapi import Form
from fastapi import UploadFile
from fastapi import status

from resume_checker.models.response_models import (
    ATSBreakdownResponse,
    ATSScoreResponse,
    KeywordGapResponse,
    RecruiterSummaryResponse,
)


router = APIRouter()


@router.post(
    "/analyze",
    response_model=ATSScoreResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_resume(
    job_description: str | None = Form(
        default=None,
    ),
    file: UploadFile = File(...),
) -> ATSScoreResponse:
    pipeline_result = await run_pipeline(
        file=file,
        job_description=job_description,
    )

    ats_result = pipeline_result[
        "ats_analysis"
    ]

    extracted_skill_data = pipeline_result.get(
        "skills",
        {},
    )

    return ATSScoreResponse(
        success=True,
        message=(
            "Resume ATS analysis completed successfully"
        ),
        ats_score=ats_result["ats_score"],
        breakdown=ATSBreakdownResponse(
            **ats_result["breakdown"],
        ),
        missing_sections=ats_result[
            "missing_sections"
        ],
        detected_skills=extracted_skill_data.get(
            "skills",
            [],
        ),
        recommendations=pipeline_result.get(
            "recommendations",
            [],
        ),
    )


@router.post(
    "/keyword-gap",
    response_model=KeywordGapResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_resume_keyword_gap(
    job_description: str | None = Form(
        default=None,
    ),
    file: UploadFile = File(...),
) -> KeywordGapResponse:
    pipeline_result = await run_pipeline(
        file=file,
        job_description=job_description,
    )

    keyword_analysis = pipeline_result[
        "keyword_analysis"
    ]

    return KeywordGapResponse(
        success=True,
        message=(
            "Keyword gap analysis completed successfully"
        ),
        matched_keywords=keyword_analysis[
            "matched_keywords"
        ],
        missing_keywords=keyword_analysis[
            "missing_keywords"
        ],
        match_percentage=keyword_analysis[
            "match_percentage"
        ],
        keyword_density=keyword_analysis[
            "keyword_density"
        ],
        optimization_status=keyword_analysis[
            "optimization_status"
        ],
        recommendations=keyword_analysis[
            "recommendations"
        ],
    )


@router.post(
    "/recruiter-summary",
    response_model=RecruiterSummaryResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_resume_summary(
    job_description: str | None = Form(
        default=None,
    ),
    file: UploadFile = File(...),
) -> RecruiterSummaryResponse:
    pipeline_result = await run_pipeline(
        file=file,
        job_description=job_description,
    )

    recruiter_summary = pipeline_result[
        "recruiter_summary"
    ]

    return RecruiterSummaryResponse(
        success=True,
        message=(
            "Recruiter summary generated successfully"
        ),
        summary=recruiter_summary["summary"],
        strengths=recruiter_summary["strengths"],
        weaknesses=recruiter_summary[
            "weaknesses"
        ],
        hiring_signal=recruiter_summary[
            "hiring_signal"
        ],
        missing_sections=recruiter_summary[
            "missing_sections"
        ],
    )


async def run_pipeline(
    file: UploadFile,
    job_description: str | None,
) -> dict:
    from resume_checker.services.ats import (
        pipeline_service,
    )

    return await pipeline_service.run_resume_analysis_pipeline(
        file=file,
        job_description=job_description,
    )
