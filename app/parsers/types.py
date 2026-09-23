from dataclasses import dataclass


@dataclass(frozen=True)
class ParsedJob:
    external_id: str
    title: str
    location: str
    url: str
    description: str = ""
    department: str = ""
