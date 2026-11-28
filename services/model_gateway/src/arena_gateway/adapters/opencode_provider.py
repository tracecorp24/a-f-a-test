"""ivmeX/OpenCode server adapter (F1.4 alternative transport).

Routes LLM completions through an OpenCode server using HTTP Basic auth.
Primary path is a temporary OpenCode session whose assistant message carries
the *provider-reported* exact token usage (ADR-0006 gold standard). When that
flow is unavailable, the stateless one-shot generate endpoint
(``POST /api/experimental/generate/text``) is used and token counts are derived
with the open-source tiktoken BPE tokenizer instead of any heuristic.
Useful when the platform credential lives inside the OpenCode server instead of
being exposed to the arena directly (ADR-0003: single provider credential).
"""

from datetime import datetime, timezone
import asyncio
import base64
import json
import time
from typing import Any
import httpx
from arena_contracts import CapabilityStatus, UsageRecord, UsageSource
from arena_gateway.domain.token_counter import count_tokens
from arena_kernel.errors import ArenaError

_PROBE_CAPABILITIES = ("tool_calling", "streaming", "structured_output", "usage_reporting")

# The OpenCode server occasionally reloads its model registry; during that window a
# known-good model ref resolves as 404. Retry the same ref with a short backoff
# before giving up and falling back to the server-default model.
_MODEL_404_RETRY_ATTEMPTS = 2
_MODEL_404_RETRY_BACKOFF_SECONDS = 2.0


class OpenCodeServerAdapter:
    """Sends completions through an OpenCode server (Basic auth)."""

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
            response = await self._session_complete(client, prompt)
            if response is None:
                response = await self._stateless_complete(client, prompt)

        response["latency_ms"] = (time.monotonic() - start_time) * 1000
        return response

    async def _session_complete(self, client: httpx.AsyncClient, prompt: str) -> dict[str, Any] | None:
        """Complete through a temporary session and return provider-reported usage.

        Returns ``None`` when the session flow is unavailable so the caller can fall
        back to the stateless derived-usage path.
        """
        headers = self._auth_header()
        session_id: str | None = None
        try:
            created = await client.post(
                f"{self.base_url}/api/session", headers=headers, json={"title": "arena-usage"}
            )
            if created.status_code != 200:
                return None
            session_id = str(created.json().get("data", {}).get("id") or "")
            if not session_id:
                return None

            prompted = await client.post(
                f"{self.base_url}/api/session/{session_id}/prompt", headers=headers, json={"text": prompt}
            )
            if prompted.status_code != 200:
                return None

            waited = await client.post(
                f"{self.base_url}/api/experimental/session/{session_id}/wait", headers=headers
            )
            if not (200 <= waited.status_code < 300):  # the wait endpoint replies 204 No Content
                return None

            listed = await client.get(f"{self.base_url}/api/session/{session_id}/message", headers=headers)
            if listed.status_code != 200:
                return None
            payload = listed.json()
            items = payload.get("data") if isinstance(payload, dict) else payload
            if not isinstance(items, list):
                return None
            assistants = [m for m in items if isinstance(m, dict) and m.get("type") == "assistant"]
            if not assistants:
                return None
            assistant = assistants[-1]

            tokens = assistant.get("tokens") or {}
            input_tokens = int(tokens.get("input") or 0)
            output_tokens = int(tokens.get("output") or 0)
            reasoning_tokens = int(tokens.get("reasoning") or 0)
            cache = tokens.get("cache") or {}
            cached_tokens = int(cache.get("read") or 0)
            if not input_tokens and not output_tokens:
                return None  # no real usage recorded: treat as unavailable

            content_parts = [
                str(part.get("text", ""))
                for part in assistant.get("content", [])
                if isinstance(part, dict) and part.get("type") == "text"
            ]
            model_ref = assistant.get("model") or {}
            model_label = f"{model_ref.get('providerID', '')}/{model_ref.get('id', '')}".strip("/") or "server-default"
            cost_value = assistant.get("cost")
            return {
                "id": str(assistant.get("id", "")),
                "model": model_label,
                "choices": [{"message": {"content": "".join(content_parts)}}],
                "usage": UsageRecord(
                    prompt_tokens=input_tokens,
                    completion_tokens=output_tokens,
                    total_tokens=input_tokens + output_tokens,
                    reasoning_tokens=reasoning_tokens,
                    cached_prompt_tokens=cached_tokens,
                    usage_source=UsageSource.PROVIDER_REPORTED,
                    cost=float(cost_value) if isinstance(cost_value, (int, float)) else None,
                ),
            }
        except (httpx.RequestError, ValueError, KeyError, TypeError):
            return None
        finally:
            if session_id:
                try:  # best-effort cleanup of the temporary session
                    await client.delete(f"{self.base_url}/api/session/{session_id}", headers=headers)
                except httpx.RequestError:
                    pass

    async def _stateless_complete(self, client: httpx.AsyncClient, prompt: str) -> dict[str, Any]:
        """One-shot stateless generation with BPE-derived token counts (fallback path)."""
        body: dict[str, Any] = {"prompt": prompt}
        if self.model_id and self.provider_id:
            body["model"] = {"id": self.model_id, "providerID": self.provider_id}
        used_server_default = False
        try:
            response = await client.post(
                f"{self.base_url}/api/experimental/generate/text",
                headers={**self._auth_header(), "Content-Type": "application/json"},
                json=body,
            )
        except httpx.RequestError as exc:
            raise ArenaError(
                code="GATEWAY_PROVIDER_UNREACHABLE",
                message=f"Failed to communicate with OpenCode server: {exc}",
                retryable=True,
            )
        if response.status_code == 404 and body.get("model") is not None:
            # First retry the exact same model ref: a 404 right after a server
            # restart is usually the registry reload, not a real miss.
            resolved = False
            for attempt in range(_MODEL_404_RETRY_ATTEMPTS):
                await asyncio.sleep(_MODEL_404_RETRY_BACKOFF_SECONDS * (attempt + 1))
                try:
                    response = await client.post(
                        f"{self.base_url}/api/experimental/generate/text",
                        headers={**self._auth_header(), "Content-Type": "application/json"},
                        json=body,
                    )
                except httpx.RequestError as exc:
                    raise ArenaError(
                        code="GATEWAY_PROVIDER_UNREACHABLE",
                        message=f"Failed to communicate with OpenCode server: {exc}",
                        retryable=True,
                    )
                if response.status_code != 404:
                    resolved = True
                    break
            if not resolved:
                # The server could not resolve the requested model ref: fall back to the
                # server's base-configuration default model (stateless generate endpoint).
                used_server_default = True
                try:
                    response = await client.post(
                        f"{self.base_url}/api/experimental/generate/text",
                        headers={**self._auth_header(), "Content-Type": "application/json"},
                        json={"prompt": prompt},
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

        # The stateless endpoint does not report provider usage: derive exact token
        # counts with the open-source tiktoken BPE tokenizer (o200k_base), heuristic
        # fallback when the tokenizer is unavailable.
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
            "model": "server-default" if used_server_default else self.model_id,
            "choices": [{"message": {"content": content}}],
            "usage": usage,
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
