import re


EMAIL_PATTERN = re.compile(
    r"""
    \b
    [A-Za-z0-9._%+-]+
    @
    [A-Za-z0-9.-]+
    \.[A-Za-z]{2,}
    \b
    """,
    re.VERBOSE,
)


PHONE_PATTERN = re.compile(
    r"""
    (?:
        \+?\d{1,3}
        [\s\-\.]?
    )?
    (?:
        \(?\d{2,5}\)?
        [\s\-\.]?
    )?
    \d{3,5}
    [\s\-\.]?
    \d{3,5}
    """,
    re.VERBOSE,
)


URL_PATTERN = re.compile(
    r"""
    https?:\/\/
    [^\s]+
    """,
    re.VERBOSE | re.IGNORECASE,
)


LINKEDIN_PATTERN = re.compile(
    r"""
    (?:
        https?:\/\/
    )?
    (?:
        www\.
    )?
    linkedin\.com\/
    [A-Za-z0-9\-_\/]+
    """,
    re.VERBOSE | re.IGNORECASE,
)


GITHUB_PATTERN = re.compile(
    r"""
    (?:
        https?:\/\/
    )?
    (?:
        www\.
    )?
    github\.com\/
    [A-Za-z0-9\-_\/]+
    """,
    re.VERBOSE | re.IGNORECASE,
)


PORTFOLIO_PATTERN = re.compile(
    r"""
    (?:
        https?:\/\/
    )?
    (?:
        www\.
    )?
    [A-Za-z0-9\-]+\.
    (?:
        dev|
        io|
        me|
        tech|
        com|
        app
    )
    (?:\/[^\s]*)?
    """,
    re.VERBOSE | re.IGNORECASE,
)


NAME_PATTERN = re.compile(
    r"""
    ^
    [A-Z][a-z]+
    (?:
        \s
        [A-Z][a-z]+
    ){1,3}
    $
    """,
    re.VERBOSE,
)


WHITESPACE_PATTERN = re.compile(
    r"\s+"
)


MULTIPLE_NEWLINE_PATTERN = re.compile(
    r"\n{3,}"
)


NON_ALPHANUMERIC_PATTERN = re.compile(
    r"""
    [^
        a-zA-Z0-9
        \s
        \#
        \+
        \.
        \-
        \/
    ]
    """,
    re.VERBOSE,
)


BULLET_PATTERN = re.compile(
    r"""
    ^
    [\-\*\•]
    \s+
    """,
    re.MULTILINE | re.VERBOSE,
)


SECTION_HEADER_PATTERN = re.compile(
    r"""
    ^
    (
        summary|
        profile|
        objective|
        skills|
        experience|
        work\ experience|
        employment|
        projects|
        education|
        certifications|
        achievements|
        internships|
        technical\ skills
    )
    \s*$
    """,
    re.IGNORECASE
    | re.MULTILINE
    | re.VERBOSE,
)


DATE_PATTERN = re.compile(
    r"""
    (?:
        Jan|January|
        Feb|February|
        Mar|March|
        Apr|April|
        May|
        Jun|June|
        Jul|July|
        Aug|August|
        Sep|September|
        Oct|October|
        Nov|November|
        Dec|December
    )
    \s+
    \d{4}
    """,
    re.IGNORECASE
    | re.VERBOSE,
)


YEAR_PATTERN = re.compile(
    r"""
    \b
    (19|20)\d{2}
    \b
    """,
    re.VERBOSE,
)


PERCENTAGE_PATTERN = re.compile(
    r"""
    \b
    \d+
    %
    \b
    """,
    re.VERBOSE,
)


CURRENCY_PATTERN = re.compile(
    r"""
    (?:
        \$|
        ₹|
        €|
        £
    )
    \s?
    \d+
    (?:
        ,\d{3}
    )*
    """,
    re.VERBOSE,
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
        ₹\d+
        |
        \d+\s?
        (
            users|
            clients|
            customers|
            projects|
            transactions|
            teams|
            APIs|
            applications
        )
    )
    """,
    re.IGNORECASE
    | re.VERBOSE,
)


ACTION_VERB_PATTERN = re.compile(
    r"""
    ^
    (
        developed|
        built|
        designed|
        implemented|
        optimized|
        automated|
        created|
        engineered|
        improved|
        increased|
        reduced|
        launched|
        managed|
        delivered|
        architected|
        integrated|
        deployed|
        maintained|
        led
    )
    """,
    re.IGNORECASE
    | re.VERBOSE,
)


TABLE_PATTERN = re.compile(
    r"""
    \|.+\|
    """,
    re.VERBOSE,
)


MULTI_SPACE_PATTERN = re.compile(
    r"""
    \s{4,}
    """,
    re.VERBOSE,
)


ALL_CAPS_PATTERN = re.compile(
    r"""
    ^
    [A-Z\s]{4,}
    $
    """,
    re.MULTILINE
    | re.VERBOSE,
)


HTML_TAG_PATTERN = re.compile(
    r"""
    <[^>]+>
    """,
    re.VERBOSE,
)


UNICODE_CONTROL_PATTERN = re.compile(
    r"""
    [\u200B-\u200D\uFEFF]
    """,
    re.VERBOSE,
)


SQL_INJECTION_PATTERN = re.compile(
    r"""
    (
        (\%27)|(\')|(\-\-)|
        (\%23)|(#)
    )
    """,
    re.VERBOSE
    | re.IGNORECASE,
)


SCRIPT_INJECTION_PATTERN = re.compile(
    r"""
    <
    \s*
    script
    """,
    re.VERBOSE
    | re.IGNORECASE,
)


FILE_NAME_SANITIZATION_PATTERN = (
    re.compile(
        r"""
        [^a-zA-Z0-9._\-]
        """,
        re.VERBOSE,
    )
)