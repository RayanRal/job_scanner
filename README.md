# job-scanner

Layers: `parsers` (pure) -> `db` -> `services`/`scanner` -> `api`. No cross-imports.

## Local

```sh
uv sync
cp -n .env.example .env
docker compose up db   # postgres on :5432
make run               # http://localhost:8000/
```

Or everything in Docker:

```sh
docker compose up --build
# app: http://localhost:8000/  admin: X-Admin-Token header
```

Checks: `make lint`, `make typecheck`.

## Oracle Always-Free

Both images (`python:3.12-slim`, `postgres:16-alpine`) are multi-arch, fine on Ampere ARM.

1. Security list: open 8000 (or 80 via reverse proxy).
2. On VM: `docker compose up -d --build`, `restart: unless-stopped` is default-compose behavior — add it if you split services.
3. Backup: `0 * * * * docker exec job-scanner-db-1 pg_dump -U jobs jobs | gzip > ~/backup-$(date +\%F).sql.gz`
4. Reboot survival: enable docker (`sudo systemctl enable docker`), compose with `restart: unless-stopped`.
