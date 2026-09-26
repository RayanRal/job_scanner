from fastapi import APIRouter

from app.db.repos import jobs as job_repo

router = APIRouter()


@router.get("/api/jobs")
def api_jobs(q: str = "", location: str = "", tag: str = ""):
    return job_repo.search(q, location, tag)
