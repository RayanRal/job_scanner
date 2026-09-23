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
