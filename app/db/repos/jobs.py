from sqlmodel import col, select

from app.db import engine as eng
from app.db.models import Job, utcnow
from app.parsers.types import ParsedJob


def upsert_jobs(source_id: int, parsed: list[ParsedJob], tagger) -> None:
    seen = set()
    with eng.session() as s:
        for p in parsed:
            seen.add(p.external_id)
            tags = ",".join(tagger(p.title, p.description, p.location))
            existing = s.exec(
                select(Job).where(Job.source_id == source_id, Job.external_id == p.external_id)
            ).first()
            if existing:
                existing.title = p.title
                existing.location = p.location
                existing.department = p.department
                existing.url = p.url
                existing.description = p.description
                existing.tags = tags
                existing.is_active = True
                existing.last_seen = utcnow()
                s.add(existing)
            else:
                s.add(
                    Job(
                        source_id=source_id,
                        external_id=p.external_id,
                        title=p.title,
                        location=p.location,
                        department=p.department,
                        url=p.url,
                        description=p.description,
                        tags=tags,
                    )
                )
        for old in s.exec(select(Job).where(Job.source_id == source_id, Job.is_active)).all():
            if old.external_id not in seen:
                old.is_active = False
                s.add(old)
        s.commit()


def search(query: str = "", location: str = "", tag: str = "", limit: int = 200) -> list[Job]:
    with eng.session() as s:
        stmt = select(Job).where(Job.is_active).order_by(col(Job.last_seen).desc()).limit(limit)
        if query:
            stmt = stmt.where(col(Job.title).ilike(f"%{query}%"))
        if location:
            stmt = stmt.where(col(Job.location).ilike(f"%{location}%"))
        if tag:
            stmt = stmt.where(col(Job.tags).ilike(f"%{tag}%"))
        return list(s.exec(stmt).all())
