from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.scanner import executor


def create() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(executor.scan_due, "interval", minutes=1)
    return scheduler
