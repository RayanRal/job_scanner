from datetime import datetime, timedelta

from sqlmodel import select

from app.core import config
from app.db import engine as eng
from app.db.models import Source


def create(company_id: int, url: str, provider: str, board_token: str) -> Source:
    with eng.session() as s:
        src = Source(company_id=company_id, url=url, provider=provider, board_token=board_token)
        s.add(src)
        s.commit()
        s.refresh(src)
        return src


def list_all() -> list[Source]:
    with eng.session() as s:
        return list(s.exec(select(Source).order_by(Source.id)).all())


def claim_due(limit: int) -> list[Source]:
    with eng.session() as s:
        rows = s.exec(
            select(Source)
            .where(Source.status == "active", Source.next_scan_at <= datetime.utcnow())
            .order_by(Source.next_scan_at)
            .limit(limit)
            .with_for_update(skip_locked=True)
        ).all()
        claimed = []
        for r in rows:
            r.status = "queued"
            s.add(r)
            claimed.append(r)
        s.commit()
        return claimed


def mark_success(source_id: int) -> None:
    with eng.session() as s:
        src = s.get(Source, source_id)
        src.status = "active"
        src.fail_count = 0
        src.last_error = ""
        src.next_scan_at = datetime.utcnow() + timedelta(seconds=config.SCAN_INTERVAL_SECONDS)
        s.add(src)
        s.commit()


def mark_failed(source_id: int, error: str) -> None:
    with eng.session() as s:
        src = s.get(Source, source_id)
        src.fail_count += 1
        src.last_error = error[:500]
        backoff = min(2**src.fail_count * 300, 86400)
        src.next_scan_at = datetime.utcnow() + timedelta(seconds=backoff)
        src.status = "broken" if src.fail_count >= 10 else "active"
        s.add(src)
        s.commit()


def reschedule(source_id: int) -> None:
    with eng.session() as s:
        src = s.get(Source, source_id)
        src.next_scan_at = datetime.utcnow()
        if src.status == "broken":
            src.status = "active"
            src.fail_count = 0
        s.add(src)
        s.commit()
