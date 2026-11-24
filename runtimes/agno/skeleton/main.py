"""Agno native skeleton pipeline (GP §2.6)."""

from typing import Any
from arena_contracts import RunSpec
from arena_worker_sdk.protocol import WorkerProtocol


def run_agno_pipeline(spec: RunSpec, protocol: WorkerProtocol) -> dict[str, Any]:
    """Execute native Agno Agent Team and Workflow."""
    protocol.emit_event("team.run", {"team": "DocAnalysisTeam"})

    protocol.emit_event("agent.step", {"agent": "IngestionAgent", "step": "load"})
    protocol.emit_event("agent.step", {"agent": "ReconciliationAgent", "step": "compare"})

    output = {
        "framework": "agno",
        "paradigm": "Agent / Team / Workflow",
        "conflicts": [{"item": "deadline", "conflict": True}],
        "status": "completed",
    }
    protocol.emit_event("team.finish", {"team": "DocAnalysisTeam", "output": "ok"})
    return output
