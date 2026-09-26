from fastapi import APIRouter, Depends

from app.db.models import User
from app.db.repos import jobs as job_repo
from app.services import auth

router = APIRouter()


@router.get("/api/jobs")
def api_jobs(
    user: User = Depends(auth.get_current_user), q: str = "", location: str = "", tag: str = ""
):
    return job_repo.search(q, location, tag)
