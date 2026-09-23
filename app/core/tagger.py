import re

PATTERNS = {
    "python": r"python",
    "go": r"\bgo(?:lang)?\b",
    "rust": r"rust",
    "java": r"\bjava\b",
    "kotlin": r"kotlin",
    "typescript": r"typescript|\bts\b",
    "react": r"react",
    "postgres": r"postgres(?:ql)?",
    "kubernetes": r"kubernetes|\bk8s\b",
    "aws": r"\baws\b",
    "gcp": r"\bgcp\b|google cloud",
    "remote": r"remote",
}

_COMPILED = {k: re.compile(v, re.I) for k, v in PATTERNS.items()}


def extract_tags(*texts: str) -> list[str]:
    blob = "\n".join(t for t in texts if t)
    return sorted(k for k, rx in _COMPILED.items() if rx.search(blob))
