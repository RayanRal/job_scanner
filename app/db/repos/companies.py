from sqlmodel import select

from app.db import engine as eng
from app.db.models import Company


def create(name: str) -> Company:
    with eng.session() as s:
        c = Company(name=name)
        s.add(c)
        s.commit()
        s.refresh(c)
        return c


def list_all() -> list[Company]:
    with eng.session() as s:
        return list(s.exec(select(Company).order_by(Company.name)).all())
