"""Unit tests for Model Gateway, Secret Store, Policy Engine, and Usage Ledger."""

import pytest
from arena_contracts import UsageRecord, UsageSource
from arena_gateway.adapters.mock_provider import MockProvider
from arena_gateway.domain.budget import TokenBudgetManager
from arena_gateway.domain.policy import PolicyEngine
from arena_gateway.domain.secret_store import SecretStore
from arena_gateway.domain.usage_ledger import UsageLedger
from arena_gateway.runtime import ModelGateway
from arena_kernel.errors import BudgetExceededError, ModelOverrideDeniedError


def test_secret_store_aes_256_gcm() -> None:
    store = SecretStore()
    raw_api_key = "sk-live-secret-test-key-1234567890"

    encrypted = store.encrypt(raw_api_key)
    assert encrypted != raw_api_key
    assert len(encrypted) > 20

    decrypted = store.decrypt(encrypted)
    assert decrypted == raw_api_key

    masked = store.mask_secret(raw_api_key)
    assert masked == "sk-l...7890"
    assert raw_api_key not in masked


def test_policy_engine_model_lock_ac03() -> None:
    """AC03: Model override request must be denied."""
    policy = PolicyEngine(locked_model_id="gemini-1.5-pro", locked_connection_ref="conn-01")

    # Matching model passes
    policy.enforce_model_lock("gemini-1.5-pro")

    # Overridden model raises ModelOverrideDeniedError
    with pytest.raises(ModelOverrideDeniedError) as exc_info:
        policy.enforce_model_lock("gpt-4o")

    assert exc_info.value.code == "GATEWAY_MODEL_OVERRIDE_DENIED"
    assert exc_info.value.details["requested_model"] == "gpt-4o"
    assert exc_info.value.details["locked_model"] == "gemini-1.5-pro"


@pytest.mark.asyncio
async def test_budget_reservation_and_settlement() -> None:
    manager = TokenBudgetManager()
    manager.set_budget("scope_run1", limit_tokens=1000)

    # 1. Reserve 600 tokens
    remaining = await manager.reserve("scope_run1", 600)
    assert remaining == 400

    # 2. Reserving another 500 exceeds the 1000 limit -> BudgetExceededError
    with pytest.raises(BudgetExceededError):
        await manager.reserve("scope_run1", 500)

    # 3. Settle 600 reservation with actual 450 tokens
    await manager.settle("scope_run1", reserved_tokens=600, actual_tokens=450)

    # 4. Now 500 more can be reserved (1000 - 450 = 550 remaining)
    rem = await manager.reserve("scope_run1", 500)
    assert rem == 50


@pytest.mark.asyncio
async def test_usage_ledger_and_mock_provider_ac12() -> None:
    """AC12: Canonical ledger matches physical mock requests with no double counting."""
    ledger = UsageLedger()
    provider = MockProvider(model_id="test-model")

    # Run 3 simulated requests
    messages = [{"role": "user", "content": "Sample query for document test"}]
    for _ in range(3):
        res = await provider.complete(messages)
        usage: UsageRecord = res["usage"]
        ledger.record_request(
            run_id="run_test_ac12",
            phase="benchmark",
            model="test-model",
            usage=usage,
        )

    totals = ledger.get_run_totals("run_test_ac12")
    assert totals["requests_count"] == 3
    # Total tokens is strictly prompt + completion, no double count of reasoning
    assert totals["total_tokens"] == totals["prompt_tokens"] + totals["completion_tokens"]
    assert totals["reasoning_tokens"] == 15  # 5 per call
    assert totals["usage_source"] == "provider_reported"


def test_model_gateway_records_exact_usage(monkeypatch: pytest.MonkeyPatch) -> None:
    """Workers get exact, provider-reported usage from the gateway ledger (ADR-0006)."""
    monkeypatch.delenv("ARENA_PROVIDER_API_KEY", raising=False)
    gateway = ModelGateway()

    first = gateway.complete(
        run_id="run_gateway_exact",
        candidate_id="can_gateway",
        phase="benchmark",
        step="analyze_conflicts",
        payload={"documents": ["Teslim 15 Ocak 2027. Bütçe 100.000 USD."]},
    )
    gateway.complete(
        run_id="run_gateway_exact",
        candidate_id="can_gateway",
        phase="benchmark",
        step="generate_report",
        payload={"documents": ["Teslim 15 Ocak 2027. Bütçe 100.000 USD."], "conflicts": []},
    )

    totals = gateway.run_usage("run_gateway_exact")
    assert totals["requests_count"] == 2
    assert totals["usage_source"] == "provider_reported"
    assert totals["total_tokens"] == totals["prompt_tokens"] + totals["completion_tokens"]
    assert totals["total_tokens"] > 0
    assert first["usage"]["total_tokens"] == first["usage"]["prompt_tokens"] + first["usage"]["completion_tokens"]
    # a run with no physical requests must not invent tokens
    assert gateway.run_usage("run_unknown")["total_tokens"] == 0
    assert gateway.run_usage("run_unknown")["usage_source"] == "unknown"
