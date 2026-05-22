from resume_checker.services.ai.bullet_rewriter import (
    rewrite_resume_bullets,
)
from resume_checker.services.ats.formatting_audit import (
    audit_resume_formatting,
)
from resume_checker.services.ats.keyword_gap_service import (
    analyze_keyword_gaps,
)
from resume_checker.services.ats.pipeline_service import (
    run_resume_analysis_pipeline,
)
from resume_checker.services.ats.section_parser import (
    parse_resume_sections,
)


MAX_OPTIMIZATION_RECOMMENDATIONS = 10


async def optimize_resume(
    file,
    job_description: str | None = None,
    target_role: str | None = None,
) -> dict:
    pipeline_result = (
        await run_resume_analysis_pipeline(
            file=file,
            job_description=(
                job_description
            ),
        )
    )

    resume_text = pipeline_result[
        "resume_text"
    ]

    parsed_sections = (
        pipeline_result[
            "parsed_sections"
        ]
    )

    ats_analysis = (
        pipeline_result[
            "ats_analysis"
        ]
    )

    keyword_analysis = (
        pipeline_result[
            "keyword_analysis"
        ]
    )

    recruiter_summary = (
        pipeline_result[
            "recruiter_summary"
        ]
    )

    formatting_analysis = (
        audit_resume_formatting(
            resume_text,
        )
    )

    experience_bullets = (
        extract_experience_bullets(
            parsed_sections,
        )
    )

    rewritten_bullets = {}

    if experience_bullets:
        rewritten_bullets = (
            await rewrite_resume_bullets(
                bullets=(
                    experience_bullets
                ),
                target_role=(
                    target_role
                ),
                target_keywords=(
                    keyword_analysis[
                        "missing_keywords"
                    ][:10]
                ),
            )
        )

    optimization_recommendations = (
        generate_optimization_recommendations(
            ats_analysis=(
                ats_analysis
            ),
            keyword_analysis=(
                keyword_analysis
            ),
            formatting_analysis=(
                formatting_analysis
            ),
            recruiter_summary=(
                recruiter_summary
            ),
        )
    )

    optimized_sections = (
        build_optimized_sections(
            parsed_sections=(
                parsed_sections
            ),
            rewritten_bullets=(
                rewritten_bullets
            ),
        )
    )

    return {
        "ats_analysis": ats_analysis,
        "keyword_analysis": (
            keyword_analysis
        ),
        "formatting_analysis": (
            formatting_analysis
        ),
        "recruiter_summary": (
            recruiter_summary
        ),
        "optimized_sections": (
            optimized_sections
        ),
        "rewritten_bullets": (
            rewritten_bullets.get(
                "rewritten_bullets",
                [],
            )
        ),
        "recommendations": (
            optimization_recommendations
        ),
    }


def extract_experience_bullets(
    parsed_sections: dict[str, str],
) -> list[str]:
    experience_content = (
        parsed_sections.get(
            "experience",
            ""
        )
    )

    if not experience_content:
        return []

    extracted_bullets = []

    for line in experience_content.split(
        "\n",
    ):
        normalized_line = (
            line.strip()
        )

        if not normalized_line:
            continue

        if normalized_line.startswith(
            (
                "-",
                "*",
                "•",
            )
        ):
            cleaned_bullet = (
                normalized_line.lstrip(
                    "-*• "
                ).strip()
            )

            if cleaned_bullet:
                extracted_bullets.append(
                    cleaned_bullet
                )

    return extracted_bullets


def generate_optimization_recommendations(
    ats_analysis: dict,
    keyword_analysis: dict,
    formatting_analysis: dict,
    recruiter_summary: dict,
) -> list[str]:
    recommendations = []

    ats_score = ats_analysis[
        "ats_score"
    ]

    formatting_score = (
        formatting_analysis[
            "formatting_score"
        ]
    )

    keyword_match_percentage = (
        keyword_analysis[
            "match_percentage"
        ]
    )

    if ats_score < 70:
        recommendations.append(
            (
                "Improve overall ATS alignment by enhancing section completeness and keyword targeting."
            )
        )

    if keyword_match_percentage < 70:
        recommendations.append(
            (
                "Add more role-specific technical keywords throughout experience and projects."
            )
        )

    if formatting_score < 75:
        recommendations.append(
            (
                "Improve formatting consistency to increase ATS readability."
            )
        )

    missing_sections = ats_analysis[
        "missing_sections"
    ]

    if missing_sections:
        recommendations.append(
            (
                "Add missing sections: "
                + ", ".join(
                    missing_sections
                )
            )
        )

    recruiter_weaknesses = (
        recruiter_summary.get(
            "weaknesses",
            [],
        )
    )

    recommendations.extend(
        recruiter_weaknesses[
            :3
        ]
    )

    deduplicated = (
        deduplicate_recommendations(
            recommendations,
        )
    )

    return deduplicated[
        :MAX_OPTIMIZATION_RECOMMENDATIONS
    ]


def build_optimized_sections(
    parsed_sections: dict[str, str],
    rewritten_bullets: dict,
) -> dict:
    optimized_sections = dict(
        parsed_sections,
    )

    rewritten_values = (
        rewritten_bullets.get(
            "rewritten_bullets",
            [],
        )
    )

    if not rewritten_values:
        return optimized_sections

    optimized_experience = (
        "\n".join(
            [
                f"• {bullet}"
                for bullet
                in rewritten_values
            ]
        )
    )

    optimized_sections[
        "experience"
    ] = optimized_experience

    return optimized_sections


def deduplicate_recommendations(
    recommendations: list[str],
) -> list[str]:
    seen_recommendations = set()

    deduplicated = []

    for recommendation in (
        recommendations
    ):
        normalized_recommendation = (
            recommendation.strip()
            .lower()
        )

        if (
            normalized_recommendation
            in seen_recommendations
        ):
            continue

        seen_recommendations.add(
            normalized_recommendation
        )

        deduplicated.append(
            recommendation.strip()
        )

    return deduplicated


async def optimize_resume_text(
    resume_text: str,
    job_description: str | None = None,
    target_role: str | None = None,
) -> dict:
    parsed_sections = (
        parse_resume_sections(
            resume_text,
        )
    )

    job_keywords = []

    if job_description:
        keyword_analysis = (
            analyze_keyword_gaps(
                resume_text,
                job_description.split(),
            )
        )

        job_keywords = (
            keyword_analysis[
                "missing_keywords"
            ][:10]
        )

    experience_bullets = (
        extract_experience_bullets(
            parsed_sections,
        )
    )

    rewritten_bullets = {}

    if experience_bullets:
        rewritten_bullets = (
            await rewrite_resume_bullets(
                bullets=(
                    experience_bullets
                ),
                target_role=(
                    target_role
                ),
                target_keywords=(
                    job_keywords
                ),
            )
        )

    return {
        "parsed_sections": (
            parsed_sections
        ),
        "rewritten_bullets": (
            rewritten_bullets.get(
                "rewritten_bullets",
                [],
            )
        ),
    }