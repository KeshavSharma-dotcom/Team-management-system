import re
from collections import Counter

from resume_checker.utils.text_cleaner import (
    clean_resume_text,
    normalize_keyword,
)


MINIMUM_KEYWORD_LENGTH = 3

MAXIMUM_KEYWORD_LENGTH = 50

DEFAULT_TOP_KEYWORD_LIMIT = 25


STOP_WORDS = {
    "the",
    "and",
    "with",
    "for",
    "from",
    "this",
    "that",
    "into",
    "your",
    "have",
    "will",
    "using",
    "used",
    "use",
    "are",
    "was",
    "were",
    "been",
    "their",
    "they",
    "them",
    "our",
    "you",
    "job",
    "role",
    "work",
    "team",
    "skills",
    "experience",
    "years",
    "responsible",
    "required",
    "preferred",
}


TOKEN_PATTERN = re.compile(
    r"[A-Za-z0-9\+#\.\-/]+"
)


def extract_keywords(
    text: str,
    limit: int = DEFAULT_TOP_KEYWORD_LIMIT,
) -> list[str]:
    cleaned_text = clean_resume_text(
        text,
    )

    tokens = tokenize_text(
        cleaned_text,
    )

    normalized_tokens = []

    for token in tokens:
        normalized_token = (
            normalize_keyword(
                token,
            )
        )

        if not is_valid_keyword(
            normalized_token,
        ):
            continue

        normalized_tokens.append(
            normalized_token,
        )

    keyword_frequencies = (
        Counter(
            normalized_tokens,
        )
    )

    ranked_keywords = [
        keyword
        for (
            keyword,
            _,
        ) in keyword_frequencies.most_common(
            limit,
        )
    ]

    return ranked_keywords


def extract_keywords_with_frequency(
    text: str,
) -> dict[str, int]:
    cleaned_text = clean_resume_text(
        text,
    )

    tokens = tokenize_text(
        cleaned_text,
    )

    keyword_counter = Counter()

    for token in tokens:
        normalized_token = (
            normalize_keyword(
                token,
            )
        )

        if not is_valid_keyword(
            normalized_token,
        ):
            continue

        keyword_counter[
            normalized_token
        ] += 1

    return dict(
        sorted(
            keyword_counter.items(),
            key=lambda item: (
                item[1]
            ),
            reverse=True,
        )
    )


def extract_matching_keywords(
    source_keywords: list[str],
    target_keywords: list[str],
) -> list[str]:
    normalized_source = {
        normalize_keyword(
            keyword,
        )
        for keyword in source_keywords
    }

    normalized_target = {
        normalize_keyword(
            keyword,
        )
        for keyword in target_keywords
    }

    matches = (
        normalized_source.intersection(
            normalized_target,
        )
    )

    return sorted(
        matches,
    )


def extract_missing_keywords(
    source_keywords: list[str],
    target_keywords: list[str],
) -> list[str]:
    normalized_source = {
        normalize_keyword(
            keyword,
        )
        for keyword in source_keywords
    }

    normalized_target = {
        normalize_keyword(
            keyword,
        )
        for keyword in target_keywords
    }

    missing_keywords = (
        normalized_target.difference(
            normalized_source,
        )
    )

    return sorted(
        missing_keywords,
    )


def calculate_keyword_frequency_score(
    text: str,
    keywords: list[str],
) -> int:
    if not keywords:
        return 0

    normalized_text = (
        clean_resume_text(
            text,
        ).lower()
    )

    total_occurrences = 0

    for keyword in keywords:
        normalized_keyword = (
            normalize_keyword(
                keyword,
            )
        )

        total_occurrences += (
            normalized_text.count(
                normalized_keyword,
            )
        )

    average_frequency = (
        total_occurrences
        / len(keywords)
    )

    frequency_score = min(
        round(
            average_frequency * 20
        ),
        100,
    )

    return frequency_score


def tokenize_text(
    text: str,
) -> list[str]:
    return TOKEN_PATTERN.findall(
        text.lower(),
    )


def is_valid_keyword(
    keyword: str,
) -> bool:
    if not keyword:
        return False

    if (
        len(keyword)
        < MINIMUM_KEYWORD_LENGTH
    ):
        return False

    if (
        len(keyword)
        > MAXIMUM_KEYWORD_LENGTH
    ):
        return False

    if keyword in STOP_WORDS:
        return False

    if keyword.isdigit():
        return False

    return True


def deduplicate_keywords(
    keywords: list[str],
) -> list[str]:
    normalized_keywords = []

    seen_keywords = set()

    for keyword in keywords:
        normalized_keyword = (
            normalize_keyword(
                keyword,
            )
        )

        if (
            normalized_keyword
            in seen_keywords
        ):
            continue

        seen_keywords.add(
            normalized_keyword,
        )

        normalized_keywords.append(
            normalized_keyword,
        )

    return sorted(
        normalized_keywords,
    )


def rank_keywords_by_relevance(
    keyword_frequency: dict[str, int],
) -> list[dict]:
    ranked_keywords = []

    sorted_keywords = sorted(
        keyword_frequency.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    for (
        keyword,
        frequency,
    ) in sorted_keywords:
        ranked_keywords.append(
            {
                "keyword": keyword,
                "frequency": frequency,
                "relevance_score": min(
                    frequency * 10,
                    100,
                ),
            }
        )

    return ranked_keywords