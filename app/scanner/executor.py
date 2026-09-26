import asyncio

import httpx

from app.core import config, tagger
from app.db.repos import jobs as job_repo
from app.db.repos import sources as source_repo
from app.parsers import registry
from app.scanner import departments

HEADERS = {"User-Agent": "job-scanner/0.1"}


async def scan_source(
    client: httpx.AsyncClient, source_id: int, provider: str, board_token: str
) -> None:
    try:
        r = await client.get(registry.jobs_url(provider, board_token), headers=HEADERS, timeout=15)
        r.raise_for_status()
        parsed = registry.parse(provider, r.json())
        wanted = [p for p in parsed if not departments.is_excluded(p.department)]
        job_repo.upsert_jobs(source_id, wanted, tagger.extract_tags)
        source_repo.mark_success(source_id)
    except Exception as e:
        source_repo.mark_failed(source_id, str(e))


async def scan_due() -> int:
    due = await asyncio.to_thread(source_repo.claim_due, config.SCAN_BATCH_SIZE)
    sem = asyncio.Semaphore(config.SCAN_CONCURRENCY)
    async with httpx.AsyncClient() as client:

        async def run(src):
            async with sem:
                await scan_source(client, src.id, src.provider, src.board_token)

        await asyncio.gather(*(run(s) for s in due))
    return len(due)
