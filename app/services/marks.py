from fastapi import HTTPException

from app.db.models import Job, UserJobMark
from app.db.repos import marks as mark_repo

STATUSES = ("interested", "applied")


def set_mark(user_id: int, job_id: int, status: str) -> UserJobMark:
    if status not in STATUSES:
        raise HTTPException(status_code=400, detail="unknown status")
    mark = mark_repo.set_mark(user_id, job_id, status)
    # currently only reason why mark can be None is that job is not found
    # but we might want to introduce proper error codes later
    if mark is None:
        raise HTTPException(status_code=404, detail="job not found")
    return mark


def remove_mark(user_id: int, job_id: int) -> None:
    if not mark_repo.remove_mark(user_id, job_id):
        raise HTTPException(status_code=404, detail="mark not found")


def list_marked(user_id: int, status: str | None) -> list[Job]:
    if status is not None and status not in STATUSES:
        raise HTTPException(status_code=400, detail="unknown status")
    return mark_repo.list_marked(user_id, status)
