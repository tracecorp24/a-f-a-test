"""Unit tests for the OpenCode server adapter's usage-reporting flow.

Contract (ADR-0006): the adapter first tries a temporary session whose assistant
message carries the provider-reported exact token usage. When the session flow is
unavailable it uses the stateless one-shot generate endpoint; a model ref that the
server cannot resolve (404) falls back to the server-default model.
"""

import asyncio
import json
from typing import Any

import httpx
import pytest

from arena_gateway.adapters.opencode_provider import OpenCodeServerAdapter


def _patch_client(monkeypatch: pytest.MonkeyPatch, handler: Any) -> None:
    """Route every adapter request through an in-memory httpx.MockTransport."""
    real_client = httpx.AsyncClient

    def factory(*args: Any, **kwargs: Any) -> httpx.AsyncClient:
        kwargs.pop("transport", None)
        return real_client(transport=httpx.MockTransport(handler), *args, **kwargs)

    monkeypatch.setattr(httpx, "AsyncClient", factory)


def _adapter() -> OpenCodeServerAdapter:
    return OpenCodeServerAdapter(
        base_url="http://opencode.test",
        username="opencode",
        password="secret",
        model_id="genel",
        provider_id="genel",
    )


@pytest.mark.asyncio
async def test_complete_reports_provider_usage_via_session(monkeypatch: pytest.MonkeyPatch) -> None:
    """The session path yields exact provider-reported usage and cleans the session up."""
    deleted: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path == "/api/session" and request.method == "POST":
            return httpx.Response(200, json={"data": {"id": "ses_test"}})
        if path == "/api/session/ses_test/prompt":
            return httpx.Response(200, json={"data": {"id": "msg_user"}})
        if path == "/api/experimental/session/ses_test/wait":
            return httpx.Response(204)
        if path == "/api/session/ses_test/message":
            return httpx.Response(200, json={"data": [
                {"type": "user", "content": []},
                {
                    "type": "assistant",
                    "id": "msg_asst",
                    "model": {"id": "genel", "providerID": "genel"},
                    "cost": 0.0123,
                    "tokens": {"input": 1842, "output": 56, "reasoning": 38, "cache": {"read": 9216, "write": 0}},
                    "content": [{"type": "reasoning", "text": "think"}, {"type": "text", "text": "ok"}],
                },
            ]})
        if path == "/api/session/ses_test" and request.method == "DELETE":
            deleted.append(path)
            return httpx.Response(204)
        return httpx.Response(500, text=f"unexpected {request.method} {path}")

    _patch_client(monkeypatch, handler)

    result = await _adapter().complete([{"role": "user", "content": "hi"}])

    usage = result["usage"]
    assert str(usage.usage_source) == "provider_reported"  # exact, not derived
    assert usage.prompt_tokens == 1842
    assert usage.completion_tokens == 56
    assert usage.total_tokens == 1898  # input + output, never double-counted
    assert usage.reasoning_tokens == 38
    assert usage.cached_prompt_tokens == 9216
    assert usage.cost == 0.0123
    assert result["model"] == "genel/genel"
    assert result["choices"][0]["message"]["content"] == "ok"
    assert deleted == ["/api/session/ses_test"]  # temporary session cleaned up


@pytest.mark.asyncio
async def test_complete_falls_back_to_stateless_and_server_default_on_404(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Without a working session flow the stateless endpoint answers; an unresolved
    model ref (persistent 404) falls back to the server-default model."""
    calls: list[dict[str, Any] | None] = []

    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path == "/api/session":
            return httpx.Response(500, text="session unavailable")  # session flow down
        body: dict[str, Any] = json.loads(request.content) if request.content else {}
        calls.append(body.get("model"))
        if path == "/api/experimental/generate/text" and body.get("model") is not None:
            return httpx.Response(404, json={"_tag": "ModelNotFoundError"})
        return httpx.Response(200, json={"data": {"text": "fallback-ok"}})

    _patch_client(monkeypatch, handler)

    result = await _adapter().complete([{"role": "user", "content": "hi"}])

    assert result["model"] == "server-default"
    assert result["choices"][0]["message"]["content"] == "fallback-ok"
    assert str(result["usage"].usage_source) == "derived"  # no provider usage available
    # 1 attempt with the requested model ref, then 1 server-default call
    assert calls.count(None) == 1
    assert len(calls) == 2


@pytest.mark.asyncio
async def test_session_cleanup_failure_does_not_break_completion(monkeypatch: pytest.MonkeyPatch) -> None:
    """A failing session DELETE must not fail or degrade the completion result."""

    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path == "/api/session" and request.method == "POST":
            return httpx.Response(200, json={"data": {"id": "ses_stuck"}})
        if path == "/api/session/ses_stuck/prompt":
            return httpx.Response(200, json={"data": {"id": "msg_user"}})
        if path == "/api/experimental/session/ses_stuck/wait":
            return httpx.Response(204)
        if path == "/api/session/ses_stuck/message":
            return httpx.Response(200, json={"data": [{
                "type": "assistant",
                "id": "msg_asst",
                "model": {"id": "genel", "providerID": "genel"},
                "tokens": {"input": 10, "output": 5, "reasoning": 0, "cache": {"read": 0, "write": 0}},
                "content": [{"type": "text", "text": "fine"}],
            }]})
        if path == "/api/session/ses_stuck" and request.method == "DELETE":
            raise httpx.ConnectError("cleanup connection reset")
        return httpx.Response(500, text=f"unexpected {request.method} {path}")

    _patch_client(monkeypatch, handler)

    result = await _adapter().complete([{"role": "user", "content": "hi"}])

    assert result["choices"][0]["message"]["content"] == "fine"
    assert str(result["usage"].usage_source) == "provider_reported"
