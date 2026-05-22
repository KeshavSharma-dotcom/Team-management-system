import re

from resume_checker.utils.text_cleaner import (
    clean_resume_text,
)


EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
)

PHONE_PATTERN = re.compile(
    r"""
    (?:
        \+?\d{1,3}[\s\-]?
    )?
    (?:
        \(?\d{3,5}\)?[\s\-]?
    )?
    \d{3,5}[\s\-]?\d{3,5}
    """,
    re.VERBOSE,
)

LINKEDIN_PATTERN = re.compile(
    r"(https?:\/\/)?(www\.)?linkedin\.com\/[A-Za-z0-9\-_/]+",
    re.IGNORECASE,
)

GITHUB_PATTERN = re.compile(
    r"(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9\-_/]+",
    re.IGNORECASE,
)

URL_PATTERN = re.compile(
    r"(https?:\/\/[^\s]+)",
    re.IGNORECASE,
)

NAME_PATTERN = re.compile(
    r"^[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3}$"
)


def extract_entities(
    text: str,
) -> dict:
    cleaned_text = clean_resume_text(
        text,
    )

    return {
        "name": extract_name(
            cleaned_text,
        ),
        "emails": extract_emails(
            cleaned_text,
        ),
        "phone_numbers": (
            extract_phone_numbers(
                cleaned_text,
            )
        ),
        "linkedin_profiles": (
            extract_linkedin_profiles(
                cleaned_text,
            )
        ),
        "github_profiles": (
            extract_github_profiles(
                cleaned_text,
            )
        ),
        "urls": extract_urls(
            cleaned_text,
        ),
    }


def extract_name(
    text: str,
) -> str | None:
    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    top_lines = lines[:5]

    for line in top_lines:
        normalized_line = (
            normalize_entity_value(
                line,
            )
        )

        if len(normalized_line) > 60:
            continue

        if contains_contact_info(
            normalized_line,
        ):
            continue

        if NAME_PATTERN.match(
            normalized_line,
        ):
            return normalized_line

    return None


def extract_emails(
    text: str,
) -> list[str]:
    matches = EMAIL_PATTERN.findall(
        text,
    )

    return deduplicate_entities(
        matches,
    )


def extract_phone_numbers(
    text: str,
) -> list[str]:
    matches = PHONE_PATTERN.findall(
        text,
    )

    normalized_numbers = []

    for number in matches:
        cleaned_number = re.sub(
            r"[^\d+]",
            "",
            number,
        )

        if len(cleaned_number) < 7:
            continue

        normalized_numbers.append(
            cleaned_number,
        )

    return deduplicate_entities(
        normalized_numbers,
    )


def extract_linkedin_profiles(
    text: str,
) -> list[str]:
    matches = LINKEDIN_PATTERN.findall(
        text,
    )

    extracted_profiles = []

    for match in matches:
        if isinstance(match, tuple):
            reconstructed = "".join(
                match,
            )

            if reconstructed:
                extracted_profiles.append(
                    reconstructed,
                )

            continue

        extracted_profiles.append(
            match,
        )

    return deduplicate_entities(
        extracted_profiles,
    )


def extract_github_profiles(
    text: str,
) -> list[str]:
    matches = GITHUB_PATTERN.findall(
        text,
    )

    extracted_profiles = []

    for match in matches:
        if isinstance(match, tuple):
            reconstructed = "".join(
                match,
            )

            if reconstructed:
                extracted_profiles.append(
                    reconstructed,
                )

            continue

        extracted_profiles.append(
            match,
        )

    return deduplicate_entities(
        extracted_profiles,
    )


def extract_urls(
    text: str,
) -> list[str]:
    matches = URL_PATTERN.findall(
        text,
    )

    return deduplicate_entities(
        matches,
    )


def contains_contact_info(
    value: str,
) -> bool:
    lowered_value = (
        value.lower()
    )

    contact_tokens = (
        "@",
        "linkedin",
        "github",
        "http",
        ".com",
    )

    return any(
        token in lowered_value
        for token in contact_tokens
    )


def normalize_entity_value(
    value: str,
) -> str:
    normalized = (
        value.strip()
    )

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized


def deduplicate_entities(
    values: list[str],
) -> list[str]:
    normalized_values = []

    seen_values = set()

    for value in values:
        normalized_value = (
            normalize_entity_value(
                value,
            )
        )

        lowered_value = (
            normalized_value.lower()
        )

        if not normalized_value:
            continue

        if lowered_value in seen_values:
            continue

        seen_values.add(
            lowered_value,
        )

        normalized_values.append(
            normalized_value,
        )

    return normalized_values