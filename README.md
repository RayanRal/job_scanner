# job-scanner

Layers: `parsers` (pure) -> `db` -> `services`/`scanner` -> `api`. No cross-imports.

## Local

```sh
cp .env.example .env
docker compose up --build
# app: http://localhost:8000/  admin: X-Admin-Token header
```

DB only (run API from venv):

```sh
docker compose up db
DATABASE_URL=postgresql+psycopg://jobs:jobs@localhost:5432/jobs uvicorn app.main:app --reload
```

## Oracle Always-Free

Both images (`python:3.12-slim`, `postgres:16-alpine`) are multi-arch, fine on Ampere ARM.

1. Security list: open 8000 (or 80 via reverse proxy).
2. On VM: `docker compose up -d --build`, `restart: unless-stopped` is default-compose behavior — add it if you split services.
3. Backup: `0 * * * * docker exec job-scanner-db-1 pg_dump -U jobs jobs | gzip > ~/backup-$(date +\%F).sql.gz`
4. Reboot survival: enable docker (`sudo systemctl enable docker`), compose with `restart: unless-stopped`.
