"""FastAPI application factory, routers, and middlewares (F0.7)."""

import uuid
from typing import Any
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from arena_kernel.errors import (
    ArenaError,
    IllegalStateTransitionError,
    ModelOverrideDeniedError,
    ResourceNotFoundError,
    SpecNotApprovedError,
)
from arena_kernel.hashing import canonical_json_hash
from arena_kernel.ids import generate_id
from arena_kernel.logging import configure_logging, get_logger

logger = get_logger("arena.api")


def create_app() -> FastAPI:
    """Create and configure the main FastAPI control plane application."""
    configure_logging()
    app = FastAPI(
        title="Agentic Arena API",
        version="0.1.0",
        description="REST Control Plane for Agentic Framework Arena",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def correlation_id_middleware(request: Request, call_next: Any) -> Response:
        corr_id = request.headers.get("X-Correlation-ID") or generate_id("req")
        request.state.correlation_id = corr_id
        response: Response = await call_next(request)
        response.headers["X-Correlation-ID"] = corr_id
        return response

    @app.exception_handler(ArenaError)
    async def arena_error_handler(request: Request, exc: ArenaError) -> JSONResponse:
        corr_id = getattr(request.state, "correlation_id", "unknown")
        status_code = status.HTTP_400_BAD_REQUEST
        if isinstance(exc, ResourceNotFoundError):
            status_code = status.HTTP_404_NOT_FOUND
        elif isinstance(exc, ModelOverrideDeniedError):
            status_code = status.HTTP_403_FORBIDDEN
        elif isinstance(exc, (IllegalStateTransitionError, SpecNotApprovedError)):
            status_code = status.HTTP_409_CONFLICT

        error_body = {
            "code": exc.code,
            "message": exc.message,
            "details": exc.details,
            "correlation_id": corr_id,
            "retryable": exc.retryable,
        }
        return JSONResponse(status_code=status_code, content=error_body)

    # Health & Readiness endpoints
    @app.get("/healthz")
    async def healthz() -> dict[str, str]:
        return {"status": "healthy"}

    @app.get("/readyz")
    async def readyz() -> dict[str, str]:
        return {"status": "ready"}

    # In-memory store for F0 demonstrations & fast tests
    projects_store: dict[str, dict[str, Any]] = {}
    specs_store: dict[str, dict[str, Any]] = {}

    class CreateProjectRequest(BaseModel):
        name: str
        owner: str | None = None

    class CreateSpecRequest(BaseModel):
        task_data: dict[str, Any]

    @app.post("/v1/projects", status_code=status.HTTP_201_CREATED)
    async def create_project(req: CreateProjectRequest) -> dict[str, Any]:
        prj_id = generate_id("prj")
        project = {
            "id": prj_id,
            "name": req.name,
            "owner": req.owner,
            "archived": False,
        }
        projects_store[prj_id] = project
        return project

    @app.get("/v1/projects")
    async def list_projects() -> list[dict[str, Any]]:
        return list(projects_store.values())

    @app.post("/v1/projects/{project_id}/specs", status_code=status.HTTP_201_CREATED)
    async def create_spec(project_id: str, req: CreateSpecRequest) -> dict[str, Any]:
        if project_id not in projects_store:
            raise ResourceNotFoundError("Project", project_id)
        spec_id = generate_id("spc")
        spec_hash = canonical_json_hash(req.task_data)
        spec = {
            "id": spec_id,
            "project_id": project_id,
            "revision": 1,
            "spec_hash": spec_hash,
            "status": "draft",
            "task_data": req.task_data,
            "approved_at": None,
        }
        specs_store[spec_id] = spec
        return spec

    @app.post("/v1/specs/{spec_id}/approve")
    async def approve_spec(spec_id: str, expected_hash: str) -> dict[str, Any]:
        spec = specs_store.get(spec_id)
        if not spec:
            raise ResourceNotFoundError("TaskSpec", spec_id)
        if spec["spec_hash"] != expected_hash:
            raise ArenaError(
                code="SPEC_HASH_MISMATCH",
                message=f"Provided hash '{expected_hash}' does not match spec hash '{spec['spec_hash']}'",
                retryable=False,
            )
        spec["status"] = "approved"
        from datetime import datetime, timezone
        spec["approved_at"] = datetime.now(timezone.utc).isoformat()
        return spec

    return app
