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

    def complete(
        self,
        step: str,
        payload: dict[str, Any],
        *,
        agent: str | None = None,
        system: str | None = None,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """Execute one LLM step through the Model Gateway (ADR-0006).

        The gateway records every physical request in the canonical usage ledger
        with provider-reported token counts, and a ``model.completion`` event
        carrying that exact usage is emitted on the event stream.
        """
        from arena_gateway.runtime import get_gateway  # soft dependency: provided by the platform

        response = get_gateway().complete(
            run_id=self.spec.run_id,
            candidate_id=self.spec.candidate_id,
            phase="benchmark",
            step=step,
            payload=payload,
            system=system,
            max_tokens=max_tokens,
        )
        usage = response["usage"]
        event_payload: dict[str, Any] = {
            "step": step,
            "model": response["model"],
            "request_id": response["request_id"],
            "prompt_tokens": usage["prompt_tokens"],
            "completion_tokens": usage["completion_tokens"],
            "total_tokens": usage["total_tokens"],
            "usage_source": usage["usage_source"],
        }
        if agent is not None:
            event_payload["agent"] = agent
        self.emit_event("model.completion", event_payload)
        return response
