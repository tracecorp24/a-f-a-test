"""Unit tests for arena-kernel."""

import json
from arena_kernel.clock import FrozenClock, SystemClock
from arena_kernel.errors import ArenaError, BudgetExceededError, ModelOverrideDeniedError
from arena_kernel.hashing import canonical_json_bytes, canonical_json_hash
from arena_kernel.ids import generate_id, generate_ulid
from arena_kernel.logging import redact_secrets_processor


def test_ulid_format() -> None:
    ulid = generate_ulid()
    assert len(ulid) == 26
    assert ulid.isalnum()


def test_generate_id_with_prefix() -> None:
    exp_id = generate_id("exp")
    assert exp_id.startswith("exp_")
    assert len(exp_id) == 30

    run_id = generate_id("run")
    assert run_id.startswith("run_")


def test_frozen_clock() -> None:
    clock = FrozenClock()
    t1 = clock.now_utc()
    clock.advance(15.5)
    t2 = clock.now_utc()
    assert (t2 - t1).total_seconds() == 15.5
    assert clock.monotonic() == 15.5


def test_system_clock() -> None:
    clock = SystemClock()
    assert clock.now_utc().tzinfo is not None
    assert clock.monotonic() > 0


def test_canonical_json_hashing() -> None:
    dict1 = {"b": 2, "a": 1}
    dict2 = {"a": 1, "b": 2}
    # Key ordering shouldn't change hash
    assert canonical_json_bytes(dict1) == b'{"a":1,"b":2}'
    assert canonical_json_hash(dict1) == canonical_json_hash(dict2)


def test_errors_hierarchy() -> None:
    err = ModelOverrideDeniedError("gpt-4o", "locked-model")
    assert isinstance(err, ArenaError)
    assert err.code == "GATEWAY_MODEL_OVERRIDE_DENIED"
    assert err.retryable is False
    assert err.details["requested_model"] == "gpt-4o"

    budget_err = BudgetExceededError("tokens", 105000, 100000)
    assert budget_err.code == "BUDGET_EXCEEDED"


def test_redact_secrets() -> None:
    event_dict = {
        "event": "request started",
        "api_key": "sk-1234567890abcdef1234567890",
        "google_key": "AIzaSyB1234567890abcdef1234567890123",
        "safe_value": "hello world",
    }
    redacted = redact_secrets_processor(None, "info", event_dict)
    assert redacted["api_key"] == "[REDACTED]"
    assert redacted["google_key"] == "[REDACTED]"
    assert redacted["safe_value"] == "hello world"
