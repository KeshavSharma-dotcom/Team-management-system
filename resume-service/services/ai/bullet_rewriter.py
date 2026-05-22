from openai import AsyncOpenAI
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
)

from resume_checker.core.config import (
    settings,
)
from resume_checker.exceptions.custom_exceptions import (
    AIResponseException,
    AIServiceException,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
)


client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
)


MAX_BULLET_LENGTH = 300

MAX_REWRITTEN_BULLETS = 10


async def rewrite_resume_bullets(
    bullets: list[str],
    target_role: str | None = None,
    target_keywords: list[str] | None = None,
) -> dict:
    validated_bullets = (
        validate_bullets(
            bullets,
        )
    )

    rewritten_bullets = []

    for bullet in validated_bullets[
        :MAX_REWRITTEN_BULLETS
    ]:
        rewritten_bullet = (
            await rewrite_single_bullet(
                bullet=bullet,
                target_role=(
                    target_role
                ),
                target_keywords=(
                    target_keywords
                ),
            )
        )

        rewritten_bullets.append(
            rewritten_bullet,
        )

    return {
        "original_bullets": (
            validated_bullets
        ),
        "rewritten_bullets": (
            rewritten_bullets
        ),
    }


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(
        multiplier=1,
        min=1,
        max=10,
    ),
)
async def rewrite_single_bullet(
    bullet: str,
    target_role: str | None = None,
    target_keywords: list[str] | None = None,
) -> str:
    cleaned_bullet = (
        clean_resume_text(
            bullet,
        )
    )

    prompt = build_rewrite_prompt(
        bullet=cleaned_bullet,
        target_role=target_role,
        target_keywords=(
            target_keywords
        ),
    )

    try:
        response = (
            await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert resume optimization assistant. "
                            "Rewrite resume bullets to improve ATS compatibility, "
                            "clarity, action orientation, and measurable impact."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.3,
                max_tokens=150,
            )
        )

    except Exception as exc:
        raise AIServiceException(
            message=(
                "AI bullet rewriting failed"
            ),
        ) from exc

    rewritten_bullet = (
        extract_response_content(
            response,
        )
    )

    validated_output = (
        validate_rewritten_bullet(
            rewritten_bullet,
        )
    )

    return validated_output


def build_rewrite_prompt(
    bullet: str,
    target_role: str | None,
    target_keywords: list[str] | None,
) -> str:
    prompt_sections = [
        (
            "Rewrite the following resume bullet "
            "to make it more impactful, concise, "
            "professional, and ATS optimized."
        ),
        f"Original bullet:\n{bullet}",
    ]

    if target_role:
        prompt_sections.append(
            (
                f"Target role: "
                f"{target_role}"
            )
        )

    if target_keywords:
        prompt_sections.append(
            (
                "Important keywords to naturally include: "
                + ", ".join(
                    target_keywords,
                )
            )
        )

    prompt_sections.append(
        (
            "Requirements:\n"
            "- Use strong action verbs\n"
            "- Improve clarity\n"
            "- Improve measurable impact\n"
            "- Keep under 40 words\n"
            "- Return only the rewritten bullet"
        )
    )

    return "\n\n".join(
        prompt_sections,
    )


def extract_response_content(
    response,
) -> str:
    try:
        content = (
            response.choices[0]
            .message.content
        )

    except Exception as exc:
        raise AIResponseException(
            message=(
                "Invalid AI response structure"
            ),
        ) from exc

    if not content:
        raise AIResponseException(
            message=(
                "AI returned empty response"
            ),
        )

    return content.strip()


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
                "No valid bullets provided"
            ),
        )

    return validated_bullets


def validate_rewritten_bullet(
    bullet: str,
) -> str:
    cleaned_bullet = clean_resume_text(
        bullet,
    )

    if not cleaned_bullet:
        raise AIResponseException(
            message=(
                "Rewritten bullet is empty"
            ),
        )

    if (
        len(cleaned_bullet)
        > MAX_BULLET_LENGTH
    ):
        raise AIResponseException(
            message=(
                "Rewritten bullet exceeds allowed length"
            ),
        )

    return cleaned_bullet