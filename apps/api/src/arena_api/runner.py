"""Native framework worker execution, evaluation and telemetry for experiments.

Every framework worker in ``runtimes/<id>/skeleton/main.py`` is executed through the real
``WorkerProtocol`` (JSONL events). Wall-clock time, events and outputs are measured here;
quality is scored against the labeled fixtures in ``benchmarks/fixtures``.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import math
import os
import re
import threading
import time
from concurrent.futures import Future, ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeoutError
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

import yaml

from arena_contracts import ArenaEvent, CriterionPolicy, RunSpec
from arena_evaluation.domain.evaluator import EvaluationEngine
from arena_gateway.runtime import get_gateway
from arena_kernel.ids import generate_id
from arena_worker_sdk.protocol import WorkerProtocol

ROOT = Path(__file__).resolve().parents[4]
RUNTIMES_DIR = ROOT / "runtimes"
FIXTURE_DIR = ROOT / "benchmarks" / "fixtures" / "doc-review"

# UI display name -> framework id (single source of truth for the web client too)
FRAMEWORK_IDS: dict[str, str] = {
    "LangGraph": "langgraph",
    "Google ADK": "google-adk",
    "OpenAI Agents": "openai-agents",
    "CrewAI": "crewai",
    "Pydantic AI": "pydantic-ai",
    "Agno": "agno",
    "LlamaAgents": "llama-agents",
    "Smolagents": "smolagents",
    "Mastra": "mastra",
    "Microsoft AF": "microsoft-af",
}
DEFAULT_FRAMEWORKS = list(FRAMEWORK_IDS.values())

MANIFEST_REQUIRED_KEYS = ("id", "upstream", "runtime", "package", "release_version", "worker_protocol", "capabilities")

_evaluator = EvaluationEngine()


class RunCancelled(Exception):
    """Raised inside a worker when the experiment was cancelled."""


class RunLimitExceeded(Exception):
    """Raised inside a worker when it exceeded a RunSpec budget (max_calls)."""


class CapturingProtocol(WorkerProtocol):
    """WorkerProtocol that keeps the JSONL events in memory instead of writing to stdout.

    The experiment-level ``cancel_flag`` (threading.Event) is wired in so a running
    worker observes cancellation at every event / model-call boundary. RunSpec
    budgets (``max_calls``) are enforced here too (ADR-0005 watchdog contract).
    """

    def __init__(
        self,
        spec: RunSpec,
        sink: Callable[[ArenaEvent], None],
        cancel_flag: threading.Event | None = None,
    ) -> None:
        super().__init__(spec)
        self._sink = sink
        self._cancel_flag = cancel_flag
        self._model_calls = 0

    @property
    def is_cancelled(self) -> bool:
        if self._cancel_flag is not None and self._cancel_flag.is_set():
            return True
        return self._is_cancelled

    def emit_event(self, event_type: str, payload: dict[str, Any]) -> ArenaEvent:
        if self.is_cancelled:
            raise RunCancelled()
        self._seq += 1
        event = ArenaEvent(
            event_id=generate_id("evt"),
            run_id=self.spec.run_id,
            candidate_id=self.spec.candidate_id,
            experiment_id=self.spec.experiment_id,
            phase="benchmark",
            seq=self._seq,
            timestamp=datetime.now(timezone.utc),
            type=event_type,
            payload=payload,
        )
        self._sink(event)
        return event

    def complete(
        self,
        step: str,
        payload: dict[str, Any],
        *,
        agent: str | None = None,
        system: str | None = None,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        if self.is_cancelled:
            raise RunCancelled()
        self._model_calls += 1
        if self._model_calls > self.spec.max_calls:
            raise RunLimitExceeded(f"max_calls={self.spec.max_calls} exceeded at step '{step}'")
        return super().complete(step, payload, agent=agent, system=system, max_tokens=max_tokens)


# --------------------------------------------------------------------------- manifests / sources


def runtime_dir(framework_id: str) -> Path:
    path = (RUNTIMES_DIR / framework_id).resolve()
    if RUNTIMES_DIR.resolve() not in path.parents or not path.is_dir():
        raise FileNotFoundError(framework_id)
    return path


def load_manifest(framework_id: str) -> dict[str, Any]:
    with open(runtime_dir(framework_id) / "manifest.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def load_skeleton_source(framework_id: str) -> str:
    return (runtime_dir(framework_id) / "skeleton" / "main.py").read_text(encoding="utf-8")


_STANDALONE_SHIM = '''"""Standalone worker (exported by Agentic Arena). No platform dependencies."""

import json
import sys
from typing import Any

RunSpec = Any


class WorkerProtocol:
    """Minimal stand-in that prints structured events as JSON lines."""

    def __init__(self) -> None:
        self._seq = 0

    def emit_event(self, event_type: str, payload: dict[str, Any]) -> None:
        self._seq += 1
        print(json.dumps({"seq": self._seq, "type": event_type, "payload": payload}), file=sys.stderr)

    def complete(self, step: str, payload: dict[str, Any], *, agent: str | None = None, system: str | None = None, max_tokens: int = 4096) -> dict[str, Any]:
        """Offline stand-in: exported workers run without the platform Model Gateway."""
        self._seq += 1
        print(json.dumps({"seq": self._seq, "type": "model.offline", "payload": {"step": step}}), file=sys.stderr)
        return {
            "model": "offline",
            "content": "",
            "request_id": None,
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "reasoning_tokens": None,
                "cached_prompt_tokens": None,
                "usage_source": "unsupported",
            },
        }


'''


def standalone_source(framework_id: str) -> str:
    """Skeleton source rewritten so it runs without any arena_* package (ADR-009)."""
    source = load_skeleton_source(framework_id)
    kept = [
        line
        for line in source.splitlines()
        if not re.match(r"\s*from arena_(contracts|worker_sdk)\b", line)
    ]
    body = "\n".join(kept).strip("\n")
    # drop the original module docstring: the shim carries its own
    body = re.sub(r'^"""[\s\S]*?"""\n', "", body, count=1)
    entry = entrypoint_name(source)
    return (
        _STANDALONE_SHIM
        + body
        + f'\n\n\nif __name__ == "__main__":\n    print(json.dumps({entry}(None, WorkerProtocol())))\n'
    )


def entrypoint_name(source: str) -> str:
    match = re.search(r"^def (run_\w+_pipeline)\(", source, re.MULTILINE)
    if not match:
        raise ValueError("Worker entrypoint run_*_pipeline not found")
    return match.group(1)


def _load_module(framework_id: str) -> tuple[Any, str]:
    source = load_skeleton_source(framework_id)
    name = entrypoint_name(source)
    path = runtime_dir(framework_id) / "skeleton" / "main.py"
    spec = importlib.util.spec_from_file_location(f"arena_worker_{framework_id.replace('-', '_')}", path)
    if spec is None or spec.loader is None:
        raise ImportError(framework_id)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module, name


def validate_manifest(manifest: dict[str, Any], framework_id: str) -> list[str]:
    errors = [f"missing key: {key}" for key in MANIFEST_REQUIRED_KEYS if key not in manifest]
    if manifest.get("id") not in (None, framework_id):
        errors.append(f"id mismatch: {manifest.get('id')} != {framework_id}")
    if manifest.get("worker_protocol") not in (None, 1):
        errors.append("unsupported worker_protocol")
    return errors


# --------------------------------------------------------------------------- fixtures / evaluation


def fixture_state() -> dict[str, Any]:
    """Verify fixture integrity (sha256 vs manifest) and read the labeled conflict count."""
    manifest = json.loads((FIXTURE_DIR / "manifest.json").read_text(encoding="utf-8"))
    verified = True
    for entry in [*manifest["public_samples"], *manifest["held_out_samples"]]:
        data = (FIXTURE_DIR / entry["path"]).read_bytes().replace(b"\r\n", b"\n")  # autocrlf-safe
        if hashlib.sha256(data).hexdigest() != entry["sha256"]:
            verified = False
    held_out = (FIXTURE_DIR / manifest["held_out_samples"][0]["path"]).read_text(encoding="utf-8")
    match = re.search(r"çelişki sayısı:\s*(\d+)", held_out)
    labeled = int(match.group(1)) if match else 0
    return {
        "benchmark_id": manifest["benchmark_id"],
        "integrity_verified": verified,
        "labeled_conflicts": labeled,
        "public_input": f"benchmarks/fixtures/doc-review/{manifest['public_samples'][0]['path']}",
    }


_CONFLICT_LIST_KEYS = ("conflicts", "discrepancies", "verified_contradictions", "contradictions")
_CONFLICT_COUNT_KEYS = ("conflict_count", "conflicts_detected", "contradictions_found")


def extract_conflict_count(output: dict[str, Any]) -> int | None:
    """Number of conflicts a worker reported, regardless of its native output shape."""
    for key in _CONFLICT_LIST_KEYS:
        value = output.get(key)
        if isinstance(value, list):
            return len(value)
    for key in _CONFLICT_COUNT_KEYS:
        value = output.get(key)
        if isinstance(value, int) and not isinstance(value, bool):
            return value
    return None


def valid_report_schema(output: Any) -> bool:
    """Report schema: JSON object, status == completed and a recognisable conflict section."""
    return (
        isinstance(output, dict)
        and output.get("status", "completed") == "completed"
        and extract_conflict_count(output) is not None
    )


def score_output(output: Any, labeled: int, threshold: float) -> dict[str, Any]:
    schema_ok = valid_report_schema(output)
    predicted = extract_conflict_count(output) if schema_ok else None
    tp = min(predicted or 0, labeled)
    precision = tp / predicted if predicted else 0.0
    recall = tp / labeled if labeled else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    criteria = [
        _evaluator.evaluate_criterion("valid_schema", CriterionPolicy.REQUIRED, schema_ok, True, "json_schema"),
        _evaluator.evaluate_criterion("conflict_f1", CriterionPolicy.REQUIRED, round(f1, 4), threshold, "labeled_f1"),
    ]
    return {
        "schema_pass": schema_ok,
        "predicted_conflicts": predicted,
        "labeled_conflicts": labeled,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "conflict_f1": round(f1, 4),
        "eligible": _evaluator.check_hard_gates(criteria),
        "criteria": [c.model_dump(mode="json") for c in criteria],
    }


# --------------------------------------------------------------------------- telemetry


def _actor(event_type: str, payload: dict[str, Any]) -> str | None:
    for key in ("agent", "subagent", "node", "executor", "service", "team", "crew", "workflow", "id", "event"):
        value = payload.get(key)
        if isinstance(value, (str, int)):
            return str(value)
    return None


def build_telemetry(events: list[dict[str, Any]]) -> dict[str, Any]:
    """Derive agent graph (nodes, directed links with message/token/handoff counts) from events.

    ``model.completion`` events carry the exact provider-reported token usage from the
    gateway ledger (ADR-0006) and contribute to ``exact_tokens``. Every other event
    contributes its payload volume, counted with the tiktoken BPE tokenizer (never a
    chars/4 heuristic); those counts are reported separately as ``derived_tokens`` so
    exact LLM consumption and derived payload volume are never conflated.
    """
    agents: list[str] = []
    links: dict[tuple[str, str], dict[str, int]] = {}
    previous: str | None = None
    for event in events:
        payload = event["payload"]
        exact = False
        if event["type"] == "model.completion":
            actor = payload.get("agent") or payload.get("step")
            if not isinstance(actor, str):
                continue
            source, target, handoff = previous or actor, actor, 0
            tokens = int(payload.get("total_tokens") or 0)
            exact = True
        elif "handoff" in event["type"] and isinstance(payload.get("from"), str) and isinstance(payload.get("to"), str):
            source, target = payload["from"], payload["to"]
            handoff = 1
            tokens = count_tokens(json.dumps(payload, ensure_ascii=False, sort_keys=True))
        else:
            actor = _actor(event["type"], payload)
            if actor is None:
                continue
            source, target, handoff = previous or actor, actor, 0
            tokens = count_tokens(json.dumps(payload, ensure_ascii=False, sort_keys=True))
        for name in (source, target):
            if name not in agents:
                agents.append(name)
        if source != target:
            link = links.setdefault(
                (source, target),
                {"messages": 0, "tokens": 0, "handoffs": 0, "exact_tokens": 0, "derived_tokens": 0},
            )
            link["messages"] += 1
            link["tokens"] += tokens
            link["handoffs"] += handoff
            if exact:
                link["exact_tokens"] += tokens
            else:
                link["derived_tokens"] += tokens
        previous = target
    return {
        "agents": agents,
        "links": [
            {
                "from": a,
                "to": b,
                "messages": v["messages"],
                "tokens": v["tokens"],
                "handoffs": v["handoffs"],
                "exact_tokens": v["exact_tokens"],
                "derived_tokens": v["derived_tokens"],
            }
            for (a, b), v in links.items()
        ],
    }


# --------------------------------------------------------------------------- execution


def run_worker(
    framework_id: str,
    experiment_id: str,
    candidate_id: str,
    repetition: int,
    on_event: Callable[[dict[str, Any]], None] | None = None,
    cancel_flag: threading.Event | None = None,
) -> dict[str, Any]:
    """Run one repetition of a framework worker and return measurements.

    The worker entrypoint executes in a dedicated thread and is subject to the
    RunSpec ``watchdog_seconds`` deadline (ADR-0005): a hung worker fails its
    repetition instead of blocking the experiment forever. Cancellation is
    observed by the worker protocol itself, so runs abort at the next event or
    model-call boundary.
    """
    module, entry = _load_module(framework_id)
    spec = RunSpec(
        run_id=generate_id("run"),
        candidate_id=candidate_id,
        experiment_id=experiment_id,
        input_ref=fixture_state()["public_input"],
        repetition=repetition,
        gateway_base_url=os.getenv("ARENA_GATEWAY_BASE_URL", "http://127.0.0.1:8000/v1"),
        tool_broker_url=os.getenv("ARENA_TOOL_BROKER_URL", "http://127.0.0.1:8001/v1"),
        max_tokens=100000,
        max_calls=40,
        watchdog_seconds=600,
    )
    events: list[dict[str, Any]] = []

    def sink(event: ArenaEvent) -> None:
        record = {"seq": event.seq, "type": event.type, "payload": event.payload}
        events.append(record)
        if on_event:
            on_event(record)

    protocol = CapturingProtocol(spec, sink, cancel_flag=cancel_flag)
    started = time.perf_counter()
    error: str | None = None
    output: Any = None
    if cancel_flag is not None and cancel_flag.is_set():
        error = "cancelled"
    else:
        pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix=f"worker-{framework_id}")
        try:
            future: Future[Any] = pool.submit(getattr(module, entry), spec, protocol)
            output = future.result(timeout=spec.watchdog_seconds)
        except FutureTimeoutError:
            error = f"watchdog timeout after {spec.watchdog_seconds}s"
            # Python threads cannot be killed: signal cooperative cancellation so the
            # leaked worker stops issuing LLM calls / emitting events at its next
            # protocol boundary instead of burning tokens behind a dead run (report 03 §2.1).
            protocol.cancel()
            if cancel_flag is not None:
                cancel_flag.set()
        except RunCancelled:
            error = "cancelled"
        except RunLimitExceeded as exc:
            error = f"budget exceeded: {exc}"
        except Exception as exc:  # worker failure is a measured outcome, not an API crash
            error = f"{type(exc).__name__}: {exc}"
        finally:
            pool.shutdown(wait=False)
    duration_ms = (time.perf_counter() - started) * 1000
    # Exact token usage for this run, straight from the canonical gateway ledger (ADR-0006).
    usage = get_gateway().run_usage(spec.run_id)
    return {"output": output, "events": events, "error": error, "duration_ms": duration_ms, "usage": usage}


def smoke_test(framework_id: str) -> dict[str, Any]:
    """Execute the worker once and report lifecycle / protocol conformance."""
    started = time.perf_counter()
    try:
        result = run_worker(framework_id, "exp_smoke", "can_smoke", 1)
    except Exception as exc:
        return {"passed": False, "error": f"{type(exc).__name__}: {exc}", "events": 0, "duration_ms": 0.0}
    passed = result["error"] is None and valid_report_schema(result["output"]) and len(result["events"]) > 0
    return {
        "passed": passed,
        "error": result["error"],
        "events": len(result["events"]),
        "duration_ms": round((time.perf_counter() - started) * 1000, 3),
    }


def normalize_scores(candidates: list[dict[str, Any]]) -> None:
    """Fill quality/speed/token/reliability (0-100) from measured values, relative to the field."""
    done = [c for c in candidates if c.get("measured")]
    if not done:
        return
    fastest = min(c["measured"]["avg_duration_ms"] for c in done) or 1e-6
    lowest = min(c["measured"]["avg_tokens"] for c in done) or 1
    for c in done:
        m = c["measured"]
        c["metrics"] = {
            "quality": round(m["avg_f1"] * 100, 2),
            "speed": round(100 * fastest / max(m["avg_duration_ms"], 1e-6), 2),
            "token": round(100 * lowest / max(m["avg_tokens"], 1), 2),
            "reliability": round(100 * m["successes"] / max(m["repetitions"], 1), 2),
        }
