"""Unit tests for LiveProviderAdapter."""

import pytest
from arena_gateway.adapters.litellm_provider import LiveProviderAdapter
from arena_contracts import CapabilityStatus


@pytest.mark.asyncio
async def test_live_provider_probe_unreachable(monkeypatch: pytest.MonkeyPatch) -> None:
    """Probe against an unreachable provider reports pending, never fake-verified."""
    adapter = LiveProviderAdapter(base_url="http://127.0.0.1:9/v1", model_id="test-model")
    caps = await adapter.probe()
    assert all(status == CapabilityStatus.PENDING_PROVIDER_PROBE for status in caps.values())


@pytest.mark.asyncio
async def test_live_provider_probe_reports_all_capabilities() -> None:
    """Probe always returns a status for every known capability."""
    adapter = LiveProviderAdapter(base_url="http://127.0.0.1:9/v1", model_id="test-model")
    caps = await adapter.probe()
    assert set(caps) == {"tool_calling", "streaming", "structured_output", "usage_reporting"}
