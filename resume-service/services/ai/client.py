from openai import AsyncOpenAI
from tenacity import (
    retry,
    retry_if_exception_type,
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


DEFAULT_MAX_TOKENS = 300

DEFAULT_TEMPERATURE = 0.3

DEFAULT_TIMEOUT = 30.0


client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
    timeout=DEFAULT_TIMEOUT,
)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(
        multiplier=1,
        min=1,
        max=8,
    ),
    retry=retry_if_exception_type(
        Exception,
    ),
)
async def generate_completion(
    system_prompt: str,
    user_prompt: str,
    temperature: float = (
        DEFAULT_TEMPERATURE
    ),
    max_tokens: int = (
        DEFAULT_MAX_TOKENS
    ),
    model: str | None = None,
) -> str:
    validate_ai_configuration()

    selected_model = (
        model
        or settings.OPENAI_MODEL
    )

    try:
        response = (
            await client.chat.completions.create(
                model=selected_model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            system_prompt
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            user_prompt
                        ),
                    },
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
        )

    except Exception as exc:
        raise AIServiceException(
            message=(
                "AI completion request failed"
            ),
            details={
                "model": (
                    selected_model
                ),
            },
        ) from exc

    return extract_response_content(
        response,
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
                "AI returned empty content"
            ),
        )

    normalized_content = (
        content.strip()
    )

    if not normalized_content:
        raise AIResponseException(
            message=(
                "AI returned blank content"
            ),
        )

    return normalized_content


def validate_ai_configuration(
) -> None:
    if not settings.ENABLE_AI_FEATURES:
        raise AIServiceException(
            message=(
                "AI features are disabled"
            ),
        )

    if not settings.OPENAI_API_KEY:
        raise AIServiceException(
            message=(
                "OpenAI API key is missing"
            ),
        )

    if not settings.OPENAI_MODEL:
        raise AIServiceException(
            message=(
                "OpenAI model is not configured"
            ),
        )


async def generate_structured_completion(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = (
        DEFAULT_MAX_TOKENS
    ),
) -> str:
    return await generate_completion(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=0.2,
        max_tokens=max_tokens,
    )


async def generate_creative_completion(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = (
        DEFAULT_MAX_TOKENS
    ),
) -> str:
    return await generate_completion(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=0.7,
        max_tokens=max_tokens,
    )


def build_resume_optimization_prompt(
    resume_section: str,
    target_role: str | None = None,
    target_keywords: list[str] | None = None,
) -> str:
    prompt_sections = [
        (
            "Optimize the following resume content "
            "for ATS compatibility, recruiter readability, "
            "clarity, and measurable impact."
        ),
        (
            "Resume content:\n"
            f"{resume_section}"
        ),
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
                    target_keywords
                )
            )
        )

    prompt_sections.append(
        (
            "Requirements:\n"
            "- Improve ATS optimization\n"
            "- Improve measurable achievements\n"
            "- Use strong action verbs\n"
            "- Keep professional tone\n"
            "- Return optimized content only"
        )
    )

    return "\n\n".join(
        prompt_sections,
    )


def build_system_prompt(
    capability: str,
) -> str:
    capability_prompts = {
        "resume_optimization": (
            "You are an expert ATS resume optimization assistant."
        ),
        "bullet_rewriting": (
            "You are an expert resume bullet rewriting assistant."
        ),
        "recruiter_summary": (
            "You are an expert technical recruiter."
        ),
        "keyword_optimization": (
            "You are an ATS keyword optimization expert."
        ),
    }

    return capability_prompts.get(
        capability,
        (
            "You are an expert resume analysis assistant."
        ),
    )