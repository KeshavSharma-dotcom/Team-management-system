from fastapi import UploadFile

from resume_checker.services.ats.keyword_gap_service import (
    analyze_keyword_gaps,
)
from resume_checker.services.ats.recruiter_summary_service import (
    generate_recruiter_summary,
)
from resume_checker.services.ats.scoring_service import (
    calculate_ats_score,
)
from resume_checker.services.ats.section_parser import (
    parse_resume_sections,
)
from resume_checker.services.parsing.skill_service import (
    extract_skills,
)
from resume_checker.services.pdf.pdf_service import (
    extract_resume_text,
)


async def run_resume_analysis_pipeline(
    file: UploadFile,
    job_description: str | None = None,
) -> dict:
    extraction_result = (
        await extract_resume_text(
            file,
        )
    )

    resume_text = (
        extraction_result["text"]
    )

    metadata = extraction_result[
        "metadata"
    ]

    parsed_sections = (
        parse_resume_sections(
            resume_text,
        )
    )

    extracted_skill_data = (
        extract_skills(
            resume_text,
        )
    )

    job_keywords = (
        extract_job_keywords(
            job_description,
        )
    )

    keyword_analysis = (
        analyze_keyword_gaps(
            resume_text,
            job_keywords,
        )
    )

    ats_result = calculate_ats_score(
        text=resume_text,
        parsed_sections=parsed_sections,
        job_keywords=job_keywords,
    )

    recruiter_summary = (
        generate_recruiter_summary(
            ats_score=ats_result[
                "ats_score"
            ],
            parsed_sections=(
                parsed_sections
            ),
            keyword_analysis=(
                keyword_analysis
            ),
            extracted_skills=(
                extracted_skill_data
            ),
        )
    )

    recommendations = (
        build_pipeline_recommendations(
            ats_result=ats_result,
            keyword_analysis=(
                keyword_analysis
            ),
        )
    )

    return {
        "resume_text": resume_text,
        "metadata": metadata,
        "parsed_sections": (
            parsed_sections
        ),
        "skills": (
            extracted_skill_data
        ),
        "keyword_analysis": (
            keyword_analysis
        ),
        "ats_analysis": ats_result,
        "recruiter_summary": (
            recruiter_summary
        ),
        "recommendations": (
            recommendations
        ),
    }


def extract_job_keywords(
    job_description: str | None,
) -> list[str]:
    if not job_description:
        return []

    normalized_description = (
        job_description.lower()
    )

    tokens = (
        normalized_description.split()
    )

    keywords = []

    for token in tokens:
        cleaned_token = (
            token.strip(
                ".,:;()[]{}<>"
            )
        )

        if len(cleaned_token) < 3:
            continue

        keywords.append(
            cleaned_token,
        )

    return sorted(
        set(keywords),
    )


def build_pipeline_recommendations(
    ats_result: dict,
    keyword_analysis: dict,
) -> list[str]:
    recommendations = []

    ats_score = ats_result[
        "ats_score"
    ]

    match_percentage = (
        keyword_analysis[
            "match_percentage"
        ]
    )

    missing_sections = ats_result[
        "missing_sections"
    ]

    if ats_score < 60:
        recommendations.append(
            (
                "Resume requires significant ATS optimization."
            )
        )

    elif ats_score < 80:
        recommendations.append(
            (
                "Resume has moderate ATS compatibility with improvement opportunities."
            )
        )

    else:
        recommendations.append(
            (
                "Resume demonstrates strong ATS compatibility."
            )
        )

    if match_percentage < 60:
        recommendations.append(
            (
                "Improve keyword alignment with the target role."
            )
        )

    if "skills" in missing_sections:
        recommendations.append(
            (
                "Add a dedicated technical skills section."
            )
        )

    if "projects" in missing_sections:
        recommendations.append(
            (
                "Include more practical project experience."
            )
        )

    if "experience" in missing_sections:
        recommendations.append(
            (
                "Add professional work experience details."
            )
        )

    if not recommendations:
        recommendations.append(
            (
                "Resume structure and content quality are well balanced."
            )
        )

    return recommendations


def build_analysis_snapshot(
    pipeline_result: dict,
) -> dict:
    ats_analysis = pipeline_result[
        "ats_analysis"
    ]

    keyword_analysis = pipeline_result[
        "keyword_analysis"
    ]

    recruiter_summary = pipeline_result[
        "recruiter_summary"
    ]

    return {
        "ats_score": ats_analysis[
            "ats_score"
        ],
        "match_percentage": (
            keyword_analysis[
                "match_percentage"
            ]
        ),
        "hiring_signal": (
            recruiter_summary[
                "hiring_signal"
            ]
        ),
        "missing_sections": (
            ats_analysis[
                "missing_sections"
            ]
        ),
        "recommendations": (
            pipeline_result[
                "recommendations"
            ]
        ),
    }