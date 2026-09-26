from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import admin, dashboard
from app.db.engine import init_db
from app.scanner import scheduler

STATIC_DIR = Path(__file__).resolve().parents[1] / "static"


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
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/", include_in_schema=False)
    @app.get("/admin", include_in_schema=False)
    def spa() -> FileResponse:
        return FileResponse(STATIC_DIR / "index.html")

    return app


app = create_app()
