from urllib.parse import urlparse

from app.parsers.types import ParsedJob

NAME = "ashby"


def detect(url: str) -> str | None:
    p = urlparse(url)
    if "ashbyhq.com" in p.netloc.lower():
        parts = p.path.strip("/").split("/")
        return parts[0] if parts and parts[0] else None
    return None


def jobs_url(board_token: str) -> str:
    return f"https://api.ashbyhq.com/posting-api/job-board/{board_token}"


def parse(payload: dict) -> list[ParsedJob]:
    out = []
    for j in payload.get("jobs", []):
        out.append(
            ParsedJob(
                external_id=str(j.get("id")),
                title=j.get("title", ""),
                location=j.get("locationName", ""),
                url=j.get("jobUrl", ""),
                description=j.get("descriptionHtml", ""),
                department=j.get("departmentName", ""),
            )
        )
    return out
