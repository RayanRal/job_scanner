from app.scanner import executor


async def scan_due() -> int:
    return await executor.scan_due()
