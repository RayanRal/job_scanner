from urllib.parse import urlparse

from app.parsers.types import ParsedJob

NAME = "lever"


def detect(url: str) -> str | None:
    p = urlparse(url)
    if "lever.co" in p.netloc.lower():
        parts = p.path.strip("/").split("/")
        return parts[0] if parts and parts[0] else None
    return None


def jobs_url(board_token: str) -> str:
    return f"https://api.lever.co/v0/postings/{board_token}?mode=json"


def parse(payload: list) -> list[ParsedJob]:
    out = []
    for j in payload or []:
        out.append(
            ParsedJob(
                external_id=str(j.get("id")),
                title=j.get("text", ""),
                location=j.get("categories", {}).get("location", ""),
                url=j.get("hostedUrl", ""),
                description=j.get("description", ""),
                department=j.get("categories", {}).get("team", ""),
            )
        )
    return out
