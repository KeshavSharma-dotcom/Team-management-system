import re

from resume_checker.services.parsing.entity_extractor import (
    extract_entities,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
)


REDACTION_TOKEN = "[REDACTED]"


def anonymize_resume(
    resume_text: str,
) -> dict:
    cleaned_text = clean_resume_text(
        resume_text,
    )

    extracted_entities = (
        extract_entities(
            cleaned_text,
        )
    )

    anonymized_text = cleaned_text

    anonymized_text = redact_name(
        anonymized_text,
        extracted_entities.get(
            "name",
        ),
    )

    anonymized_text = redact_values(
        anonymized_text,
        extracted_entities.get(
            "emails",
            [],
        ),
        replacement="[EMAIL]",
    )

    anonymized_text = redact_values(
        anonymized_text,
        extracted_entities.get(
            "phone_numbers",
            [],
        ),
        replacement="[PHONE]",
    )

    anonymized_text = redact_values(
        anonymized_text,
        extracted_entities.get(
            "linkedin_profiles",
            [],
        ),
        replacement="[LINKEDIN]",
    )

    anonymized_text = redact_values(
        anonymized_text,
        extracted_entities.get(
            "github_profiles",
            [],
        ),
        replacement="[GITHUB]",
    )

    anonymized_text = redact_values(
        anonymized_text,
        extracted_entities.get(
            "urls",
            [],
        ),
        replacement="[URL]",
    )

    anonymized_text = normalize_redactions(
        anonymized_text,
    )

    return {
        "original_text": cleaned_text,
        "anonymized_text": (
            anonymized_text
        ),
        "redacted_entities": {
            "name": (
                extracted_entities.get(
                    "name",
                )
            ),
            "emails": (
                extracted_entities.get(
                    "emails",
                    [],
                )
            ),
            "phone_numbers": (
                extracted_entities.get(
                    "phone_numbers",
                    [],
                )
            ),
            "linkedin_profiles": (
                extracted_entities.get(
                    "linkedin_profiles",
                    [],
                )
            ),
            "github_profiles": (
                extracted_entities.get(
                    "github_profiles",
                    [],
                )
            ),
            "urls": (
                extracted_entities.get(
                    "urls",
                    [],
                )
            ),
        },
    }


def redact_name(
    text: str,
    name: str | None,
) -> str:
    if not name:
        return text

    escaped_name = re.escape(
        name,
    )

    return re.sub(
        escaped_name,
        "[NAME]",
        text,
        flags=re.IGNORECASE,
    )


def redact_values(
    text: str,
    values: list[str],
    replacement: str,
) -> str:
    anonymized_text = text

    sorted_values = sorted(
        values,
        key=len,
        reverse=True,
    )

    for value in sorted_values:
        escaped_value = re.escape(
            value,
        )

        anonymized_text = re.sub(
            escaped_value,
            replacement,
            anonymized_text,
            flags=re.IGNORECASE,
        )

    return anonymized_text


def normalize_redactions(
    text: str,
) -> str:
    normalized_text = re.sub(
        r"\[NAME\]\s+\[NAME\]",
        "[NAME]",
        text,
    )

    normalized_text = re.sub(
        r"\[EMAIL\]\s+\[EMAIL\]",
        "[EMAIL]",
        normalized_text,
    )

    normalized_text = re.sub(
        r"\[PHONE\]\s+\[PHONE\]",
        "[PHONE]",
        normalized_text,
    )

    normalized_text = re.sub(
        r"\[URL\]\s+\[URL\]",
        "[URL]",
        normalized_text,
    )

    return normalized_text


def build_anonymization_summary(
    anonymization_result: dict,
) -> dict:
    redacted_entities = (
        anonymization_result[
            "redacted_entities"
        ]
    )

    return {
        "name_redacted": bool(
            redacted_entities.get(
                "name",
            )
        ),
        "emails_redacted": len(
            redacted_entities.get(
                "emails",
                [],
            )
        ),
        "phones_redacted": len(
            redacted_entities.get(
                "phone_numbers",
                [],
            )
        ),
        "linkedin_redacted": len(
            redacted_entities.get(
                "linkedin_profiles",
                [],
            )
        ),
        "github_redacted": len(
            redacted_entities.get(
                "github_profiles",
                [],
            )
        ),
        "urls_redacted": len(
            redacted_entities.get(
                "urls",
                [],
            )
        ),
    }


def contains_sensitive_entities(
    text: str,
) -> bool:
    extracted_entities = (
        extract_entities(
            text,
        )
    )

    return any(
        [
            extracted_entities.get(
                "name",
            ),
            extracted_entities.get(
                "emails",
            ),
            extracted_entities.get(
                "phone_numbers",
            ),
            extracted_entities.get(
                "linkedin_profiles",
            ),
            extracted_entities.get(
                "github_profiles",
            ),
        ]
    )