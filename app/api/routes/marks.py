from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db.models import User
from app.services import auth
from app.services import marks as svc

router = APIRouter(prefix="/api/marks")


class MarkBody(BaseModel):
    job_id: int
    status: str


def _uid(user: User) -> int:
    if user.id is None:
        raise HTTPException(status_code=500, detail="user not authenticated")
    return user.id


@router.put("")
def set_mark(body: MarkBody, user: User = Depends(auth.get_current_user)):
    return svc.set_mark(_uid(user), body.job_id, body.status)


@router.delete("/{job_id}")
def remove_mark(job_id: int, user: User = Depends(auth.get_current_user)):
    svc.remove_mark(_uid(user), job_id)
    return {"ok": True}


@router.get("")
def list_marks(status: str | None = None, user: User = Depends(auth.get_current_user)):
    return svc.list_marked(_uid(user), status)
