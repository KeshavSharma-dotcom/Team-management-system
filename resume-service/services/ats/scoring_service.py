from statistics import mean

from resume_checker.core.constants import (
    ATS_SCORE_MAX,
    ATS_SCORE_MIN,
    DEFAULT_SECTION_WEIGHT,
    SECTION_WEIGHTS,
)
from resume_checker.exceptions.custom_exceptions import (
    ATSScoringException,
    ValidationException,
)
from resume_checker.services.ats.section_parser import (
    detect_missing_sections,
    parse_resume_sections,
)
from resume_checker.services.parsing.skill_service import (
    extract_skills,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
)


MINIMUM_RESUME_WORDS = 100

IDEAL_RESUME_WORDS = 450

MAXIMUM_RESUME_WORDS = 1200


def calculate_ats_score(
    text: str,
    parsed_sections: dict[str, str],
    job_keywords: list[str] | None = None,
) -> dict:
    try:
        cleaned_text = clean_text_for_scoring(
            text,
        )

        section_score = (
            calculate_section_score(
                parsed_sections,
            )
        )

        skill_score = calculate_skill_score(
            cleaned_text,
            job_keywords,
        )

        content_score = (
            calculate_content_quality_score(
                cleaned_text,
            )
        )

        format_score = (
            calculate_format_score(
                parsed_sections,
            )
        )

        final_score = calculate_final_score(
            [
                section_score,
                skill_score,
                content_score,
                format_score,
            ],
        )

        return {
            "ats_score": final_score,
            "breakdown": {
                "section_score": (
                    section_score
                ),
                "skill_score": (
                    skill_score
                ),
                "content_score": (
                    content_score
                ),
                "format_score": (
                    format_score
                ),
            },
            "missing_sections": (
                detect_missing_sections(
                    parsed_sections,
                )
            ),
        }

    except Exception as exc:
        raise ATSScoringException(
            message=(
                "Failed to calculate ATS score"
            ),
        ) from exc


def calculate_section_score(
    parsed_sections: dict[str, str],
) -> int:
    if not parsed_sections:
        return 0

    weighted_scores = []

    for (
        section,
        content,
    ) in parsed_sections.items():
        section_weight = (
            SECTION_WEIGHTS.get(
                section,
                DEFAULT_SECTION_WEIGHT,
            )
        )

        section_quality = (
            evaluate_section_quality(
                content,
            )
        )

        weighted_scores.append(
            section_quality
            * section_weight
        )

    normalized_score = min(
        round(mean(weighted_scores)),
        100,
    )

    return normalized_score


def evaluate_section_quality(
    content: str,
) -> int:
    word_count = len(
        content.split(),
    )

    if word_count >= 120:
        return 100

    if word_count >= 80:
        return 85

    if word_count >= 40:
        return 80

    if word_count >= 15:
        return 65

    if word_count > 0:
        return 55

    return 25


def calculate_skill_score(
    text: str,
    job_keywords: list[str] | None,
) -> int:
    extracted = extract_skills(
        text,
    )

    detected_skills = (
        extracted["skills"]
    )

    if not detected_skills:
        return 0

    base_skill_score = min(
        len(detected_skills) * 5,
        70,
    )

    if not job_keywords:
        return base_skill_score

    matched_keywords = (
        calculate_keyword_matches(
            detected_skills,
            job_keywords,
        )
    )

    keyword_bonus = min(
        matched_keywords * 6,
        30,
    )

    return min(
        base_skill_score
        + keyword_bonus,
        100,
    )


def calculate_keyword_matches(
    detected_skills: list[str],
    job_keywords: list[str],
) -> int:
    normalized_detected = {
        skill.lower().strip()
        for skill in detected_skills
    }

    normalized_keywords = {
        keyword.lower().strip()
        for keyword in job_keywords
    }

    return len(
        normalized_detected.intersection(
            normalized_keywords,
        )
    )


def calculate_content_quality_score(
    text: str,
) -> int:
    word_count = len(
        text.split(),
    )

    if word_count == 0:
        return 0

    if word_count < MINIMUM_RESUME_WORDS:
        return 50

    if (
        MINIMUM_RESUME_WORDS
        <= word_count
        <= IDEAL_RESUME_WORDS
    ):
        return 100

    if (
        IDEAL_RESUME_WORDS
        < word_count
        <= MAXIMUM_RESUME_WORDS
    ):
        return 80

    return 60


def clean_text_for_scoring(
    text: str,
) -> str:
    if not text:
        return ""

    try:
        return clean_resume_text(
            text,
        )

    except ValidationException as exc:
        if (
            "minimum_characters"
            not in exc.details
        ):
            raise

        return text.strip()


def calculate_content_score(
    text: str,
) -> int:
    return calculate_content_quality_score(
        text,
    )


def calculate_format_score(
    parsed_sections: dict[str, str],
) -> int:
    if isinstance(parsed_sections, str):
        parsed_sections = (
            parse_resume_sections(
                parsed_sections,
            )
        )

    if not parsed_sections:
        return 0

    detected_sections = len(
        parsed_sections,
    )

    if detected_sections >= 6:
        return 100

    if detected_sections >= 5:
        return 85

    if detected_sections >= 4:
        return 70

    if detected_sections >= 3:
        return 50

    return 25


def calculate_final_score(
    scores: list[int],
) -> int:
    weighted_average = round(
        mean(scores),
    )

    return max(
        ATS_SCORE_MIN,
        min(
            weighted_average,
            ATS_SCORE_MAX,
        ),
    )
