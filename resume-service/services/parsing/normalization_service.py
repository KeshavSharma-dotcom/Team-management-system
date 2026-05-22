import re
import unicodedata

from resume_checker.utils.text_cleaner import (
    clean_resume_text,
    normalize_keyword,
)


MULTIPLE_WHITESPACE_PATTERN = (
    re.compile(r"\s+")
)

NON_ALPHANUMERIC_PATTERN = (
    re.compile(
        r"[^a-zA-Z0-9\s\+#\.\-/]"
    )
)


def normalize_resume(
    text: str,
) -> str:
    cleaned_text = clean_resume_text(
        text,
    )

    normalized_text = (
        normalize_unicode(
            cleaned_text,
        )
    )

    normalized_text = (
        normalize_whitespace(
            normalized_text,
        )
    )

    return normalized_text.strip()


def normalize_skill(
    skill: str,
) -> str:
    normalized_skill = (
        normalize_keyword(
            skill,
        )
    )

    normalized_skill = (
        remove_special_characters(
            normalized_skill,
        )
    )

    normalized_skill = (
        normalize_whitespace(
            normalized_skill,
        )
    )

    return normalized_skill


def normalize_keywords(
    keywords: list[str],
) -> list[str]:
    normalized_keywords = []

    for keyword in keywords:
        normalized_keyword = (
            normalize_keyword(
                keyword,
            )
        )

        normalized_keyword = (
            normalize_whitespace(
                normalized_keyword,
            )
        )

        if not normalized_keyword:
            continue

        normalized_keywords.append(
            normalized_keyword,
        )

    return sorted(
        set(normalized_keywords),
    )


def normalize_entity(
    value: str,
) -> str:
    normalized_value = (
        normalize_unicode(
            value,
        )
    )

    normalized_value = (
        normalize_whitespace(
            normalized_value,
        )
    )

    return normalized_value.strip()


def normalize_entities(
    entities: list[str],
) -> list[str]:
    normalized_entities = []

    for entity in entities:
        normalized_entity = (
            normalize_entity(
                entity,
            )
        )

        if not normalized_entity:
            continue

        normalized_entities.append(
            normalized_entity,
        )

    return sorted(
        set(normalized_entities),
    )


def normalize_unicode(
    value: str,
) -> str:
    return unicodedata.normalize(
        "NFKC",
        value,
    )


def normalize_whitespace(
    value: str,
) -> str:
    return (
        MULTIPLE_WHITESPACE_PATTERN.sub(
            " ",
            value,
        ).strip()
    )


def remove_special_characters(
    value: str,
) -> str:
    return (
        NON_ALPHANUMERIC_PATTERN.sub(
            "",
            value,
        )
    )


def normalize_for_matching(
    value: str,
) -> str:
    normalized_value = (
        normalize_unicode(
            value,
        ).lower()
    )

    normalized_value = (
        remove_special_characters(
            normalized_value,
        )
    )

    normalized_value = (
        normalize_whitespace(
            normalized_value,
        )
    )

    return normalized_value


def build_normalized_lookup(
    values: list[str],
) -> dict[str, str]:
    normalized_lookup = {}

    for value in values:
        normalized_value = (
            normalize_for_matching(
                value,
            )
        )

        if not normalized_value:
            continue

        normalized_lookup[
            normalized_value
        ] = value

    return normalized_lookup


def deduplicate_normalized_values(
    values: list[str],
) -> list[str]:
    normalized_lookup = (
        build_normalized_lookup(
            values,
        )
    )

    return sorted(
        normalized_lookup.values(),
    )