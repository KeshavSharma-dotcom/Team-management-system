import re

from resume_checker.core.constants import (
    RESUME_SECTIONS,
    SECTION_ALIASES,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
)


SECTION_HEADER_PATTERN = re.compile(
    r"^[A-Z][A-Z\s&/\-]{1,50}$"
)


def parse_resume_sections(
    text: str,
) -> dict[str, str]:
    cleaned_text = clean_resume_text(
        text,
    )

    lines = split_lines(
        cleaned_text,
    )

    normalized_sections = (
        build_normalized_section_map()
    )

    detected_sections = {}

    current_section = None

    for line in lines:
        normalized_line = normalize_header(
            line,
        )

        matched_section = (
            normalized_sections.get(
                normalized_line,
            )
        )

        if matched_section:
            current_section = (
                matched_section
            )

            if (
                current_section
                not in detected_sections
            ):
                detected_sections[
                    current_section
                ] = []

            continue

        if not current_section:
            continue

        detected_sections[
            current_section
        ].append(line)

    return finalize_sections(
        detected_sections,
    )


def split_lines(
    text: str,
) -> list[str]:
    return [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]


def build_normalized_section_map(
) -> dict[str, str]:
    normalized_sections = {}

    for section in RESUME_SECTIONS:
        normalized_sections[
            normalize_header(
                section,
            )
        ] = section

    for (
        section,
        aliases,
    ) in SECTION_ALIASES.items():
        for alias in aliases:
            normalized_sections[
                normalize_header(
                    alias,
                )
            ] = section

    return normalized_sections


def normalize_header(
    value: str,
) -> str:
    normalized = (
        value.lower()
        .replace(":", "")
        .replace("-", " ")
        .strip()
    )

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized


def finalize_sections(
    sections: dict[str, list[str]],
) -> dict[str, str]:
    finalized = {}

    for (
        section_name,
        content_lines,
    ) in sections.items():
        combined_content = (
            "\n".join(content_lines)
            .strip()
        )

        if not combined_content:
            continue

        finalized[
            section_name
        ] = combined_content

    return finalized


def detect_missing_sections(
    parsed_sections: dict[str, str],
) -> list[str]:
    missing_sections = []

    for section in RESUME_SECTIONS:
        if (
            section
            not in parsed_sections
        ):
            missing_sections.append(
                section,
            )

    return missing_sections


def extract_section_order(
    text: str,
) -> list[str]:
    cleaned_text = clean_resume_text(
        text,
    )

    lines = split_lines(
        cleaned_text,
    )

    normalized_sections = (
        build_normalized_section_map()
    )

    detected_order = []

    seen_sections = set()

    for line in lines:
        normalized_line = normalize_header(
            line,
        )

        matched_section = (
            normalized_sections.get(
                normalized_line,
            )
        )

        if not matched_section:
            continue

        if matched_section in seen_sections:
            continue

        seen_sections.add(
            matched_section,
        )

        detected_order.append(
            matched_section,
        )

    return detected_order


def is_probable_section_header(
    line: str,
) -> bool:
    normalized_line = (
        line.strip()
    )

    if len(normalized_line) > 60:
        return False

    return bool(
        SECTION_HEADER_PATTERN.match(
            normalized_line,
        )
    )
