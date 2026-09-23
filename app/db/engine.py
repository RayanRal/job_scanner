from sqlmodel import Session, SQLModel, create_engine

from app.core import config
from app.db import models  # noqa: F401

engine = create_engine(config.DATABASE_URL, pool_pre_ping=True)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def session() -> Session:
    return Session(engine)
