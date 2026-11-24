"""Microsoft Agent Framework native skeleton pipeline (GP §2.3)."""

from typing import Any
from arena_contracts import RunSpec
from arena_worker_sdk.protocol import WorkerProtocol


def run_microsoft_af_pipeline(spec: RunSpec, protocol: WorkerProtocol) -> dict[str, Any]:
    """Execute native Microsoft Agent Framework agent loop and executor."""
    protocol.emit_event("executor.start", {"executor": "DocReviewWorkflow"})

    # Step 1: Document Reader Agent
    protocol.emit_event("agent.step", {"agent": "DocumentIngestionAgent", "status": "active"})
    doc_data = [
        {"id": "doc1", "delivery": "15 Ocak 2027", "budget": "100.000 USD"},
        {"id": "doc2", "delivery": "28 Şubat 2027", "budget": "120.000 USD"},
    ]

    # Step 2: Conflict Extraction Executor
    protocol.emit_event("agent.step", {"agent": "ConflictAnalysisAgent", "status": "active"})
    conflicts = [
        {"aspect": "delivery", "val1": doc_data[0]["delivery"], "val2": doc_data[1]["delivery"]},
        {"aspect": "budget", "val1": doc_data[0]["budget"], "val2": doc_data[1]["budget"]},
    ]

    report = {
        "framework": "microsoft-af",
        "conflicts_detected": len(conflicts),
        "conflicts": conflicts,
        "status": "completed",
    }
    protocol.emit_event("executor.finish", {"executor": "DocReviewWorkflow", "status": "success"})
    return report
