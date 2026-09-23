from fastapi import HTTPException

from app.db.repos import companies, sources
from app.parsers import registry


def create_company_with_source(name: str, url: str):
    found = registry.detect(url)
    if not found:
        raise HTTPException(status_code=400, detail="unsupported provider")
    provider, board_token = found
    company = companies.create(name)
    return sources.create(company.id, url, provider, board_token)
