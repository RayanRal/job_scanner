from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(UTC)


class Company(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    created_at: datetime = Field(default_factory=utcnow)


class Source(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    company_id: int = Field(foreign_key="company.id", index=True)
    url: str
    provider: str = Field(index=True)
    board_token: str
    status: str = Field(default="active", index=True)
    next_scan_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    fail_count: int = 0
    last_error: str = ""


class Job(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    source_id: int = Field(foreign_key="source.id", index=True)
    external_id: str = Field(index=True)
    title: str = Field(index=True)
    location: str = Field(default="", index=True)
    department: str = ""
    url: str = ""
    description: str = ""
    tags: str = Field(default="", index=True)
    is_active: bool = Field(default=True, index=True)
    first_seen: datetime = Field(default_factory=utcnow)
    last_seen: datetime = Field(default_factory=utcnow)
