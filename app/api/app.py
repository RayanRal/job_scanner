from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import admin, dashboard
from app.db.engine import init_db
from app.scanner import scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    sched = scheduler.create()
    sched.start()
    yield
    sched.shutdown(wait=False)


def create_app() -> FastAPI:
    app = FastAPI()
    app.include_router(dashboard.router)
    app.include_router(admin.router)
    return app


app = create_app()
