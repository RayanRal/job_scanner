from typing import Any, cast

from app.parsers import ashby, greenhouse, lever
from app.parsers.types import ParsedJob

PROVIDERS = (greenhouse, lever, ashby)
BY_NAME = {p.NAME: p for p in PROVIDERS}


def detect(url: str) -> tuple[str, str] | None:
    for p in PROVIDERS:
        token = p.detect(url)
        if token:
            return p.NAME, token
    return None


def jobs_url(provider: str, board_token: str) -> str:
    return cast(str, BY_NAME[provider].jobs_url(board_token))


def parse(provider: str, payload: Any) -> list[ParsedJob]:
    return cast(list[ParsedJob], BY_NAME[provider].parse(payload))
