FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
COPY packages/ packages/
COPY services/ services/
COPY apps/api/ apps/api/

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    pydantic \
    pydantic-settings \
    structlog \
    sqlalchemy \
    psycopg[binary]

ENV PYTHONPATH="/app/packages/kernel/src:/app/packages/contracts/python/src:/app/services/experiment_controller/src:/app/apps/api/src"

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "arena_api.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
