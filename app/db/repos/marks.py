from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlmodel import col, select

from app.db import engine as eng
from app.db.models import Job, UserJobMark


def set_mark(user_id: int, job_id: int, status: str) -> UserJobMark | None:
    with eng.session() as s:
        if s.get(Job, job_id) is None:
            return None
        mark = s.scalars(
            pg_insert(UserJobMark)
            .values(user_id=user_id, job_id=job_id, status=status)
            .on_conflict_do_update(index_elements=["user_id", "job_id"], set_={"status": status})
            .returning(UserJobMark)
        ).first()
        s.commit()
        return mark


def remove_mark(user_id: int, job_id: int) -> bool:
    with eng.session() as s:
        mark = s.exec(
            select(UserJobMark).where(UserJobMark.user_id == user_id, UserJobMark.job_id == job_id)
        ).first()
        if mark is None:
            return False
        s.delete(mark)
        s.commit()
        return True


def list_marked(user_id: int, status: str | None = None) -> list[Job]:
    with eng.session() as s:
        stmt = (
            select(Job)
            .join(UserJobMark, col(Job.id) == col(UserJobMark.job_id))
            .where(col(UserJobMark.user_id) == user_id)
            .order_by(col(UserJobMark.created_at).desc())
        )
        if status:
            stmt = stmt.where(col(UserJobMark.status) == status)
        return list(s.exec(stmt).all())
