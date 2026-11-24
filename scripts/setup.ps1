# PowerShell cross-platform setup script
Write-Host "Setting up Agentic Arena..." -ForegroundColor Cyan

python -m uv sync
npx pnpm install

Write-Host "Setup completed successfully!" -ForegroundColor Green
