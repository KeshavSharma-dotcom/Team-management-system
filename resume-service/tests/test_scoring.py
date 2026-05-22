import pytest

from resume_checker.services.ats.scoring_service import (
    calculate_ats_score,
    calculate_content_score,
    calculate_format_score,
    calculate_section_score,
    calculate_skill_score,
)


VALID_RESUME_TEXT = """
John Doe

SUMMARY
Backend developer with FastAPI and Python experience.

SKILLS
Python
FastAPI
Docker
PostgreSQL

EXPERIENCE
Developed scalable APIs using FastAPI.
Implemented authentication systems.
Optimized backend performance.

PROJECTS
ATS Resume Checker Platform

EDUCATION
Bachelor of Technology
"""


VALID_PARSED_SECTIONS = {
    "summary": (
        "Backend developer"
    ),
    "skills": (
        "Python FastAPI Docker"
    ),
    "experience": (
        "Built scalable APIs"
    ),
    "projects": (
        "Resume checker"
    ),
    "education": (
        "B.Tech"
    ),
}


VALID_JOB_KEYWORDS = [
    "python",
    "fastapi",
    "docker",
    "postgresql",
]


def test_calculate_ats_score_returns_dictionary(
):
    result = calculate_ats_score(
        text=VALID_RESUME_TEXT,
        parsed_sections=(
            VALID_PARSED_SECTIONS
        ),
        job_keywords=(
            VALID_JOB_KEYWORDS
        ),
    )

    assert isinstance(
        result,
        dict,
    )


def test_calculate_ats_score_contains_expected_keys(
):
    result = calculate_ats_score(
        text=VALID_RESUME_TEXT,
        parsed_sections=(
            VALID_PARSED_SECTIONS
        ),
        job_keywords=(
            VALID_JOB_KEYWORDS
        ),
    )

    expected_keys = {
        "ats_score",
        "breakdown",
        "missing_sections",
    }

    assert expected_keys.issubset(
        result.keys(),
    )


def test_ats_score_is_between_zero_and_hundred(
):
    result = calculate_ats_score(
        text=VALID_RESUME_TEXT,
        parsed_sections=(
            VALID_PARSED_SECTIONS
        ),
        job_keywords=(
            VALID_JOB_KEYWORDS
        ),
    )

    assert (
        0
        <= result["ats_score"]
        <= 100
    )


def test_breakdown_contains_expected_scores(
):
    result = calculate_ats_score(
        text=VALID_RESUME_TEXT,
        parsed_sections=(
            VALID_PARSED_SECTIONS
        ),
        job_keywords=(
            VALID_JOB_KEYWORDS
        ),
    )

    breakdown = result[
        "breakdown"
    ]

    expected_keys = {
        "section_score",
        "skill_score",
        "content_score",
        "format_score",
    }

    assert expected_keys.issubset(
        breakdown.keys(),
    )


def test_complete_resume_scores_higher_than_incomplete_resume(
):
    incomplete_sections = {
        "skills": "Python",
    }

    complete_result = (
        calculate_ats_score(
            text=VALID_RESUME_TEXT,
            parsed_sections=(
                VALID_PARSED_SECTIONS
            ),
            job_keywords=(
                VALID_JOB_KEYWORDS
            ),
        )
    )

    incomplete_result = (
        calculate_ats_score(
            text="Python developer",
            parsed_sections=(
                incomplete_sections
            ),
            job_keywords=(
                VALID_JOB_KEYWORDS
            ),
        )
    )

    assert (
        complete_result[
            "ats_score"
        ]
        > incomplete_result[
            "ats_score"
        ]
    )


def test_missing_sections_are_detected(
):
    parsed_sections = {
        "skills": "Python",
    }

    result = calculate_ats_score(
        text="Python developer",
        parsed_sections=(
            parsed_sections
        ),
        job_keywords=(
            VALID_JOB_KEYWORDS
        ),
    )

    missing_sections = result[
        "missing_sections"
    ]

    assert (
        "experience"
        in missing_sections
    )


