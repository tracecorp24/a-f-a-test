# PowerShell cross-platform check script
Write-Host "Running Agentic Arena Validation..." -ForegroundColor Cyan

Write-Host "1. Ruff linter & formatter check..."
python -m uv run ruff check .
python -m uv run ruff format --check .

Write-Host "2. Mypy strict typecheck..."
python -m uv run mypy .

Write-Host "3. Pytest suite..."
python -m uv run pytest

Write-Host "All checks passed!" -ForegroundColor Green
