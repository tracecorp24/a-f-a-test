"""LangGraph native skeleton pipeline implementation for Doc Review benchmark (GP §2.1)."""

import json
from pathlib import Path
from typing import Any, TypedDict
from arena_contracts import RunSpec
from arena_worker_sdk.protocol import WorkerProtocol


class State(TypedDict):
    documents: list[dict[str, str]]
    conflicts: list[dict[str, Any]]
    final_report: dict[str, Any]


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


def _parse_conflict_list(content: str) -> list[dict[str, Any]]:
    """Best-effort JSON extraction from the model response."""
    text = content.strip()
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


def _identify_conflicts(
    protocol: WorkerProtocol, documents: list[dict[str, str]], agent: str
) -> list[dict[str, Any]]:
    """LLM step: detect factual conflicts between the documents (ADR-0006)."""
    response = protocol.complete(
        "identify_conflicts",
        {"documents": [d["text"] for d in documents]},
        system=_SYSTEM,
        agent=agent,
    )
    return _parse_conflict_list(str(response.get("content", "")))


def run_langgraph_pipeline(spec: RunSpec, protocol: WorkerProtocol) -> dict[str, Any]:
    """Execute native LangGraph state-graph pipeline steps."""
    protocol.emit_event("node.start", {"node": "read_documents"})

    # 1. State initialization (documents come from the benchmark fixture)
    state: State = {"documents": _fixture_documents(spec), "conflicts": [], "final_report": {}}
    protocol.emit_event("node.finish", {"node": "read_documents", "doc_count": len(state["documents"])})

    # 2. Conflict identification node (LLM step through the Model Gateway, ADR-0006)
    protocol.emit_event("node.start", {"node": "identify_conflicts"})
    state["conflicts"] = _identify_conflicts(protocol, state["documents"], agent="identify_conflicts")
    protocol.emit_event("node.finish", {"node": "identify_conflicts", "found": len(state["conflicts"])})

    # 3. Report generation node (LLM step through the Model Gateway, ADR-0006)
    protocol.emit_event("node.start", {"node": "generate_report"})
    review = protocol.complete(
        "generate_report",
        {"documents": [d["text"] for d in state["documents"]], "conflicts": state["conflicts"]},
        agent="generate_report",
    )
    state["final_report"] = {
        "task": "doc-review",
        "conflict_count": len(state["conflicts"]),
        "conflicts": state["conflicts"],
        "review": review["content"],
        "status": "completed",
    }
    protocol.emit_event("node.finish", {"node": "generate_report"})

    return state["final_report"]
