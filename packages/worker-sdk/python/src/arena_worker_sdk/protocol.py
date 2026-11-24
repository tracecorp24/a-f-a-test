"""Worker SDK runtime protocol: stdio JSONL communication (F2.1, ADR-004, ADR-011)."""

from datetime import datetime, timezone
import json
import sys
from typing import Any
from arena_contracts import ArenaEvent, RunSpec
from arena_kernel.hashing import canonical_json_bytes
from arena_kernel.ids import generate_id


class WorkerProtocol:
    """Manages stdin/stdout transport between control plane and container worker."""

    def __init__(self, run_spec: RunSpec) -> None:
        self.spec = run_spec
        self._seq = 0
        self._is_cancelled = False

    @classmethod
    def from_stdin(cls) -> "WorkerProtocol":
        """Read serialized RunSpec from standard input."""
        line = sys.stdin.readline().strip()
        data = json.loads(line)
        spec = RunSpec(**data)
        return cls(spec)

    def cancel(self) -> None:
        """Mark worker cooperative cancellation flag."""
        self._is_cancelled = True

    @property
    def is_cancelled(self) -> bool:
        return self._is_cancelled

    def emit_event(self, event_type: str, payload: dict[str, Any]) -> ArenaEvent:
        """Emit structured ArenaEvent to standard output as a JSONL line."""
        self._seq += 1
        event = ArenaEvent(
            event_id=generate_id("evt"),
            run_id=self.spec.run_id,
            candidate_id=self.spec.candidate_id,
            experiment_id=self.spec.experiment_id,
            phase="benchmark",
            seq=self._seq,
            timestamp=datetime.now(timezone.utc),
            type=event_type,
            payload=payload,
        )
        line = event.model_dump_json()
        sys.stdout.write(line + "\n")
        sys.stdout.flush()
        return event
