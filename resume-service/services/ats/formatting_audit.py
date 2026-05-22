import re

from resume_checker.services.ats.section_parser import (
    extract_section_order,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
)


IDEAL_BULLET_COUNT = 5

MAX_BULLET_COUNT = 12

IDEAL_LINE_LENGTH = 120

MAX_PAGE_ESTIMATE_LINES = 120


BULLET_PATTERN = re.compile(
    r"^[\-\*\•]\s+",
    re.MULTILINE,
)

TABLE_PATTERN = re.compile(
    r"\|.+\|"
)

MULTI_SPACE_PATTERN = re.compile(
    r"\s{4,}"
)

ALL_CAPS_PATTERN = re.compile(
    r"^[A-Z\s]{4,}$",
    re.MULTILINE,
)


def audit_resume_formatting(
    text: str,
) -> dict:
    cleaned_text = clean_resume_text(
        text,
    )

    section_order = (
        extract_section_order(
            cleaned_text,
        )
    )

    formatting_issues = []

    formatting_issues.extend(
        detect_missing_bullets(
            cleaned_text,
        )
    )

    formatting_issues.extend(
        detect_excessive_bullets(
            cleaned_text,
        )
    )

    formatting_issues.extend(
        detect_long_lines(
            cleaned_text,
        )
    )

    formatting_issues.extend(
        detect_table_usage(
            cleaned_text,
        )
    )

    formatting_issues.extend(
        detect_excessive_spacing(
            cleaned_text,
        )
    )

    formatting_issues.extend(
        detect_section_order_issues(
            section_order,
        )
    )

    formatting_score = (
        calculate_formatting_score(
            formatting_issues,
        )
    )

    return {
        "formatting_score": (
            formatting_score
        ),
        "issues": formatting_issues,
        "section_order": (
            section_order
        ),
        "estimated_pages": (
            estimate_page_count(
                cleaned_text,
            )
        ),
        "readability_rating": (
            determine_readability_rating(
                formatting_score,
            )
        ),
    }


def detect_missing_bullets(
    text: str,
) -> list[str]:
    bullet_matches = (
        BULLET_PATTERN.findall(
            text,
        )
    )

    if (
        len(bullet_matches)
        >= IDEAL_BULLET_COUNT
    ):
        return []

    return [
        (
            "Resume contains limited bullet point usage."
        )
    ]


def detect_excessive_bullets(
    text: str,
) -> list[str]:
    bullet_matches = (
        BULLET_PATTERN.findall(
            text,
        )
    )

    if (
        len(bullet_matches)
        <= MAX_BULLET_COUNT
    ):
        return []

    return [
        (
            "Resume contains excessive bullet points."
        )
    ]


def detect_long_lines(
    text: str,
) -> list[str]:
    issues = []

    lines = text.split(
        "\n",
    )

    long_lines = [
        line
        for line in lines
        if len(line)
        > IDEAL_LINE_LENGTH
    ]

    if long_lines:
        issues.append(
            (
                "Some resume lines are excessively long."
            )
        )

    return issues


def detect_table_usage(
    text: str,
) -> list[str]:
    if TABLE_PATTERN.search(
        text,
    ):
        return [
            (
                "Table-like formatting may reduce ATS compatibility."
            )
        ]

    return []


def detect_excessive_spacing(
    text: str,
) -> list[str]:
    if MULTI_SPACE_PATTERN.search(
        text,
    ):
        return [
            (
                "Resume contains inconsistent spacing."
            )
        ]

    return []


def detect_section_order_issues(
    section_order: list[str],
) -> list[str]:
    issues = []

    if not section_order:
        return [
            (
                "Resume sections could not be identified."
            )
        ]

    if (
        "experience"
        in section_order
        and "skills"
        in section_order
    ):
        experience_index = (
            section_order.index(
                "experience",
            )
        )

        skills_index = (
            section_order.index(
                "skills",
            )
        )

        if skills_index > experience_index:
            issues.append(
                (
                    "Skills section appears after experience section."
                )
            )

    return issues


def calculate_formatting_score(
    issues: list[str],
) -> int:
    if not issues:
        return 100

    deduction = len(
        issues,
    ) * 10

    return max(
        40,
        100 - deduction,
    )


def estimate_page_count(
    text: str,
) -> int:
    lines = [
        line
        for line in text.split(
            "\n",
        )
        if line.strip()
    ]

    estimated_pages = max(
        1,
        round(
            len(lines)
            / MAX_PAGE_ESTIMATE_LINES
        ),
    )

    return estimated_pages


def determine_readability_rating(
    formatting_score: int,
) -> str:
    if formatting_score >= 90:
        return "excellent"

    if formatting_score >= 75:
        return "good"

    if formatting_score >= 60:
        return "moderate"

    return "poor"