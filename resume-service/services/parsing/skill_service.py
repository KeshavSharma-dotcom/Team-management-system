import re
from collections import defaultdict

from resume_checker.core.constants import (
    COMMON_SKILL_CATEGORIES,
)
from resume_checker.exceptions.custom_exceptions import (
    ValidationException,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
    normalize_keyword,
)
from resume_checker.utils.validators import (
    validate_skill_name,
)


SKILL_SEPARATOR_PATTERN = re.compile(
    r"[,|;/•]+"
)

MULTI_WORD_BOUNDARY_PATTERN = (
    r"(?<![A-Za-z0-9]){skill}(?![A-Za-z0-9])"
)


def extract_skills(
    text: str,
) -> dict:
    cleaned_text = clean_text_for_skill_extraction(
        text,
    )

    normalized_text = (
        cleaned_text.lower()
    )

    detected_skills = set()

    categorized_skills = defaultdict(
        list,
    )

    for (
        category,
        skills,
    ) in COMMON_SKILL_CATEGORIES.items():
        for skill in skills:
            normalized_skill = (
                normalize_keyword(
                    skill,
                )
            )

            if not contains_skill(
                normalized_text,
                normalized_skill,
            ):
                continue

            validated_skill = (
                validate_skill_name(
                    normalized_skill,
                )
            )

            detected_skills.add(
                validated_skill,
            )

            categorized_skills[
                category
            ].append(
                validated_skill,
            )

    deduplicated_categories = (
        deduplicate_categories(
            categorized_skills,
        )
    )

    return {
        "skills": sorted(
            detected_skills,
        ),
        "categories": (
            deduplicated_categories
        ),
        "total_skills": len(
            detected_skills,
        ),
    }


def clean_text_for_skill_extraction(
    text: str,
) -> str:
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


def extract_skills_from_section(
    skills_section: str,
) -> list[str]:
    cleaned_section = (
        clean_resume_text(
            skills_section,
        )
    )

    raw_skills = (
        SKILL_SEPARATOR_PATTERN.split(
            cleaned_section,
        )
    )

    normalized_skills = []

    for raw_skill in raw_skills:
        normalized_skill = (
            normalize_keyword(
                raw_skill,
            )
        )

        if not normalized_skill:
            continue

        try:
            validated_skill = (
                validate_skill_name(
                    normalized_skill,
                )
            )

        except Exception:
            continue

        normalized_skills.append(
            validated_skill,
        )

    return sorted(
        set(normalized_skills),
    )


def contains_skill(
    text: str,
    skill: str,
) -> bool:
    escaped_skill = re.escape(
        skill,
    )

    pattern = (
        MULTI_WORD_BOUNDARY_PATTERN.format(
            skill=escaped_skill,
        )
    )

    return bool(
        re.search(
            pattern,
            text,
            re.IGNORECASE,
        )
    )


def deduplicate_categories(
    categorized_skills: dict,
) -> dict:
    deduplicated = {}

    for (
        category,
        skills,
    ) in categorized_skills.items():
        unique_skills = sorted(
            set(skills),
        )

        if not unique_skills:
            continue

        deduplicated[
            category
        ] = unique_skills

    return deduplicated


def categorize_skill(
    skill: str,
) -> str | None:
    normalized_skill = (
        normalize_keyword(
            skill,
        )
    )

    for (
        category,
        skills,
    ) in COMMON_SKILL_CATEGORIES.items():
        normalized_category_skills = {
            normalize_keyword(
                item,
            )
            for item in skills
        }

        if (
            normalized_skill
            in normalized_category_skills
        ):
            return category

    return None


def extract_unknown_skills(
    text: str,
    known_skills: set[str],
) -> list[str]:
    cleaned_text = clean_resume_text(
        text,
    )

    candidate_tokens = (
        tokenize_candidate_skills(
            cleaned_text,
        )
    )

    unknown_skills = []

    normalized_known_skills = {
        normalize_keyword(
            skill,
        )
        for skill in known_skills
    }

    for token in candidate_tokens:
        normalized_token = (
            normalize_keyword(
                token,
            )
        )

        if (
            normalized_token
            in normalized_known_skills
        ):
            continue

        try:
            validated_skill = (
                validate_skill_name(
                    normalized_token,
                )
            )

        except Exception:
            continue

        unknown_skills.append(
            validated_skill,
        )

    return sorted(
        set(unknown_skills),
    )


def tokenize_candidate_skills(
    text: str,
) -> list[str]:
    tokens = re.split(
        r"[\n,|;/]+",
        text,
    )

    cleaned_tokens = []

    for token in tokens:
        normalized_token = (
            token.strip()
        )

        if not normalized_token:
            continue

        if len(normalized_token) > 50:
            continue

        cleaned_tokens.append(
            normalized_token,
        )

    return cleaned_tokens
