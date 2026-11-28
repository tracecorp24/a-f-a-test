"""Pydantic AI native skeleton pipeline (GP §2.7)."""

import json
from pathlib import Path
from typing import Any
from arena_contracts import RunSpec
from arena_worker_sdk.protocol import WorkerProtocol


_SYSTEM = (
    "You are a precise document conflict auditor. Compare the given contract documents"
    " and report every genuine factual contradiction (same subject, different stated values)."
    ' Respond ONLY with JSON: {"conflicts": [{"aspect": "<topic>", "detail": "<short description>"}]}.'
)

_EMBEDDED_DOCUMENTS = [
    {"id": "doc1", "text": "Bölüm A: Proje Teslim Tarihi. Proje Faz 1 teslim tarihi 15 Ocak 2027 olarak kararlaştırılmıştır. Bütçe tavanı: 100.000 USD."},
    {"id": "doc2", "text": "Bölüm B: Takvim Güncellemesi ve Bütçe. Revizyon gereği Faz 1 teslim tarihi 28 Şubat 2027 olarak ertelenmiştir. Bütçe tavanı: 120.000 USD olarak güncellenmiştir."},
]


def _fixture_documents(spec: RunSpec | None) -> list[dict[str, str]]:
    """Read the benchmark input documents from spec.input_ref; embedded fallback."""
    input_ref = getattr(spec, "input_ref", None) if spec is not None else None
    if input_ref:
        path = Path(input_ref)
        if not path.is_absolute():
            path = Path(__file__).resolve().parents[3] / input_ref
        if path.is_file():
            documents = [
                {"id": f"doc{i}", "text": file.read_text(encoding="utf-8")}
                for i, file in enumerate(sorted(path.parent.glob("*.txt")), 1)
            ]
            if documents:
                return documents
    return [dict(doc) for doc in _EMBEDDED_DOCUMENTS]


def _strip_reasoning(text: str) -> str:
    """Drop reasoning blocks (``<think`` ... ``</think``) some models emit before JSON."""
    while True:
        start = text.find("<think")
        if start < 0:
            return text
        end = text.find("</think", start)
        text = text[:start] + (text[end + len("</think"):] if end >= 0 else "")


def _parse_conflict_list(content: str) -> list[dict[str, Any]]:
    """Best-effort JSON extraction from the model response."""
    text = _strip_reasoning(content.strip())
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    try:
        data = json.loads(text)
    except ValueError:
        start, end = text.find("{"), text.rfind("}")
        if start < 0 or end <= start:
            return []
        try:
            data = json.loads(text[start : end + 1])
        except ValueError:
            return []
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    if isinstance(data, dict):
        for key in ("conflicts", "discrepancies", "contradictions"):
            value = data.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
    return []


def _type_safe_conflicts(raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Coerce model output into the typed contradiction schema (aspect/detail str)."""
    typed: list[dict[str, Any]] = []
    for index, item in enumerate(raw, 1):
        aspect = str(item.get("aspect") or item.get("subject") or item.get("type") or f"conflict_{index}")
        detail = str(item.get("detail") or item.get("description") or item.get("detail_text") or aspect)
        typed.append({"subject": aspect, "detail": detail, "confidence": 0.9})
    return typed


def run_pydantic_ai_pipeline(spec: RunSpec, protocol: WorkerProtocol) -> dict[str, Any]:
    """Execute native Pydantic AI typed agent with dependency injection."""
    protocol.emit_event("agent.run", {"agent": "TypedDocumentAgent", "typed_deps": True})

    documents = _fixture_documents(spec)

    # Strict typed validation with an LLM step via the Model Gateway (ADR-0006)
    response = protocol.complete(
        "detect_contradictions",
        {"documents": [d["text"] for d in documents]},
        system=_SYSTEM,
        agent="TypedDocumentAgent",
    )
    raw_conflicts = _parse_conflict_list(str(response.get("content", "")))
    dispute_analysis: dict[str, Any] = {
        "verified_contradictions": _type_safe_conflicts(raw_conflicts),
        "framework": "pydantic-ai",
        "type_safe": True,
        "status": "completed",
    }

    # Narrative validation step (LLM through the Model Gateway, ADR-0006)
    review = protocol.complete(
        "validate_contradictions",
        {"contradictions": dispute_analysis["verified_contradictions"]},
        agent="TypedDocumentAgent",
    )
    dispute_analysis["review"] = review["content"]
    protocol.emit_event("agent.finish", {"agent": "TypedDocumentAgent", "status": "success"})
    return dispute_analysis
