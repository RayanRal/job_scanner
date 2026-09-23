from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.db.repos import jobs as job_repo

router = APIRouter()
templates = Jinja2Templates(directory=str(Path(__file__).resolve().parents[3] / "templates"))


@router.get("/api/jobs")
def api_jobs(q: str = "", location: str = "", tag: str = ""):
    return job_repo.search(q, location, tag)


@router.get("/", response_class=HTMLResponse)
def dashboard(request: Request, q: str = "", location: str = "", tag: str = ""):
    return templates.TemplateResponse(
        request,
        "dashboard.html",
        {
            "jobs": job_repo.search(q, location, tag),
            "q": q,
            "location": location,
            "tag": tag,
        },
    )
