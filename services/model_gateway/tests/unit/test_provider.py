"""Unit tests for LiveProviderAdapter."""

import pytest
from arena_gateway.adapters.litellm_provider import LiveProviderAdapter
from arena_contracts import CapabilityStatus


@pytest.mark.asyncio
async def test_live_provider_probe() -> None:
    adapter = LiveProviderAdapter(model_id="test-model")
    caps = await adapter.probe()
    assert caps["tool_calling"] == CapabilityStatus.VERIFIED
    assert caps["streaming"] == CapabilityStatus.VERIFIED
    assert caps["usage_reporting"] == CapabilityStatus.VERIFIED
