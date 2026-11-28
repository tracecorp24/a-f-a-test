"""ivmeX/OpenCode server adapter (F1.4 alternative transport).

Routes LLM completions through an OpenCode server's one-shot text generation
endpoint (``POST /api/experimental/generate/text``) using HTTP Basic auth.
Useful when the platform credential lives inside the OpenCode server instead of
being exposed to the arena directly (ADR-0003: single provider credential).
"""

from datetime import datetime, timezone
import base64
import json
import time
from typing import Any
import httpx
from arena_contracts import CapabilityStatus, UsageRecord, UsageSource
from arena_gateway.domain.token_counter import count_tokens
from arena_kernel.errors import ArenaError

_PROBE_CAPABILITIES = ("tool_calling", "streaming", "structured_output", "usage_reporting")


class OpenCodeServerAdapter:
    """Sends completions through an OpenCode server (Basic auth, one-shot generate)."""

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:4096",
        username: str = "opencode",
        password: str = "",
        model_id: str = "genel",
        provider_id: str = "genel",
        timeout_seconds: float = 180.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._username = username
        self._password = password
        self.model_id = model_id
        self.provider_id = provider_id
        self.timeout = timeout_seconds

    def _auth_header(self) -> dict[str, str]:
        raw = f"{self._username}:{self._password}".encode()
        return {"Authorization": "Basic " + base64.b64encode(raw).decode()}

    async def probe(self) -> dict[str, CapabilityStatus]:
        """Probe the OpenCode server: reachable + model list serves as the health check."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/api/model", headers=self._auth_header())
        except httpx.RequestError:
            return {key: CapabilityStatus.FAILED for key in _PROBE_CAPABILITIES}
        if response.status_code != 200:
            return {key: CapabilityStatus.FAILED for key in _PROBE_CAPABILITIES}
        return {key: CapabilityStatus.PENDING_PROVIDER_PROBE for key in _PROBE_CAPABILITIES}

    async def complete(
        self,
        messages: list[dict[str, Any]],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        tools: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """Perform a one-shot completion. ``temperature``/``max_tokens``/``tools`` are
        accepted for interface parity but are not forwarded (server-side defaults apply)."""
        start_time = time.monotonic()
        prompt = self._render_prompt(messages)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/experimental/generate/text",
                    headers={**self._auth_header(), "Content-Type": "application/json"},
                    json={"prompt": prompt, "model": {"id": self.model_id, "providerID": self.provider_id}},
                )
            except httpx.RequestError as exc:
                raise ArenaError(
                    code="GATEWAY_PROVIDER_UNREACHABLE",
                    message=f"Failed to communicate with OpenCode server: {exc}",
                    retryable=True,
                )

        if response.status_code != 200:
            raise ArenaError(
                code="GATEWAY_PROVIDER_ERROR",
                message=f"OpenCode server returned status {response.status_code}: {response.text}",
                retryable=response.status_code in (429, 500, 502, 503),
            )

        try:
            data = response.json()
            content = str(data["data"]["text"])
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise ArenaError(
                code="GATEWAY_PROVIDER_ERROR",
                message=f"OpenCode server returned an unexpected payload: {exc}",
                retryable=False,
            )

        latency_ms = (time.monotonic() - start_time) * 1000
        # OpenCode does not report provider usage: derive exact token counts with
        # the open-source tiktoken BPE tokenizer (o200k_base), heuristic fallback.
        prompt_tokens = count_tokens(prompt)
        completion_tokens = count_tokens(content)
        usage = UsageRecord(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            usage_source=UsageSource.DERIVED,
        )

        return {
            "id": f"opencode-{datetime.now(timezone.utc).timestamp():.0f}",
            "model": self.model_id,
            "choices": [{"message": {"content": content}}],
            "usage": usage,
            "latency_ms": latency_ms,
        }

    @staticmethod
    def _render_prompt(messages: list[dict[str, Any]]) -> str:
        """Flatten an OpenAI-style message list into a single prompt string."""
        parts: list[str] = []
        for message in messages:
            role = str(message.get("role", "user"))
            content = message.get("content", "")
            if isinstance(content, list):  # tolerate multimodal content arrays
                content = " ".join(str(part) for part in content)
            if role == "system":
                parts.append(f"Instructions:\n{content}")
            else:
                parts.append(str(content))
        return "\n\n".join(parts)
