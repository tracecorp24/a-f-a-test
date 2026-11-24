"""Data contracts and models for Agentic Arena."""

from datetime import datetime
from enum import StrEnum
from typing import Any, Mapping
from pydantic import BaseModel, ConfigDict, Field


class UsageSource(StrEnum):
    MEASURED = "measured"
    PROVIDER_REPORTED = "provider_reported"
    DERIVED = "derived"
    ESTIMATED = "estimated"
    UNSUPPORTED = "unsupported"
    UNKNOWN = "unknown"


class CriterionPolicy(StrEnum):
    REQUIRED = "required"
    PREFERRED = "preferred"
    FREE = "free"
    NOT_APPLICABLE = "not_applicable"


class CriterionStatus(StrEnum):
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"
    UNRESOLVED = "unresolved"
    UNKNOWN = "unknown"


class CapabilityStatus(StrEnum):
    VERIFIED = "verified"
    PENDING_PROVIDER_PROBE = "pending_provider_probe"
    UNSUPPORTED = "unsupported"
    UNKNOWN = "unknown"


class RuntimeStatus(StrEnum):
    NOT_INSTALLED = "not_installed"
    PULLING = "pulling"
    READY_COLD = "ready_cold"
    READY_WARM = "ready_warm"
    BUSY = "busy"
    DEGRADED = "degraded"
    UPDATE_AVAILABLE = "update_available"
    BLOCKED = "blocked"


class ErrorBody(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    code: str
    message: str
    correlation_id: str
    retryable: bool = False
    details: Any = None


class UsageRecord(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    prompt_tokens: int = Field(ge=0)
    completion_tokens: int = Field(ge=0)
    total_tokens: int = Field(ge=0)
    usage_source: UsageSource
    reasoning_tokens: int | None = Field(default=None, ge=0)
    cached_prompt_tokens: int | None = Field(default=None, ge=0)
    cost: float | None = Field(default=None, ge=0.0)
    currency: str = "USD"


class ToolContract(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    name: str
    version: str
    description: str
    input_schema: dict[str, Any]
    permission: str
    timeout_ms: int = Field(gt=0)
    output_schema_ref: str | None = None
    deterministic: bool = True


class CriterionResult(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    criterion_id: str
    policy: CriterionPolicy
    status: CriterionStatus
    evaluator: str
    sample_count: int = Field(ge=0)
    confidence: UsageSource = UsageSource.MEASURED
    value: float | bool | str | None = None
    threshold: float | bool | str | None = None
    evidence_refs: list[str] = Field(default_factory=list)


class ArenaEvent(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    event_id: str
    experiment_id: str
    phase: str
    seq: int = Field(ge=0)
    timestamp: datetime
    type: str
    payload: dict[str, Any]
    run_id: str | None = None
    candidate_id: str | None = None


class RunSpec(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    run_id: str
    candidate_id: str
    experiment_id: str
    input_ref: str
    repetition: int = Field(ge=1)
    gateway_base_url: str
    tool_broker_url: str
    max_tokens: int = Field(ge=1)
    max_calls: int = Field(ge=1)
    watchdog_seconds: int = Field(ge=1)
    seed: int | None = None
    order_index: int = 0
    allowed_tools: list[str] = Field(default_factory=list)


class FrameworkManifest(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str
    upstream: str
    runtime: str
    package: str
    release_version: str
    worker_protocol: int = 1
    capabilities: Mapping[str, CapabilityStatus]
    status: RuntimeStatus
    image_digest: str | None = None
    lockfile_sha256: str | None = None
    docs_revision: str | None = None
    security: dict[str, Any] | None = None


class TaskSpec(BaseModel):
    model_config = ConfigDict(frozen=True, extra="allow")

    schema_version: int = 1
    project_id: str
    revision: int = Field(ge=1)
    input_mode: str
    task: dict[str, Any]
    model: dict[str, Any]
    frameworks: list[str]
    inputs: dict[str, Any]
    criteria: list[dict[str, Any]]
    comparison_mode: str = "native"
    experiment: dict[str, Any] = Field(default_factory=dict)
    ranking: dict[str, Any] = Field(default_factory=dict)
