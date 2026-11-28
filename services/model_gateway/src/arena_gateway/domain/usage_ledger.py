"""Usage Ledger for recording canonical physical model requests (F1.9, AC12, ADR-006)."""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from arena_contracts import UsageRecord, UsageSource
from arena_kernel.ids import generate_id


@dataclass
class PhysicalRequestRecord:
    request_id: str
    run_id: str
    phase: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    reasoning_tokens: int | None
    cached_prompt_tokens: int | None
    usage_source: UsageSource
    cost: float | None
    timestamp: datetime


class UsageLedger:
    """Canonical usage ledger recording immutable physical LLM requests."""

    def __init__(self) -> None:
        self._records: list[PhysicalRequestRecord] = []

    def record_request(
        self,
        run_id: str,
        phase: str,
        model: str,
        usage: UsageRecord,
    ) -> PhysicalRequestRecord:
        """Record physical request ensuring cached and reasoning tokens are not double-counted."""
        # Total is strictly prompt + completion tokens
        calculated_total = usage.prompt_tokens + usage.completion_tokens

        record = PhysicalRequestRecord(
            request_id=generate_id("req"),
            run_id=run_id,
            phase=phase,
            model=model,
            prompt_tokens=usage.prompt_tokens,
            completion_tokens=usage.completion_tokens,
            total_tokens=calculated_total,
            reasoning_tokens=usage.reasoning_tokens,
            cached_prompt_tokens=usage.cached_prompt_tokens,
            usage_source=usage.usage_source,
            cost=usage.cost,
            timestamp=datetime.now(timezone.utc),
        )
        self._records.append(record)
        return record

    def get_run_totals(self, run_id: str) -> dict[str, Any]:
        """Aggregate total tokens for a specific run without double counting."""
        run_records = [r for r in self._records if r.run_id == run_id]
        total_prompt = sum(r.prompt_tokens for r in run_records)
        total_completion = sum(r.completion_tokens for r in run_records)
        total_tokens = sum(r.total_tokens for r in run_records)
        total_reasoning = sum(r.reasoning_tokens or 0 for r in run_records)
        total_cached = sum(r.cached_prompt_tokens or 0 for r in run_records)
        sources = {r.usage_source for r in run_records}
        if not sources:
            usage_source = UsageSource.UNKNOWN.value
        elif len(sources) == 1:
            usage_source = sources.pop().value
        else:
            usage_source = "mixed"

        return {
            "requests_count": len(run_records),
            "prompt_tokens": total_prompt,
            "completion_tokens": total_completion,
            "total_tokens": total_tokens,
            "reasoning_tokens": total_reasoning,
            "cached_prompt_tokens": total_cached,
            "usage_source": usage_source,
        }
