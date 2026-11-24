"""Contract tests: validate JSON schemas against example payloads."""

import json
from pathlib import Path
import pytest
from arena_contracts import (
    CriterionPolicy,
    CriterionResult,
    CriterionStatus,
    ErrorBody,
    FrameworkManifest,
    RunSpec,
    TaskSpec,
    ToolContract,
    UsageRecord,
    UsageSource,
)


def test_error_body_contract() -> None:
    error = ErrorBody(
        code="RESOURCE_NOT_FOUND",
        message="Experiment exp_01JDX not found",
        correlation_id="req_01JDX123",
        retryable=False,
    )
    assert error.code == "RESOURCE_NOT_FOUND"


def test_task_spec_contract() -> None:
    spec = TaskSpec(
        schema_version=1,
        project_id="doc-review",
        revision=1,
        input_mode="natural_language",
        task={
            "objective": "Dokümanları analiz et, çelişkileri bul ve kanıtlı rapor üret.",
            "language": "tr",
            "required_steps": ["read_documents", "identify_conflicts", "cite_evidence"],
            "free_design": ["agent_count", "topology", "prompt_strategy", "memory_strategy"],
        },
        model={
            "connection_ref": "user-model-01",
            "model_id": "selected-model",
            "temperature": 0.2,
            "max_output_tokens": 4096,
            "fallback": "disabled",
        },
        frameworks=["langgraph", "google-adk"],
        inputs={
            "dataset_ref": "datasets/docs-v1",
            "tools_allowlist": ["read_document", "find_evidence"],
            "internet": False,
        },
        criteria=[
            {
                "id": "valid_schema",
                "policy": "required",
                "evaluator": "json_schema",
                "threshold": 1.0,
            },
            {
                "id": "conflict_f1",
                "policy": "required",
                "evaluator": "labeled_f1",
                "threshold": 0.90,
            },
        ],
    )
    assert spec.schema_version == 1
    assert spec.project_id == "doc-review"
    assert len(spec.frameworks) == 2


def test_criterion_result_contract() -> None:
    res = CriterionResult(
        criterion_id="conflict_f1",
        policy=CriterionPolicy.REQUIRED,
        value=0.92,
        threshold=0.90,
        status=CriterionStatus.PASSED,
        evaluator="labeled_f1",
        sample_count=50,
        confidence=UsageSource.MEASURED,
    )
    assert res.status == CriterionStatus.PASSED
    assert res.value == 0.92


def test_tool_contract() -> None:
    tool = ToolContract(
        name="read_document",
        version="1",
        description="Read an approved document by ID",
        input_schema={"type": "object", "properties": {"document_id": {"type": "string"}}, "required": ["document_id"]},
        permission="dataset_read",
        deterministic=True,
        timeout_ms=5000,
    )
    assert tool.name == "read_document"
    assert tool.timeout_ms == 5000
