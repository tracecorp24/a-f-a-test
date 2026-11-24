"""LangGraph native skeleton pipeline implementation for Doc Review benchmark (GP §2.1)."""

import json
from typing import Any, TypedDict
from arena_contracts import RunSpec
from arena_worker_sdk.protocol import WorkerProtocol


class State(TypedDict):
    documents: list[dict[str, str]]
    conflicts: list[dict[str, Any]]
    final_report: dict[str, Any]


def run_langgraph_pipeline(spec: RunSpec, protocol: WorkerProtocol) -> dict[str, Any]:
    """Execute native LangGraph state-graph pipeline steps."""
    protocol.emit_event("node.start", {"node": "read_documents"})

    # 1. State initialization
    state: State = {
        "documents": [
            {"id": "doc1", "text": "Teslim 15 Ocak 2027. Bütçe 100.000 USD."},
            {"id": "doc2", "text": "Teslim 28 Şubat 2027. Bütçe 120.000 USD."},
        ],
        "conflicts": [],
        "final_report": {},
    }
    protocol.emit_event("node.finish", {"node": "read_documents", "doc_count": 2})

    # 2. Conflict identification node
    protocol.emit_event("node.start", {"node": "identify_conflicts"})
    state["conflicts"] = [
        {"aspect": "delivery_date", "doc1": "15 Ocak 2027", "doc2": "28 Şubat 2027"},
        {"aspect": "budget", "doc1": "100.000 USD", "doc2": "120.000 USD"},
    ]
    protocol.emit_event("node.finish", {"node": "identify_conflicts", "found": 2})

    # 3. Report generation node
    protocol.emit_event("node.start", {"node": "generate_report"})
    state["final_report"] = {
        "task": "doc-review",
        "conflict_count": len(state["conflicts"]),
        "conflicts": state["conflicts"],
        "status": "completed",
    }
    protocol.emit_event("node.finish", {"node": "generate_report"})

    return state["final_report"]
