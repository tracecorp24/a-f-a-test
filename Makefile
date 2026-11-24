.PHONY: help setup check lint format test test-unit test-integration contracts compose-up compose-down clean

help:
	@echo "Agentic Arena Development Makefile"
	@echo "  make setup        - Install dependencies across Python and TypeScript"
	@echo "  make check        - Run linters, type checks, and tests"
	@echo "  make lint         - Run ruff and eslint"
	@echo "  make format       - Format code using ruff and prettier"
	@echo "  make test         - Run full test suite"
	@echo "  make contracts    - Re-generate Python and TypeScript contracts from JSON Schema"
	@echo "  make compose-up   - Start Docker compose core services"
	@echo "  make compose-down - Stop Docker compose services"

setup:
	python -m uv sync
	pnpm install

check: lint test

lint:
	python -m uv run ruff check .
	python -m uv run mypy .

format:
	python -m uv run ruff format .

test:
	python -m uv run pytest

contracts:
	powershell -File ./scripts/generate-contracts.ps1

compose-up:
	docker compose --profile core up -d

compose-down:
	docker compose down -v
