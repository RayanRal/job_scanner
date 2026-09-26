import hashlib
import secrets
from datetime import timedelta

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session as DBSession
from sqlmodel import select

from app.core import passwords
from app.db import engine as eng
from app.db.models import Session as UserSession
from app.db.models import User, utcnow

SESSION_DAYS = 30

bearer = HTTPBearer(auto_error=False)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _new_session(s: DBSession, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    s.add(
        UserSession(
            token_hash=token_hash(token),
            user_id=user_id,
            expires_at=utcnow() + timedelta(days=SESSION_DAYS),
        )
    )
    s.commit()
    return token


def register(email: str, password: str) -> str:
    email = email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=400, detail="invalid email")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="password too short")
    with eng.session() as s:
        if s.exec(select(User).where(User.email == email)).first():
            raise HTTPException(status_code=400, detail="email taken")
        user = User(email=email, password_hash=passwords.hash_password(password))
        s.add(user)
        s.commit()
        s.refresh(user)
        if user.id is None:
            raise HTTPException(status_code=500, detail="user not created")
        return _new_session(s, user.id)


def login(email: str, password: str) -> str:
    with eng.session() as s:
        user = s.exec(select(User).where(User.email == email.strip().lower())).first()
        if (
            user is None
            or user.id is None
            or not passwords.verify_password(password, user.password_hash)
        ):
            raise HTTPException(status_code=401, detail="invalid credentials")
        return _new_session(s, user.id)


def logout(token: str) -> None:
    with eng.session() as s:
        session = s.exec(
            select(UserSession).where(UserSession.token_hash == token_hash(token))
        ).first()
        if session:
            s.delete(session)
            s.commit()


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="not authenticated")
    with eng.session() as s:
        session = s.exec(
            select(UserSession).where(UserSession.token_hash == token_hash(credentials.credentials))
        ).first()
        if session is None or session.expires_at <= utcnow():
            if session:
                s.delete(session)
                s.commit()
            raise HTTPException(status_code=401, detail="not authenticated")
        user = s.get(User, session.user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="not authenticated")
        return user
