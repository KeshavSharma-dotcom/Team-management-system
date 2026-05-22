import re

from resume_checker.exceptions.custom_exceptions import (
    AIResponseException,
)
from resume_checker.services.ai.client import (
    build_system_prompt,
    generate_structured_completion,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
)


METRIC_PATTERN = re.compile(
    r"""
    (
        \d+%
        |
        \d+\+?
        |
        \$\d+
        |
        \d+\s?(users|clients|customers|projects|transactions)
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)

ACTION_VERB_PATTERN = re.compile(
    r"""
    ^(
        developed|
        built|
        designed|
        improved|
        optimized|
        implemented|
        managed|
        created|
        automated|
        increased|
        reduced|
        led|
        engineered|
        delivered|
        launched
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)


MAX_BULLET_LENGTH = 300

MAX_BULLETS_PER_REQUEST = 10


async def quantify_resume_bullets(
    bullets: list[str],
    target_role: str | None = None,
) -> dict:
    validated_bullets = (
        validate_bullets(
            bullets,
        )
    )

    quantified_results = []

    for bullet in validated_bullets[
        :MAX_BULLETS_PER_REQUEST
    ]:
        analysis = analyze_bullet_strength(
            bullet,
        )

        quantified_version = bullet

        if (
            analysis[
                "needs_quantification"
            ]
        ):
            quantified_version = (
                await generate_quantified_bullet(
                    bullet=bullet,
                    target_role=(
                        target_role
                    ),
                )
            )

        quantified_results.append(
            {
                "original": bullet,
                "quantified": (
                    quantified_version
                ),
                "analysis": analysis,
            }
        )

    return {
        "results": quantified_results,
    }


def analyze_bullet_strength(
    bullet: str,
) -> dict:
    cleaned_bullet = (
        clean_resume_text(
            bullet,
        )
    )

    contains_metrics = bool(
        METRIC_PATTERN.search(
            cleaned_bullet,
        )
    )

    starts_with_action_verb = bool(
        ACTION_VERB_PATTERN.search(
            cleaned_bullet,
        )
    )

    word_count = len(
        cleaned_bullet.split(),
    )

    needs_quantification = not (
        contains_metrics
    )

    readability_score = (
        calculate_readability_score(
            word_count=word_count,
            contains_metrics=(
                contains_metrics
            ),
            starts_with_action_verb=(
                starts_with_action_verb
            ),
        )
    )

    return {
        "contains_metrics": (
            contains_metrics
        ),
        "starts_with_action_verb": (
            starts_with_action_verb
        ),
        "word_count": word_count,
        "needs_quantification": (
            needs_quantification
        ),
        "readability_score": (
            readability_score
        ),
    }


async def generate_quantified_bullet(
    bullet: str,
    target_role: str | None = None,
) -> str:
    cleaned_bullet = (
        clean_resume_text(
            bullet,
        )
    )

    prompt = (
        build_quantification_prompt(
            bullet=cleaned_bullet,
            target_role=target_role,
        )
    )

    quantified_bullet = (
        await generate_structured_completion(
            system_prompt=(
                build_system_prompt(
                    "resume_optimization"
                )
            ),
            user_prompt=prompt,
            max_tokens=120,
        )
    )

    validated_output = (
        validate_quantified_bullet(
            quantified_bullet,
        )
    )

    return validated_output


def build_quantification_prompt(
    bullet: str,
    target_role: str | None = None,
) -> str:
    prompt_sections = [
        (
            "Rewrite the following resume bullet "
            "to include measurable impact and stronger quantification."
        ),
        (
            f"Original bullet:\n"
            f"{bullet}"
        ),
    ]

    if target_role:
        prompt_sections.append(
            (
                f"Target role: "
                f"{target_role}"
            )
        )

    prompt_sections.append(
        (
            "Requirements:\n"
            "- Add measurable impact where realistic\n"
            "- Use strong action verbs\n"
            "- Improve recruiter readability\n"
            "- Keep concise and professional\n"
            "- Return only the improved bullet"
        )
    )

    return "\n\n".join(
        prompt_sections,
    )


def calculate_readability_score(
    word_count: int,
    contains_metrics: bool,
    starts_with_action_verb: bool,
) -> int:
    score = 50

    if contains_metrics:
        score += 25

    if starts_with_action_verb:
        score += 15

    if 10 <= word_count <= 30:
        score += 10

    return min(
        score,
        100,
    )


def detect_weak_bullets(
    bullets: list[str],
) -> list[str]:
    weak_bullets = []

    for bullet in bullets:
        analysis = (
            analyze_bullet_strength(
                bullet,
            )
        )

        if (
            analysis[
                "readability_score"
            ]
            < 70
        ):
            weak_bullets.append(
                bullet,
            )

    return weak_bullets


def validate_bullets(
    bullets: list[str],
) -> list[str]:
    validated_bullets = []

    for bullet in bullets:
        cleaned_bullet = (
            clean_resume_text(
                bullet,
            )
        )

        if not cleaned_bullet:
            continue

        if (
            len(cleaned_bullet)
            > MAX_BULLET_LENGTH
        ):
            continue

        validated_bullets.append(
            cleaned_bullet,
        )

    if not validated_bullets:
        raise AIResponseException(
            message=(
                "No valid bullets provided for quantification"
            ),
        )

    return validated_bullets


def validate_quantified_bullet(
    bullet: str,
) -> str:
    cleaned_bullet = clean_resume_text(
        bullet,
    )

    if not cleaned_bullet:
        raise AIResponseException(
            message=(
                "Generated quantified bullet is empty"
            ),
        )

    if (
        len(cleaned_bullet)
        > MAX_BULLET_LENGTH
    ):
        raise AIResponseException(
            message=(
                "Generated quantified bullet exceeds allowed length"
            ),
        )

    return cleaned_bullet


def build_quantification_summary(
    quantification_result: dict,
) -> dict:
    results = (
        quantification_result.get(
            "results",
            [],
        )
    )

    quantified_count = 0

    improved_readability_scores = []

    for result in results:
        analysis = result.get(
            "analysis",
            {},
        )

        if analysis.get(
            "needs_quantification"
        ):
            quantified_count += 1

        improved_readability_scores.append(
            analysis.get(
                "readability_score",
                0,
            )
        )

    average_readability = 0

    if improved_readability_scores:
        average_readability = round(
            sum(
                improved_readability_scores
            )
            / len(
                improved_readability_scores
            )
        )

    return {
        "total_bullets": len(
            results,
        ),
        "quantified_bullets": (
            quantified_count
        ),
        "average_readability_score": (
            average_readability
        ),
    }