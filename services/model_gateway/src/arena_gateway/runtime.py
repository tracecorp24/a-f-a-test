"""In-process Model Gateway runtime (ADR-0003, ADR-0006).

Workers execute their LLM steps through this gateway. Every physical request is
recorded in the canonical ``UsageLedger`` with the provider-reported token
counts, so token telemetry is always *exact* — it is never estimated from
payload sizes or heuristics.
"""

from __future__ import annotations

import asyncio
import concurrent.futures
import json
import os
import threading
from typing import Any

from arena_gateway.adapters.mock_provider import MockProvider
from arena_gateway.domain.usage_ledger import UsageLedger
from arena_gateway.factory import build_provider

_GATEWAY: ModelGateway | None = None
_GATEWAY_LOCK = threading.Lock()


class ModelGateway:
    """Executes physical LLM requests and owns the canonical usage ledger (ADR-0006)."""

    def __init__(self) -> None:
        self.ledger = UsageLedger()
        provider = build_provider("ARENA_PROVIDER", default_model="mock-agent-model")
        if provider is None:
            # No credential configured: offline MockProvider keeps the benchmark runnable.
            self._provider = MockProvider(model_id=os.environ.get("ARENA_MODEL_ID", "mock-agent-model"))
        else:
            self._provider = provider

    def complete(
        self,
        *,
        run_id: str,
        candidate_id: str,
        phase: str,
        step: str,
        payload: dict[str, Any],
        system: str | None = None,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """Run one physical completion and record its exact usage in the ledger."""
        messages = [
            {"role": "system", "content": system or "You are a precise document analysis agent."},
            {
                "role": "user",
                "content": json.dumps({"step": step, **payload}, ensure_ascii=False, sort_keys=True),
            },
        ]
        response = self._run_provider_call(self._provider.complete(messages, max_tokens=max_tokens))
        record = self.ledger.record_request(
            run_id=run_id,
            phase=phase,
            model=response["model"],
            usage=response["usage"],
        )
        choices = response.get("choices") or []
        content = str(choices[0].get("message", {}).get("content", "")) if choices else ""
        return {
            "request_id": record.request_id,
            "model": record.model,
            "content": content,
            "usage": {
                "prompt_tokens": record.prompt_tokens,
                "completion_tokens": record.completion_tokens,
                "total_tokens": record.total_tokens,
                "reasoning_tokens": record.reasoning_tokens,
                "cached_prompt_tokens": record.cached_prompt_tokens,
                "usage_source": record.usage_source.value,
            },
        }

    def run_usage(self, run_id: str) -> dict[str, Any]:
        """Exact aggregated usage for one worker run, straight from the ledger."""
        return self.ledger.get_run_totals(run_id)

    @staticmethod
    def _run_provider_call(coroutine: Any) -> Any:
        """Await the async provider call from any context, including a running event loop."""
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.run(coroutine)
        with concurrent.futures.ThreadPoolExecutor(max_workers=1, thread_name_prefix="arena-gateway") as pool:
            return pool.submit(asyncio.run, coroutine).result()


def get_gateway() -> ModelGateway:
    """Process-wide gateway instance so every component shares one canonical ledger."""
    global _GATEWAY
    with _GATEWAY_LOCK:
        if _GATEWAY is None:
            _GATEWAY = ModelGateway()
        return _GATEWAY
