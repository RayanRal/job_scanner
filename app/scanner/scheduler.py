from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.scanner import executor

_scheduler: AsyncIOScheduler | None = None


def start() -> AsyncIOScheduler:
    global _scheduler
    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(executor.scan_due, "interval", minutes=1)
    _scheduler.start()
    return _scheduler


def stop() -> None:
    if _scheduler:
        _scheduler.shutdown(wait=False)
