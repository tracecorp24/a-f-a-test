"""CrewAI native skeleton pipeline (GP §2.5)."""

from typing import Any
from arena_contracts import RunSpec
from arena_worker_sdk.protocol import WorkerProtocol


def run_crewai_pipeline(spec: RunSpec, protocol: WorkerProtocol) -> dict[str, Any]:
    """Execute native CrewAI crew with roles, tasks, and flow."""
    protocol.emit_event("crew.kickoff", {"crew": "DocumentAuditCrew"})

    # Task 1: Research and document gathering
    protocol.emit_event("task.start", {"agent": "DocumentAuditor", "task": "ExtractClaims"})
    claims = [
        {"claim": "Delivery on 15 Jan", "doc": "1"},
        {"claim": "Delivery on 28 Feb", "doc": "2"},
    ]
    protocol.emit_event("task.finish", {"agent": "DocumentAuditor", "task": "ExtractClaims"})

    # Task 2: Conflict Reporting
    protocol.emit_event("task.start", {"agent": "LeadReviewer", "task": "CompileDisputeReport"})
    report = {
        "framework": "crewai",
        "crew_tasks_completed": 2,
        "claims_analyzed": len(claims),
        "contradictions_found": 1,
        "status": "completed",
    }
    protocol.emit_event("task.finish", {"agent": "LeadReviewer", "task": "CompileDisputeReport"})
    protocol.emit_event("crew.finish", {"crew": "DocumentAuditCrew", "status": "success"})
    return report
