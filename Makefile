sync:
	uv sync

lint:
	uv run ruff check .
	uv run ruff format --check .

fix:
	uv run ruff check --fix .
	uv run ruff format .

typecheck:
	uv run mypy app

run:
	uv run uvicorn app.main:app --reload
