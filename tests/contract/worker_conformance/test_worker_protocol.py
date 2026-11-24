"""Worker Conformance Test Suite (İnşa Planı §1.5, §6.1 F2.1)."""

import importlib.util
import io
from pathlib import Path
import sys
from arena_contracts import RunSpec
from arena_worker_sdk.protocol import WorkerProtocol


def _load_pipeline_module(relative_path: str):
    root = Path(__file__).resolve().parents[3]
    full_path = root / relative_path
    spec = importlib.util.spec_from_file_location("pipeline_mod", str(full_path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def make_test_spec(candidate_id: str) -> RunSpec:
    return RunSpec(
        run_id="run_test_01JDX",
        candidate_id=candidate_id,
        experiment_id="exp_test_01JDX",
        input_ref="benchmarks/fixtures/doc-review/sample1.txt",
        repetition=1,
        gateway_base_url="http://127.0.0.1:8000/v1",
        tool_broker_url="http://127.0.0.1:8001/v1",
        max_tokens=50000,
        max_calls=20,
        watchdog_seconds=300,
    )


def test_worker_protocol_event_emission() -> None:
    spec = make_test_spec("can_langgraph_01")
    protocol = WorkerProtocol(spec)

    captured_out = io.StringIO()
    old_stdout = sys.stdout
    try:
        sys.stdout = captured_out
        evt1 = protocol.emit_event("test.start", {"key": "val1"})
        evt2 = protocol.emit_event("test.finish", {"key": "val2"})
    finally:
        sys.stdout = old_stdout

    assert evt1.seq == 1
    assert evt2.seq == 2
    assert evt1.type == "test.start"
    assert evt2.type == "test.finish"

    lines = captured_out.getvalue().strip().split("\n")
    assert len(lines) == 2


def test_langgraph_pilot_pipeline_conformance() -> None:
    mod = _load_pipeline_module("runtimes/langgraph/skeleton/main.py")
    spec = make_test_spec("can_langgraph_pilot")
    protocol = WorkerProtocol(spec)

    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    try:
        result = mod.run_langgraph_pipeline(spec, protocol)
    finally:
        sys.stdout = old_stdout

    assert result["task"] == "doc-review"
    assert result["conflict_count"] == 2
    assert result["status"] == "completed"


def test_google_adk_pilot_pipeline_conformance() -> None:
    mod = _load_pipeline_module("runtimes/google-adk/skeleton/main.py")
    spec = make_test_spec("can_google_adk_pilot")
    protocol = WorkerProtocol(spec)

    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    try:
        result = mod.run_google_adk_pipeline(spec, protocol)
    finally:
        sys.stdout = old_stdout

    assert result["framework"] == "google-adk"
    assert result["hierarchical_flow"] is True
    assert len(result["conflicts"]) == 2
