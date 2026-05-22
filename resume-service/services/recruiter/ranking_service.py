from statistics import mean

from resume_checker.services.ats.keyword_gap_service import (
    calculate_keyword_coverage,
)
from resume_checker.services.parsing.normalization_service import (
    normalize_keywords,
)


MINIMUM_ACCEPTABLE_ATS_SCORE = 50

STRONG_MATCH_THRESHOLD = 80

MODERATE_MATCH_THRESHOLD = 65


def rank_candidates(
    candidates: list[dict],
    required_skills: list[str],
    preferred_skills: list[str] | None = None,
    minimum_ats_score: int = (
        MINIMUM_ACCEPTABLE_ATS_SCORE
    ),
) -> list[dict]:
    normalized_required_skills = (
        normalize_keywords(
            required_skills,
        )
    )

    normalized_preferred_skills = (
        normalize_keywords(
            preferred_skills or [],
        )
    )

    ranked_candidates = []

    for candidate in candidates:
        ranking_result = (
            calculate_candidate_ranking(
                candidate=candidate,
                required_skills=(
                    normalized_required_skills
                ),
                preferred_skills=(
                    normalized_preferred_skills
                ),
                minimum_ats_score=(
                    minimum_ats_score
                ),
            )
        )

        if not ranking_result:
            continue

        ranked_candidates.append(
            ranking_result,
        )

    ranked_candidates.sort(
        key=lambda candidate: (
            candidate[
                "ranking_score"
            ]
        ),
        reverse=True,
    )

    return ranked_candidates


def calculate_candidate_ranking(
    candidate: dict,
    required_skills: list[str],
    preferred_skills: list[str],
    minimum_ats_score: int,
) -> dict | None:
    ats_score = candidate.get(
        "ats_score",
        0,
    )

    if ats_score < minimum_ats_score:
        return None

    candidate_skills = (
        normalize_keywords(
            candidate.get(
                "skills",
                [],
            )
        )
    )

    required_skill_matches = (
        calculate_skill_matches(
            candidate_skills,
            required_skills,
        )
    )

    preferred_skill_matches = (
        calculate_skill_matches(
            candidate_skills,
            preferred_skills,
        )
    )

    keyword_coverage = (
        calculate_keyword_coverage(
            {
                "matched_keywords": (
                    required_skill_matches
                ),
                "missing_keywords": (
                    calculate_missing_skills(
                        candidate_skills,
                        required_skills,
                    )
                ),
            }
        )
    )

    ranking_score = (
        calculate_ranking_score(
            ats_score=ats_score,
            required_match_count=len(
                required_skill_matches
            ),
            preferred_match_count=len(
                preferred_skill_matches
            ),
            total_required_skills=len(
                required_skills
            ),
        )
    )

    return {
        "candidate_id": (
            candidate.get(
                "candidate_id",
            )
        ),
        "ranking_score": (
            ranking_score
        ),
        "ats_score": ats_score,
        "matched_skills": (
            required_skill_matches
        ),
        "preferred_skill_matches": (
            preferred_skill_matches
        ),
        "missing_skills": (
            calculate_missing_skills(
                candidate_skills,
                required_skills,
            )
        ),
        "match_percentage": (
            keyword_coverage[
                "coverage_ratio"
            ]
        ),
        "hiring_recommendation": (
            determine_hiring_recommendation(
                ranking_score,
            )
        ),
    }


def calculate_skill_matches(
    candidate_skills: list[str],
    target_skills: list[str],
) -> list[str]:
    normalized_candidate_skills = {
        skill.lower().strip()
        for skill in candidate_skills
    }

    normalized_target_skills = {
        skill.lower().strip()
        for skill in target_skills
    }

    matches = (
        normalized_candidate_skills.intersection(
            normalized_target_skills,
        )
    )

    return sorted(
        matches,
    )


def calculate_missing_skills(
    candidate_skills: list[str],
    required_skills: list[str],
) -> list[str]:
    normalized_candidate_skills = {
        skill.lower().strip()
        for skill in candidate_skills
    }

    normalized_required_skills = {
        skill.lower().strip()
        for skill in required_skills
    }

    missing_skills = (
        normalized_required_skills.difference(
            normalized_candidate_skills,
        )
    )

    return sorted(
        missing_skills,
    )


def calculate_ranking_score(
    ats_score: int,
    required_match_count: int,
    preferred_match_count: int,
    total_required_skills: int,
) -> int:
    if total_required_skills <= 0:
        return ats_score

    required_match_ratio = (
        required_match_count
        / total_required_skills
    )

    required_skill_score = (
        required_match_ratio * 100
    )

    preferred_bonus = min(
        preferred_match_count * 5,
        15,
    )

    ranking_score = round(
        mean(
            [
                ats_score,
                required_skill_score,
            ]
        )
        + preferred_bonus
    )

    return min(
        ranking_score,
        100,
    )


def determine_hiring_recommendation(
    ranking_score: int,
) -> str:
    if (
        ranking_score
        >= STRONG_MATCH_THRESHOLD
    ):
        return "strong_match"

    if (
        ranking_score
        >= MODERATE_MATCH_THRESHOLD
    ):
        return "moderate_match"

    return "weak_match"


def build_candidate_snapshot(
    ranked_candidate: dict,
) -> dict:
    return {
        "candidate_id": (
            ranked_candidate[
                "candidate_id"
            ]
        ),
        "ranking_score": (
            ranked_candidate[
                "ranking_score"
            ]
        ),
        "ats_score": (
            ranked_candidate[
                "ats_score"
            ]
        ),
        "matched_skills": (
            ranked_candidate[
                "matched_skills"
            ]
        ),
        "missing_skills": (
            ranked_candidate[
                "missing_skills"
            ]
        ),
        "hiring_recommendation": (
            ranked_candidate[
                "hiring_recommendation"
            ]
        ),
    }


def rank_candidates_by_skill_overlap(
    candidates: list[dict],
    target_skills: list[str],
) -> list[dict]:
    normalized_target_skills = (
        normalize_keywords(
            target_skills,
        )
    )

    ranked_candidates = []

    for candidate in candidates:
        candidate_skills = (
            normalize_keywords(
                candidate.get(
                    "skills",
                    [],
                )
            )
        )

        matched_skills = (
            calculate_skill_matches(
                candidate_skills,
                normalized_target_skills,
            )
        )

        overlap_score = round(
            (
                len(matched_skills)
                / max(
                    len(
                        normalized_target_skills
                    ),
                    1,
                )
            )
            * 100
        )

        ranked_candidates.append(
            {
                "candidate_id": (
                    candidate.get(
                        "candidate_id",
                    )
                ),
                "overlap_score": (
                    overlap_score
                ),
                "matched_skills": (
                    matched_skills
                ),
            }
        )

    ranked_candidates.sort(
        key=lambda candidate: (
            candidate[
                "overlap_score"
            ]
        ),
        reverse=True,
    )

    return ranked_candidates