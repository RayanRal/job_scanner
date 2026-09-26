import re

EXCLUDED_DEPARTMENTS = (
    r"legal",
    r"marketing",
    r"financ|accounting",
    r"sales",
    r"human resources|\bhr\b|\bpeople\b",
    r"communications|\bcomms\b|public relations",
)

_PATTERNS = [re.compile(p, re.I) for p in EXCLUDED_DEPARTMENTS]


def is_excluded(department: str) -> bool:
    return any(p.search(department) for p in _PATTERNS) if department else False
