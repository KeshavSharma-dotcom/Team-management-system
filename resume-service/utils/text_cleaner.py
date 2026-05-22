import re
import unicodedata

from resume_checker.core.constants import (
    MAX_RESUME_CHARACTER_LENGTH,
    MIN_RESUME_CHARACTER_LENGTH,
)
from resume_checker.exceptions.custom_exceptions import (
    ValidationException,
)


MULTIPLE_SPACES_PATTERN = re.compile(
    r"[ \t]+"
)

MULTIPLE_NEWLINES_PATTERN = re.compile(
    r"\n{3,}"
)

ZERO_WIDTH_PATTERN = re.compile(
    r"[\u200B-\u200D\uFEFF]"
)

NON_PRINTABLE_PATTERN = re.compile(
    r"[\x00-\x08\x0B\x0C\x0E-\x1F]"
)


def clean_resume_text(
    text: str,
) -> str:
    validate_text_input(text)

    normalized_text = normalize_unicode(
        text,
    )

    normalized_text = remove_zero_width_characters(
        normalized_text,
    )

    normalized_text = remove_non_printable_characters(
        normalized_text,
    )

    normalized_text = normalize_line_endings(
        normalized_text,
    )

    normalized_text = normalize_whitespace(
        normalized_text,
    )

    normalized_text = collapse_excessive_newlines(
        normalized_text,
    )

    normalized_text = strip_text(
        normalized_text,
    )

    validate_text_length(
        normalized_text,
    )

    return normalized_text


def validate_text_input(
    text: str,
) -> None:
    if text is None:
        raise ValidationException(
            message="Text cannot be null",
        )

    if not isinstance(text, str):
        raise ValidationException(
            message=(
                "Input must be a string"
            ),
        )


def normalize_unicode(
    text: str,
) -> str:
    return unicodedata.normalize(
        "NFKC",
        text,
    )


def remove_zero_width_characters(
    text: str,
) -> str:
    return ZERO_WIDTH_PATTERN.sub(
        "",
        text,
    )


def remove_non_printable_characters(
    text: str,
) -> str:
    return NON_PRINTABLE_PATTERN.sub(
        "",
        text,
    )


def normalize_line_endings(
    text: str,
) -> str:
    return (
        text.replace("\r\n", "\n")
        .replace("\r", "\n")
    )


def normalize_whitespace(
    text: str,
) -> str:
    cleaned_lines = []

    for line in text.split("\n"):
        normalized_line = (
            MULTIPLE_SPACES_PATTERN.sub(
                " ",
                line,
            )
        ).strip()

        cleaned_lines.append(
            normalized_line,
        )

    return "\n".join(cleaned_lines)


def collapse_excessive_newlines(
    text: str,
) -> str:
    return MULTIPLE_NEWLINES_PATTERN.sub(
        "\n\n",
        text,
    )


def strip_text(
    text: str,
) -> str:
    return text.strip()


def validate_text_length(
    text: str,
) -> None:
    text_length = len(text)

    if (
        text_length
        < MIN_RESUME_CHARACTER_LENGTH
    ):
        raise ValidationException(
            message=(
                "Resume text is too short"
            ),
            details={
                "minimum_characters": (
                    MIN_RESUME_CHARACTER_LENGTH
                ),
                "received_characters": (
                    text_length
                ),
            },
        )

    if (
        text_length
        > MAX_RESUME_CHARACTER_LENGTH
    ):
        raise ValidationException(
            message=(
                "Resume text exceeds allowed size"
            ),
            details={
                "maximum_characters": (
                    MAX_RESUME_CHARACTER_LENGTH
                ),
                "received_characters": (
                    text_length
                ),
            },
        )


def normalize_keyword(
    keyword: str,
) -> str:
    validate_text_input(
        keyword,
    )

    normalized_keyword = (
        normalize_unicode(keyword)
        .lower()
        .strip()
    )

    normalized_keyword = (
        MULTIPLE_SPACES_PATTERN.sub(
            " ",
            normalized_keyword,
        )
    )

    return normalized_keyword


def split_into_lines(
    text: str,
) -> list[str]:
    cleaned_text = clean_resume_text(
        text,
    )

    return [
        line
        for line
        in cleaned_text.split("\n")
        if line.strip()
    ]