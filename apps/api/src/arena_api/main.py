"""FastAPI application factory, full REST API endpoints, and middlewares (GP §14.2)."""

import hashlib
import io
import os
import zipfile
from pathlib import Path
from typing import Any, Literal

import yaml
from fastapi import FastAPI, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from arena_api import runner
from arena_api.experiments import (
    DEFAULT_THRESHOLD,
    MAX_REPETITIONS,
    ArenaState,
    now_iso,
)
from arena_api.task_design import router as task_design_router
from arena_artifact_exporter.domain.exporter import ArtifactExporter
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
from arena_recommendation.domain.ranking import CandidateBenchmarkData, RankingEngine

logger = get_logger("arena.api")

ROOT = runner.ROOT
EXPORT_FORMATS = {
    "zip": ("README.md", "Dockerfile", "pyproject.toml", "main.py", ".env.example"),
    "docker": ("README.md", "Dockerfile", "pyproject.toml", "main.py", ".env.example"),
    "poetry": ("README.md", "pyproject.toml", "main.py", ".env.example"),
}


def _state_file() -> Path | None:
    configured = os.getenv("ARENA_STATE_FILE")
    if configured == "":
        return None  # explicitly disabled (tests)
    return Path(configured) if configured else ROOT / "data" / "arena_state.json"


