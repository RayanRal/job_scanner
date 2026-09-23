from fastapi import Header, HTTPException

from app.core import config


def require_admin(x_admin_token: str = Header(default="")) -> None:
    if x_admin_token != config.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="forbidden")
