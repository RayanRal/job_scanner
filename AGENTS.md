# AGENTS.md

## What this is

Job scanner: users register companies with their careers-page URLs, app detects the job-board provider (Greenhouse, Lever etc), fetches open positions, and stores them in DB. Dashboard lists active jobs and allow users to filter them (text, location, tech-stack).


## Module structure

```
app/
  main.py              # entrypoint, re-exports the FastAPI app
  core/                # cross-cutting, dependency-free: config, tagger, security
  parsers/             # Provider parsers
  db/                  # Database layer, one module per aggregate
  scanner/             # Polling orchestration
  services/            # use-cases called by the API
  api/                 # FastAPI routes
templates/             # server-rendered dashboard (Jinja + HTMX)
```

Dependency direction, strictly one-way:

```
parsers → db → services/scanner → api
```

`api` may call `services` and `db/repos`, never `parsers` or `scanner` internals.
`scanner`/`services` may call `parsers` and `db/repos`, never `api`.
`parsers` imports only `parsers/types` (+ stdlib). `core` imports nothing internal.


## Design principles and current choices

- Deep modules, narrow interfaces.
- Code for readers who know the domain: comments minimal, only if choice might be controverisal and explaining why it was made is necessary.
- Dependencies are clearly one directional: storage layer can't know anything about json or parsing.

- Parsing is pure: providers map raw JSON → `ParsedJob`, nothing else;
- Prefer provider JSON APIs over HTML scraping; generic scraping is a last resort.
- Failure isolation: exponential backoff, `broken` status after consecutive failures — one dead board never blocks the rest.
- Jitter scans, polite fetching (timeouts, bounded concurrency, per-domain limits).

- FastAPI + SQLModel + Postgres, one Docker image, `uv` for deps, `ruff` + `mypy` gates (local `make lint`/`make typecheck`, CI on push/PR).
- At this point Postgres serves as queue: sources carry `next_scan_at`/`fail_count`/`status`; workers claim due rows with `SELECT … FOR UPDATE SKIP LOCKED`.