def create_app() -> FastAPI:
    """Create and configure the main FastAPI control plane application."""
    configure_logging()
    app = FastAPI(
        title="Agentic Arena API",
        version="0.1.0",
        description="REST Control Plane for Agentic Framework Arena",
    )
    app.include_router(task_design_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Correlation-ID", "X-Content-SHA256", "Content-Disposition"],
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
            "detail": exc.message,
            "details": exc.details,
            "correlation_id": corr_id,
            "retryable": exc.retryable,
        }
        return JSONResponse(status_code=status_code, content=error_body)

    # Health & Readiness
    @app.get("/healthz")
    async def healthz() -> dict[str, str]:
        return {"status": "healthy"}

    @app.get("/readyz")
    async def readyz() -> dict[str, str]:
        return {"status": "ready"}

    state = ArenaState(_state_file())
    ranking_engine = RankingEngine()
    exporter = ArtifactExporter()

    # DTOs
    class CreateProjectRequest(BaseModel):
        name: str = Field(min_length=1, max_length=200)
        owner: str | None = None

    class CreateSpecRequest(BaseModel):
        task_data: dict[str, Any]

    class CreateExperimentRequest(BaseModel):
        spec_id: str
        model_snapshot: str = "selected-model-v1"

    class RankingRequest(BaseModel):
        weights: dict[str, float] | None = None
        min_quality: float = Field(default=0.0, ge=0.0, le=100.0)

    # System status
    @app.get("/v1/system/status")
    async def system_status() -> dict[str, Any]:
        fixture = runner.fixture_state()
        with state.lock:
            usage_totals = state.usage_totals(list(state.candidates))
        return {
            "api": "healthy",
            "frameworks": len(runner.DEFAULT_FRAMEWORKS),
            "fixture": fixture,
            "design_model_configured": bool(os.getenv("ARENA_DESIGN_MODEL") and os.getenv("ARENA_DESIGN_API_KEY")),
            "experiments": len(state.experiments),
            "executor": "native-worker-skeleton",
            "token_usage": usage_totals,
        }

    # Projects & Specs
    @app.post("/v1/projects", status_code=status.HTTP_201_CREATED)
    async def create_project(req: CreateProjectRequest) -> dict[str, Any]:
        prj_id = generate_id("prj")
        project = {
            "id": prj_id,
            "name": req.name,
            "owner": req.owner,
            "archived": False,
            "created_at": now_iso(),
        }
        state.projects[prj_id] = project
        state.save()
        return project

    @app.get("/v1/projects")
    async def list_projects() -> list[dict[str, Any]]:
        return list(state.projects.values())

    @app.post("/v1/projects/{project_id}/specs", status_code=status.HTTP_201_CREATED)
    async def create_spec(project_id: str, req: CreateSpecRequest) -> dict[str, Any]:
        if project_id not in state.projects:
            raise ResourceNotFoundError("Project", project_id)
        spec_id = generate_id("spc")
        spec = {
            "id": spec_id,
            "project_id": project_id,
            "revision": 1,
            "spec_hash": canonical_json_hash(req.task_data),
            "status": "draft",
            "task_data": req.task_data,
            "approved_at": None,
        }
        state.specs[spec_id] = spec
        state.save()
        return spec

    @app.get("/v1/specs/{spec_id}")
    async def get_spec(spec_id: str) -> dict[str, Any]:
        spec = state.specs.get(spec_id)
        if not spec:
            raise ResourceNotFoundError("TaskSpec", spec_id)
        return spec

    @app.post("/v1/specs/{spec_id}/approve")
    async def approve_spec(spec_id: str, expected_hash: str) -> dict[str, Any]:
        spec = state.specs.get(spec_id)
        if not spec:
            raise ResourceNotFoundError("TaskSpec", spec_id)
        if spec["spec_hash"] != expected_hash:
            raise ArenaError(
                code="SPEC_HASH_MISMATCH",
                message=f"Provided hash '{expected_hash}' does not match spec hash '{spec['spec_hash']}'",
                retryable=False,
            )
        spec["status"] = "approved"
        spec["approved_at"] = now_iso()
        state.save()
        return spec

    # Frameworks Registry (GP §14.2)
    @app.get("/v1/frameworks")
    async def list_frameworks() -> dict[str, Any]:
        catalog_path = ROOT / "registry" / "framework-catalog.yaml"
        data: dict[str, Any] = {"frameworks": []}
        if catalog_path.exists():
            with open(catalog_path, encoding="utf-8") as f:
                data = yaml.safe_load(f) or data
        by_id = {v: k for k, v in runner.FRAMEWORK_IDS.items()}
        for fw in data.get("frameworks", []):
            fw["display_name"] = by_id.get(fw["id"], fw.get("name", fw["id"]))
            try:
                fw["manifest_errors"] = runner.validate_manifest(runner.load_manifest(fw["id"]), fw["id"])
            except FileNotFoundError:
                fw["manifest_errors"] = ["manifest not found"]
        return data

    @app.get("/v1/frameworks/{framework_id}/runtime")
    async def framework_runtime(framework_id: str) -> dict[str, Any]:
        try:
            manifest_dir = runner.runtime_dir(framework_id)
        except FileNotFoundError:
            raise ResourceNotFoundError("Framework", framework_id) from None
        manifest_text = (manifest_dir / "manifest.yaml").read_text(encoding="utf-8")
        manifest = yaml.safe_load(manifest_text) or {}
        files = exporter.export_project(framework_id, runner.standalone_source(framework_id), f"arena-export-{framework_id}")
        return {
            "framework_id": framework_id,
            "manifest": manifest_text,
            "source": runner.load_skeleton_source(framework_id),
            "dockerfile": files["Dockerfile"],
            "version": manifest.get("release_version"),
            "capabilities": manifest.get("capabilities", {}),
            "manifest_errors": runner.validate_manifest(manifest, framework_id),
        }

    @app.post("/v1/frameworks/{framework_id}/verify")
    async def verify_framework(framework_id: str) -> dict[str, Any]:
        try:
            manifest = runner.load_manifest(framework_id)
        except FileNotFoundError:
            raise ResourceNotFoundError("Framework", framework_id) from None
        errors = runner.validate_manifest(manifest, framework_id)
        smoke = runner.smoke_test(framework_id)
        verified = not errors and smoke["passed"]
        return {
            "framework_id": framework_id,
            "verification_status": "verified" if verified else "failed",
            "manifest_valid": not errors,
            "manifest_errors": errors,
            "smoke_test": smoke,
            "timestamp": now_iso(),
        }

    # Experiments Lifecycle
    @app.post("/v1/experiments", status_code=status.HTTP_201_CREATED)
    async def create_experiment(req: CreateExperimentRequest) -> dict[str, Any]:
        spec = state.specs.get(req.spec_id)
        if not spec:
            raise ResourceNotFoundError("TaskSpec", req.spec_id)
        if spec["status"] != "approved":
            raise SpecNotApprovedError(req.spec_id)

        task = spec["task_data"]
        repetitions = max(1, min(MAX_REPETITIONS, int(task.get("repetitions") or 1)))
        raw_threshold = task.get("threshold")
        threshold = float(raw_threshold) if raw_threshold is not None else DEFAULT_THRESHOLD
        if threshold > 1:
            threshold /= 100
        exp_id = generate_id("exp")
        experiment = {
            "id": exp_id,
            "spec_id": req.spec_id,
            "objective": str(task.get("objective", ""))[:2000],
            "model_snapshot": req.model_snapshot,
            "status": "created",
            "candidates": [],
            "repetitions": repetitions,
            "threshold": min(1.0, max(0.0, threshold)),
            "created_at": now_iso(),
            "started_at": None,
            "finished_at": None,
            "error": None,
            "events": [],
            "event_seq": 0,
        }
        state.experiments[exp_id] = experiment
        state.save()
        return state.detail(experiment)

    @app.get("/v1/experiments")
    async def list_experiments() -> list[dict[str, Any]]:
        items = [state.summary(e) for e in state.experiments.values()]
        return sorted(items, key=lambda e: e["created_at"], reverse=True)

    @app.post("/v1/experiments/{exp_id}/build", status_code=status.HTTP_202_ACCEPTED)
    async def build_experiment(exp_id: str) -> dict[str, Any]:
        exp = state.experiment(exp_id)
        spec_data = state.specs[exp["spec_id"]]["task_data"]
        frameworks = spec_data.get("frameworks") or runner.DEFAULT_FRAMEWORKS
        unknown = [fw for fw in frameworks if fw not in runner.DEFAULT_FRAMEWORKS]
        if unknown or not frameworks:
            raise ArenaError(
                code="UNKNOWN_FRAMEWORK",
                message=f"Bilinmeyen framework: {', '.join(unknown) or '(boş liste)'}",
                details={"unknown": unknown},
            )
        ids = state.build(exp, list(dict.fromkeys(frameworks)))
        return {"experiment_id": exp_id, "status": "built", "candidates_count": len(ids)}

    @app.post("/v1/experiments/{exp_id}/run", status_code=status.HTTP_202_ACCEPTED)
    async def run_experiment(exp_id: str) -> dict[str, Any]:
        exp = state.experiment(exp_id)
        state.start(exp)
        return {"experiment_id": exp_id, "status": exp["status"]}

    @app.post("/v1/experiments/{exp_id}/pause")
    async def pause_experiment(exp_id: str) -> dict[str, Any]:
        exp = state.experiment(exp_id)
        state.pause(exp)
        return {"experiment_id": exp_id, "status": exp["status"]}

    @app.post("/v1/experiments/{exp_id}/resume")
    async def resume_experiment(exp_id: str) -> dict[str, Any]:
        exp = state.experiment(exp_id)
        state.resume(exp)
        return {"experiment_id": exp_id, "status": exp["status"]}

    @app.post("/v1/experiments/{exp_id}/cancel")
    async def cancel_experiment(exp_id: str) -> dict[str, Any]:
        exp = state.experiment(exp_id)
        state.cancel(exp)
        return {"experiment_id": exp_id, "status": exp["status"]}

    @app.get("/v1/experiments/{exp_id}")
    async def get_experiment(exp_id: str) -> dict[str, Any]:
        return state.detail(state.experiment(exp_id))

    @app.get("/v1/experiments/{exp_id}/events")
    async def get_experiment_events(exp_id: str, after: int = Query(default=0, ge=0)) -> dict[str, Any]:
        return state.events_after(state.experiment(exp_id), after)

    @app.get("/v1/experiments/{exp_id}/comparison")
    async def get_experiment_comparison(exp_id: str) -> dict[str, Any]:
        exp = state.experiment(exp_id)
        comparisons = []
        for cid in exp["candidates"]:
            can = state.candidates[cid]
            comparisons.append({
                "candidate_id": can["id"],
                "framework_id": can["framework_id"],
                "status": can["status"],
                "metrics": can["metrics"],
                "evaluation": can["evaluation"],
                "usage": can["usage"],
                "duration_ms": can.get("duration_ms"),
                "telemetry": can["telemetry"],
            })
        return {
            "experiment_id": exp_id,
            "status": exp["status"],
            "objective": exp.get("objective", ""),
            "threshold": exp["threshold"],
            "repetitions": exp["repetitions"],
            "fixture": exp.get("fixture"),
            "usage_totals": state.usage_totals(exp["candidates"]),
            "comparisons": comparisons,
        }

    @app.post("/v1/experiments/{exp_id}/rankings")
    async def calculate_rankings(exp_id: str, req: RankingRequest) -> dict[str, Any]:
        exp = state.experiment(exp_id)
        data: list[CandidateBenchmarkData] = []
        below_quality: list[str] = []
        for cid in exp["candidates"]:
            can = state.candidates[cid]
            m = can["metrics"]
            ev = can["evaluation"]
            if not m or not ev:
                continue  # not measured (cancelled / failed before scoring)
            if m["quality"] < req.min_quality:
                below_quality.append(can["framework_id"])
            data.append(
                CandidateBenchmarkData(
                    candidate_id=can["id"],
                    framework_id=can["framework_id"],
                    is_eligible=bool(ev["eligible"]) and m["quality"] >= req.min_quality,
                    quality_score=m["quality"],
                    speed_score=m["speed"],
                    token_efficiency_score=m["token"],
                    reliability_score=m["reliability"],
                )
            )
        result = ranking_engine.rank_candidates(data, req.weights)
        return {**result, "min_quality": req.min_quality, "below_quality": below_quality}

    # Artifact Export (GP §14.2, ADR-009)
    def _export_files(candidate: dict[str, Any], fmt: str) -> dict[str, str]:
        files = exporter.export_project(
            framework_id=candidate["framework_id"],
            pipeline_code=runner.standalone_source(candidate["framework_id"]),
            project_name=f"arena-export-{candidate['framework_id']}",
        )
        return {name: files[name] for name in EXPORT_FORMATS[fmt]}

    def _build_zip(files: dict[str, str]) -> bytes:
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
            for name in sorted(files):
                info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, files[name])
        return buffer.getvalue()

    @app.post("/v1/candidates/{candidate_id}/exports")
    async def export_candidate(
        candidate_id: str, format: Literal["zip", "docker", "poetry"] = "zip"
    ) -> dict[str, Any]:
        candidate = state.candidate(candidate_id)
        files = _export_files(candidate, format)
        blob = _build_zip(files)
        export_id = generate_id("exp_pkg")
        record = {
            "id": export_id,
            "candidate_id": candidate_id,
            "experiment_id": candidate["experiment_id"],
            "framework_id": candidate["framework_id"],
            "format": format,
            "filename": f"arena-export-{candidate['framework_id']}{'' if format == 'zip' else '-' + format}.zip",
            "files": list(files.keys()),
            "size_bytes": len(blob),
            "sha256": hashlib.sha256(blob).hexdigest(),
            "secrets_found": 0,
            "status": "ready_for_download",
            "created_at": now_iso(),
        }
        state.exports[export_id] = record
        state.save()
        return record

    @app.get("/v1/exports")
    async def list_exports() -> list[dict[str, Any]]:
        return sorted(state.exports.values(), key=lambda e: e["created_at"], reverse=True)

    @app.get("/v1/exports/{export_id}/download")
    async def download_export(export_id: str) -> Response:
        record = state.exports.get(export_id)
        if not record:
            raise ResourceNotFoundError("Export", export_id)
        candidate = state.candidate(record["candidate_id"])
        blob = _build_zip(_export_files(candidate, record["format"]))
        digest = hashlib.sha256(blob).hexdigest()
        if digest != record["sha256"]:
            raise ArenaError(code="EXPORT_INTEGRITY_FAILED", message="Paket özeti kayıtlı SHA-256 ile uyuşmuyor.")
        return Response(
            content=blob,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{record["filename"]}"',
                "X-Content-SHA256": digest,
            },
        )

    return app
