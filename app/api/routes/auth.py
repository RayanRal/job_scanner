from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.db.models import User
from app.services import auth

router = APIRouter(prefix="/api/auth")


class Credentials(BaseModel):
    email: str
    password: str


@router.post("/register", status_code=201)
def register(body: Credentials):
    return {"token": auth.register(body.email, body.password)}


@router.post("/login")
def login(body: Credentials):
    return {"token": auth.login(body.email, body.password)}


@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(auth.bearer)):
    if credentials:
        auth.logout(credentials.credentials)
    return {"ok": True}


@router.get("/me")
def me(user: User = Depends(auth.get_current_user)):
    return {"id": user.id, "email": user.email}
