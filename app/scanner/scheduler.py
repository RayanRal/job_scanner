from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core import config
from app.scanner import executor


async def tick() -> None:
    if config.SCAN_ENABLED:
        await executor.scan_due()


def create() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(tick, "interval", minutes=1)
    return scheduler
