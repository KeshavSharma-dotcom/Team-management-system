from resume_checker.services.ats.keyword_gap_service import (
    calculate_keyword_coverage,
)
from resume_checker.services.ats.section_parser import (
    detect_missing_sections,
)


STRONG_ATS_SCORE = 85

MODERATE_ATS_SCORE = 65


def generate_recruiter_summary(
    ats_score: int,
    parsed_sections: dict[str, str],
    keyword_analysis: dict,
    extracted_skills: dict,
) -> dict:
    missing_sections = (
        detect_missing_sections(
            parsed_sections,
        )
    )

    keyword_coverage = (
        calculate_keyword_coverage(
            keyword_analysis,
        )
    )

    strengths = identify_strengths(
        ats_score=ats_score,
        parsed_sections=parsed_sections,
        keyword_coverage=keyword_coverage,
        extracted_skills=extracted_skills,
    )

    weaknesses = identify_weaknesses(
        ats_score=ats_score,
        missing_sections=missing_sections,
        keyword_coverage=keyword_coverage,
        extracted_skills=extracted_skills,
    )

    hiring_signal = (
        determine_hiring_signal(
            ats_score,
        )
    )

    summary = build_summary(
        ats_score=ats_score,
        strengths=strengths,
        weaknesses=weaknesses,
        hiring_signal=hiring_signal,
    )

    return {
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "hiring_signal": hiring_signal,
        "missing_sections": (
            missing_sections
        ),
    }


def identify_strengths(
    ats_score: int,
    parsed_sections: dict[str, str],
    keyword_coverage: dict,
    extracted_skills: dict,
) -> list[str]:
    strengths = []

    section_count = len(
        parsed_sections,
    )

    if section_count >= 5:
        strengths.append(
            (
                "Resume contains a strong overall section structure."
            )
        )

    if ats_score >= STRONG_ATS_SCORE:
        strengths.append(
            (
                "Resume demonstrates strong ATS compatibility."
            )
        )

    if (
        keyword_coverage[
            "coverage_ratio"
        ]
        >= 75
    ):
        strengths.append(
            (
                "Resume aligns well with target job keywords."
            )
        )

    total_skills = (
        extracted_skills.get(
            "total_skills",
            0,
        )
    )

    if total_skills >= 10:
        strengths.append(
            (
                "Resume highlights a broad technical skill set."
            )
        )

    if "projects" in parsed_sections:
        strengths.append(
            (
                "Projects section improves practical experience visibility."
            )
        )

    return strengths


def identify_weaknesses(
    ats_score: int,
    missing_sections: list[str],
    keyword_coverage: dict,
    extracted_skills: dict,
) -> list[str]:
    weaknesses = []

    if ats_score < MODERATE_ATS_SCORE:
        weaknesses.append(
            (
                "Resume ATS optimization needs significant improvement."
            )
        )

    if missing_sections:
        weaknesses.append(
            (
                "Some important resume sections are missing."
            )
        )

    if (
        keyword_coverage[
            "coverage_ratio"
        ]
        < 60
    ):
        weaknesses.append(
            (
                "Resume lacks sufficient alignment with target job keywords."
            )
        )

    total_skills = (
        extracted_skills.get(
            "total_skills",
            0,
        )
    )

    if total_skills < 5:
        weaknesses.append(
            (
                "Technical skills section appears limited."
            )
        )

    if "summary" not in missing_sections:
        return weaknesses

    weaknesses.append(
        (
            "Professional summary section is missing."
        )
    )

    return weaknesses


def determine_hiring_signal(
    ats_score: int,
) -> str:
    if ats_score >= 85:
        return "strong"

    if ats_score >= 70:
        return "moderate"

    if ats_score >= 50:
        return "weak"

    return "high_risk"


def build_summary(
    ats_score: int,
    strengths: list[str],
    weaknesses: list[str],
    hiring_signal: str,
) -> str:
    summary_parts = []

    summary_parts.append(
        (
            f"Resume received an ATS score of {ats_score}/100."
        )
    )

    if hiring_signal == "strong":
        summary_parts.append(
            (
                "Overall resume quality appears recruiter-ready."
            )
        )

    elif hiring_signal == "moderate":
        summary_parts.append(
            (
                "Resume demonstrates reasonable hiring potential with some optimization opportunities."
            )
        )

    elif hiring_signal == "weak":
        summary_parts.append(
            (
                "Resume requires additional ATS and content improvements."
            )
        )

    else:
        summary_parts.append(
            (
                "Resume currently shows weak recruiter and ATS alignment."
            )
        )

    if strengths:
        summary_parts.append(
            (
                "Key strengths include: "
                + "; ".join(strengths[:3])
            )
        )

    if weaknesses:
        summary_parts.append(
            (
                "Primary improvement areas include: "
                + "; ".join(weaknesses[:3])
            )
        )

    return " ".join(
        summary_parts,
    )