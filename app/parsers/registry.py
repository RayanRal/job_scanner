from app.parsers import ashby, greenhouse, lever

PROVIDERS = (greenhouse, lever, ashby)
BY_NAME = {p.NAME: p for p in PROVIDERS}


def detect(url: str) -> tuple[str, str] | None:
    for p in PROVIDERS:
        token = p.detect(url)
        if token:
            return p.NAME, token
    return None


def jobs_url(provider: str, board_token: str) -> str:
    return BY_NAME[provider].jobs_url(board_token)


def parse(provider: str, payload) -> list:
    return BY_NAME[provider].parse(payload)
