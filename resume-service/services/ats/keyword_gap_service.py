from collections import defaultdict

from resume_checker.services.parsing.skill_service import (
    extract_skills,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
    normalize_keyword,
)


MINIMUM_KEYWORD_MATCH_PERCENTAGE = 65


def analyze_keyword_gaps(
    resume_text: str,
    job_keywords: list[str],
) -> dict:
    cleaned_resume = clean_resume_text(
        resume_text,
    )

    normalized_job_keywords = (
        normalize_keywords(
            job_keywords,
        )
    )

    extracted_resume_skills = (
        extract_skills(
            cleaned_resume,
        )
    )

    resume_skills = set(
        extracted_resume_skills[
            "skills"
        ]
    )

    matched_keywords = []
    missing_keywords = []

    for keyword in normalized_job_keywords:
        if keyword in resume_skills:
            matched_keywords.append(
                keyword,
            )

        else:
            missing_keywords.append(
                keyword,
            )

    match_percentage = (
        calculate_match_percentage(
            matched_keywords,
            normalized_job_keywords,
        )
    )

    keyword_density = (
        calculate_keyword_density(
            cleaned_resume,
            normalized_job_keywords,
        )
    )

    prioritized_missing_keywords = (
        prioritize_missing_keywords(
            missing_keywords,
        )
    )

    return {
        "matched_keywords": sorted(
            matched_keywords,
        ),
        "missing_keywords": (
            prioritized_missing_keywords
        ),
        "match_percentage": (
            match_percentage
        ),
        "keyword_density": (
            keyword_density
        ),
        "optimization_status": (
            determine_optimization_status(
                match_percentage,
            )
        ),
        "recommendations": (
            generate_keyword_recommendations(
                prioritized_missing_keywords,
                match_percentage,
            )
        ),
    }


def normalize_keywords(
    keywords: list[str],
) -> list[str]:
    normalized_keywords = []

    for keyword in keywords:
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

    return sorted(
        set(normalized_keywords),
    )


def calculate_match_percentage(
    matched_keywords: list[str],
    total_keywords: list[str],
) -> int:
    if not total_keywords:
        return 0

    match_ratio = (
        len(matched_keywords)
        / len(total_keywords)
    )

    return round(match_ratio * 100)


def calculate_keyword_density(
    resume_text: str,
    keywords: list[str],
) -> dict:
    normalized_resume = (
        resume_text.lower()
    )

    density_map = defaultdict(
        int,
    )

    for keyword in keywords:
        keyword_occurrences = (
            normalized_resume.count(
                keyword,
            )
        )

        density_map[
            keyword
        ] = keyword_occurrences

    return dict(
        sorted(
            density_map.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    )


def prioritize_missing_keywords(
    missing_keywords: list[str],
) -> list[str]:
    prioritized_keywords = sorted(
        missing_keywords,
        key=lambda keyword: (
            len(keyword.split()),
            len(keyword),
        ),
        reverse=True,
    )

    return prioritized_keywords


def determine_optimization_status(
    match_percentage: int,
) -> str:
    if (
        match_percentage
        >= 85
    ):
        return "excellent"

    if (
        match_percentage
        >= MINIMUM_KEYWORD_MATCH_PERCENTAGE
    ):
        return "good"

    if match_percentage >= 40:
        return "moderate"

    return "poor"


def generate_keyword_recommendations(
    missing_keywords: list[str],
    match_percentage: int,
) -> list[str]:
    recommendations = []

    if (
        match_percentage
        < MINIMUM_KEYWORD_MATCH_PERCENTAGE
    ):
        recommendations.append(
            (
                "Increase alignment with the job description "
                "by adding more relevant technical keywords."
            )
        )

    if missing_keywords:
        recommendations.append(
            (
                "Include missing skills naturally within "
                "experience and project sections."
            )
        )

    high_priority_keywords = (
        missing_keywords[:5]
    )

    if high_priority_keywords:
        recommendations.append(
            (
                "Prioritize adding these keywords: "
                + ", ".join(
                    high_priority_keywords
                )
            )
        )

    if (
        match_percentage
        >= 85
    ):
        recommendations.append(
            (
                "Resume demonstrates strong ATS keyword alignment."
            )
        )

    return recommendations


def extract_top_missing_keywords(
    analysis_result: dict,
    limit: int = 10,
) -> list[str]:
    missing_keywords = (
        analysis_result.get(
            "missing_keywords",
            [],
        )
    )

    return missing_keywords[:limit]


def calculate_keyword_coverage(
    analysis_result: dict,
) -> dict:
    matched_keywords = (
        analysis_result.get(
            "matched_keywords",
            [],
        )
    )

    missing_keywords = (
        analysis_result.get(
            "missing_keywords",
            [],
        )
    )

    total_keywords = (
        len(matched_keywords)
        + len(missing_keywords)
    )

    if total_keywords == 0:
        return {
            "coverage_ratio": 0,
            "matched_count": 0,
            "missing_count": 0,
        }

    coverage_ratio = round(
        (
            len(matched_keywords)
            / total_keywords
        )
        * 100
    )

    return {
        "coverage_ratio": (
            coverage_ratio
        ),
        "matched_count": len(
            matched_keywords,
        ),
        "missing_count": len(
            missing_keywords,
        ),
    }