"""LiteLLM and OpenAI-compatible live Provider Adapter (F1.4, F1.5, ADR-003)."""

from datetime import datetime, timezone
import time
from typing import Any, AsyncIterator
import httpx
from arena_contracts import CapabilityStatus, UsageRecord, UsageSource
from arena_gateway.domain.token_counter import count_tokens
from arena_kernel.errors import ArenaError

_PROBE_CAPABILITIES = ("tool_calling", "streaming", "structured_output", "usage_reporting")


class LiveProviderAdapter:
    """Sends physical requests to LLM endpoints without secret leaking or silent fallback."""

    def __init__(
        self,
        base_url: str = "https://api.openai.com/v1",
        api_key: str = "",
        model_id: str = "selected-model",
        timeout_seconds: float = 60.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._api_key = api_key
        self.model_id = model_id
        self.timeout = timeout_seconds

    async def probe(self) -> dict[str, CapabilityStatus]:
        """Probe the provider endpoint honestly (ADR-0005: no unverified claims).

        Reachability is verified with a lightweight ``GET /models`` request; the
        per-feature capabilities stay ``PENDING_PROVIDER_PROBE`` until an actual
        feature is exercised during a run.
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers={"Authorization": f"Bearer {self._api_key}"},
                )
        except httpx.RequestError:
            return {key: CapabilityStatus.PENDING_PROVIDER_PROBE for key in _PROBE_CAPABILITIES}
        if response.status_code != 200:
            return {key: CapabilityStatus.PENDING_PROVIDER_PROBE for key in _PROBE_CAPABILITIES}
        # Endpoint reachable: model listing works, per-feature claims remain unverified
        # until the first real completion exercises them.
        return {key: CapabilityStatus.PENDING_PROVIDER_PROBE for key in _PROBE_CAPABILITIES}

    async def complete(
        self,
        messages: list[dict[str, Any]],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        tools: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """Perform non-streaming completion measuring latency and extracting token usage."""
        start_time = time.monotonic()
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {
            "model": self.model_id,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if tools:
            payload["tools"] = tools

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
            except httpx.RequestError as exc:
                raise ArenaError(
                    code="GATEWAY_PROVIDER_UNREACHABLE",
                    message=f"Failed to communicate with provider: {exc}",
                    retryable=True,
                )

        if response.status_code != 200:
            raise ArenaError(
                code="GATEWAY_PROVIDER_ERROR",
                message=f"Provider returned error status {response.status_code}: {response.text}",
                retryable=response.status_code in (429, 500, 502, 503),
            )

        data = response.json()
        latency_ms = (time.monotonic() - start_time) * 1000

        raw_usage = data.get("usage", {})
        prompt_text = "".join(str(m.get("content", "")) for m in messages)
        completion_text = str(((data.get("choices") or [{}])[0].get("message") or {}).get("content", ""))
        if "prompt_tokens" in raw_usage:
            prompt_tokens = int(raw_usage.get("prompt_tokens", 0))
            completion_tokens = int(raw_usage.get("completion_tokens", 0))
            usage_source = UsageSource.PROVIDER_REPORTED
        else:
            # Provider did not report usage: derive counts with the open-source
            # tiktoken BPE tokenizer instead of reporting zeros.
            prompt_tokens = count_tokens(prompt_text)
            completion_tokens = count_tokens(completion_text)
            usage_source = UsageSource.DERIVED
        total_tokens = prompt_tokens + completion_tokens  # Strict no double count

        usage = UsageRecord(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            usage_source=usage_source,
        )

        return {
            "id": data.get("id", "resp_live"),
            "model": self.model_id,
            "choices": data.get("choices", []),
            "usage": usage,
            "latency_ms": latency_ms,
        }
