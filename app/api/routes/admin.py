from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import require_admin
from app.db.repos import companies, sources
from app.db.repos.sources import reschedule
from app.services import scans
from app.services import sources as svc

router = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])


class AddCompany(BaseModel):
    name: str
    url: str


@router.post("/companies")
def add_company(body: AddCompany):
    return svc.create_company_with_source(body.name, body.url)


@router.get("/companies")
def get_companies():
    return companies.list_all()


@router.get("/sources")
def get_sources():
    return sources.list_all()


@router.post("/scan")
async def scan_all():
    return {"scanned": await scans.scan_due()}


@router.post("/sources/{source_id}/scan")
def scan_one(source_id: int):
    reschedule(source_id)
    return {"queued": source_id}
