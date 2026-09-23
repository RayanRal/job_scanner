from urllib.parse import urlparse

from app.parsers.types import ParsedJob

NAME = "greenhouse"


def detect(url: str) -> str | None:
    host = urlparse(url).path.strip("/").split("/")
    netloc = urlparse(url).netloc.lower()
    if "greenhouse.io" in netloc and host:
        return host[0]
    return None


def jobs_url(board_token: str) -> str:
    return f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true"


def parse(payload: dict) -> list[ParsedJob]:
    out = []
    for j in payload.get("jobs", []):
        out.append(
            ParsedJob(
                external_id=str(j.get("id")),
                title=j.get("title", ""),
                location=j.get("location", {}).get("name", ""),
                url=j.get("absolute_url", ""),
                description=j.get("content", ""),
                department=", ".join(d.get("name", "") for d in j.get("departments", [])),
            )
        )
    return out
