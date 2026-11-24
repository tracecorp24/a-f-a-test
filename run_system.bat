@echo off
setlocal enabledelayedexpansion
title Agentic Framework Arena - Unified Runner

echo ===============================================================================
echo               AGENTIC FRAMEWORK ARENA - UNIFIED LAUNCHER
echo ===============================================================================
echo  One Task. One Model. Ten Native Frameworks.
echo  Architecture: Dual-Plane Control & Isolated Execution (ADR 0001 - 0016)
echo ===============================================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Configure PYTHONPATH for all kernel, contracts, SDKs, and services
set "PYTHONPATH=%ROOT_DIR%packages\kernel\src;%ROOT_DIR%packages\contracts\python\src;%ROOT_DIR%packages\worker-sdk\python\src;%ROOT_DIR%packages\shared-tool-sdk\src;%ROOT_DIR%services\experiment_controller\src;%ROOT_DIR%services\model_gateway\src;%ROOT_DIR%services\tool_broker\src;%ROOT_DIR%services\builder\src;%ROOT_DIR%services\telemetry\src;%ROOT_DIR%services\evaluation\src;%ROOT_DIR%services\recommendation\src;%ROOT_DIR%services\artifact_exporter\src;%ROOT_DIR%apps\api\src"

echo [*] Checking Python environment...
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python not found in PATH! Please install Python 3.11+.
    pause
    exit /b 1
)

echo [*] Checking Node.js environment...
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node/npm not found in PATH! Please install Node.js 18+.
    pause
    exit /b 1
)

echo [*] Starting FastAPI Backend on http://127.0.0.1:8080 ...
start "Agentic Arena - API (Port 8080)" cmd /k "cd /d "%ROOT_DIR%" && set "PYTHONPATH=%PYTHONPATH%" && python -m uvicorn arena_api.main:create_app --factory --host 127.0.0.1 --port 8080"

echo [*] Starting Vite Web UI on http://127.0.0.1:3000 ...
start "Agentic Arena - Web UI (Port 3000)" cmd /k "cd /d "%ROOT_DIR%apps\web" && npm run dev -- --host 127.0.0.1 --port 3000"

echo [*] Waiting for services to initialize...
timeout /t 3 /nobreak >nul

echo [*] Launching web browser to http://localhost:3000 ...
start http://localhost:3000

echo.
echo ===============================================================================
echo                     SYSTEM RUNNING SUCCESSFULLY!
echo ===============================================================================
echo  Web UI:        http://localhost:3000
echo  API Docs:      http://localhost:8080/docs
echo  OpenAPI Spec:  http://localhost:8080/openapi.json
echo.
echo  Quick Commands (run in a new terminal):
echo    - Run E2E Benchmark across 10 frameworks:
echo        python scripts\demo_benchmark.py
echo.
echo    - Run full automated test suite:
echo        pytest tests -q
echo.
echo  To shut down services, close the opened backend and web UI terminal windows.
echo ===============================================================================
echo.
pause