def test_calculate_section_score_returns_valid_integer(
):
    score = calculate_section_score(
        VALID_PARSED_SECTIONS,
    )

    assert isinstance(
        score,
        int,
    )

    assert (
        0
        <= score
        <= 100
    )


def test_calculate_skill_score_returns_valid_integer(
):
    score = calculate_skill_score(
        VALID_RESUME_TEXT,
        VALID_JOB_KEYWORDS,
    )

    assert isinstance(
        score,
        int,
    )

    assert (
        0
        <= score
        <= 100
    )


def test_calculate_content_score_returns_valid_integer(
):
    score = calculate_content_score(
        VALID_RESUME_TEXT,
    )

    assert isinstance(
        score,
        int,
    )

    assert (
        0
        <= score
        <= 100
    )


def test_calculate_format_score_returns_valid_integer(
):
    score = calculate_format_score(
        VALID_RESUME_TEXT,
    )

    assert isinstance(
        score,
        int,
    )

    assert (
        0
        <= score
        <= 100
    )


def test_keyword_alignment_improves_skill_score(
):
    high_alignment_keywords = [
        "python",
        "fastapi",
        "docker",
    ]

    low_alignment_keywords = [
        "kubernetes",
        "terraform",
        "aws",
    ]

    high_score = (
        calculate_skill_score(
            VALID_RESUME_TEXT,
            high_alignment_keywords,
        )
    )

    low_score = (
        calculate_skill_score(
            VALID_RESUME_TEXT,
            low_alignment_keywords,
        )
    )

    assert (
        high_score
        > low_score
    )


def test_empty_resume_has_lower_score(
):
    result = calculate_ats_score(
        text="",
        parsed_sections={},
        job_keywords=[],
    )

    assert (
        result["ats_score"]
        <= 50
    )


def test_resume_with_projects_section_scores_higher(
):
    without_projects = {
        "summary": (
            "Backend developer"
        ),
        "skills": (
            "Python"
        ),
        "experience": (
            "API development"
        ),
    }

    with_projects_result = (
        calculate_ats_score(
            text=VALID_RESUME_TEXT,
            parsed_sections=(
                VALID_PARSED_SECTIONS
            ),
            job_keywords=(
                VALID_JOB_KEYWORDS
            ),
        )
    )

    without_projects_result = (
        calculate_ats_score(
            text=VALID_RESUME_TEXT,
            parsed_sections=(
                without_projects
            ),
            job_keywords=(
                VALID_JOB_KEYWORDS
            ),
        )
    )

    assert (
        with_projects_result[
            "ats_score"
        ]
        >= without_projects_result[
            "ats_score"
        ]
    )


def test_duplicate_keywords_do_not_break_skill_scoring(
):
    duplicated_keywords = [
        "python",
        "python",
        "fastapi",
        "fastapi",
    ]

    score = calculate_skill_score(
        VALID_RESUME_TEXT,
        duplicated_keywords,
    )

    assert isinstance(
        score,
        int,
    )

    assert (
        0
        <= score
        <= 100
    )


def test_score_functions_handle_large_resume_text(
):
    large_resume = (
        VALID_RESUME_TEXT
        * 50
    )

    result = calculate_ats_score(
        text=large_resume,
        parsed_sections=(
            VALID_PARSED_SECTIONS
        ),
        job_keywords=(
            VALID_JOB_KEYWORDS
        ),
    )

    assert (
        0
        <= result["ats_score"]
        <= 100
    )


@pytest.mark.parametrize(
    (
        "resume_text",
        "expected_minimum_score",
    ),
    [
        (
            VALID_RESUME_TEXT,
            60,
        ),
        (
            "Python developer",
            20,
        ),
        (
            "",
            0,
        ),
    ],
)
def test_resume_quality_impacts_score(
    resume_text,
    expected_minimum_score,
):
    result = calculate_ats_score(
        text=resume_text,
        parsed_sections=(
            VALID_PARSED_SECTIONS
            if resume_text
            else {}
        ),
        job_keywords=(
            VALID_JOB_KEYWORDS
        ),
    )

    assert (
        result["ats_score"]
        >= expected_minimum_score
    )