"""Worker Conformance Test Suite across all 10 Framework Runtimes (GP §2, İnşa Planı §1.5, §6.1)."""

import importlib.util
import io
from pathlib import Path
import sys
import pytest
from arena_contracts import RunSpec
from arena_worker_sdk.protocol import WorkerProtocol


def _load_pipeline_module(relative_path: str):
    root = Path(__file__).resolve().parents[3]
    full_path = root / relative_path
    spec = importlib.util.spec_from_file_location("pipeline_mod", str(full_path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def make_test_spec(framework_id: str) -> RunSpec:
    return RunSpec(
        run_id=f"run_test_{framework_id}",
        candidate_id=f"can_{framework_id}_01",
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
    spec = make_test_spec("langgraph")
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


FRAMEWORKS_TO_TEST = [
    ("langgraph", "runtimes/langgraph/skeleton/main.py", "run_langgraph_pipeline"),
    ("google-adk", "runtimes/google-adk/skeleton/main.py", "run_google_adk_pipeline"),
    ("microsoft-af", "runtimes/microsoft-af/skeleton/main.py", "run_microsoft_af_pipeline"),
    ("openai-agents", "runtimes/openai-agents/skeleton/main.py", "run_openai_agents_pipeline"),
    ("crewai", "runtimes/crewai/skeleton/main.py", "run_crewai_pipeline"),
    ("agno", "runtimes/agno/skeleton/main.py", "run_agno_pipeline"),
    ("pydantic-ai", "runtimes/pydantic-ai/skeleton/main.py", "run_pydantic_ai_pipeline"),
    ("llama-agents", "runtimes/llama-agents/skeleton/main.py", "run_llama_agents_pipeline"),
    ("smolagents", "runtimes/smolagents/skeleton/main.py", "run_smolagents_pipeline"),
    ("mastra", "runtimes/mastra/skeleton/main.py", "run_mastra_pipeline"),
]


@pytest.mark.parametrize("framework_id,module_path,entrypoint_func", FRAMEWORKS_TO_TEST)
def test_all_10_framework_runtimes_conformance(framework_id: str, module_path: str, entrypoint_func: str) -> None:
    mod = _load_pipeline_module(module_path)
    spec = make_test_spec(framework_id)
    protocol = WorkerProtocol(spec)

    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    try:
        fn = getattr(mod, entrypoint_func)
        result = fn(spec, protocol)
    finally:
        sys.stdout = old_stdout

    assert result is not None
    assert isinstance(result, dict)
    assert result.get("status") == "completed" or "framework" in result or "task" in result
