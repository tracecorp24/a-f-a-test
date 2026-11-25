"""Experiment state, persistence and the background orchestrator."""

from __future__ import annotations

import asyncio
import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from arena_api import runner
from arena_kernel.errors import IllegalStateTransitionError, ResourceNotFoundError
from arena_kernel.ids import generate_id

MAX_EVENTS = 5000
MAX_REPETITIONS = 10
DEFAULT_THRESHOLD = 0.90

ACTIVE = {"running", "paused"}
RUNNABLE = {"built", "completed", "cancelled", "failed"}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ArenaState:
    """In-memory stores guarded by a lock and persisted to a JSON file."""

    def __init__(self, state_file: Path | None) -> None:
        self.lock = threading.RLock()
        self.state_file = state_file
        self.projects: dict[str, dict[str, Any]] = {}
        self.specs: dict[str, dict[str, Any]] = {}
        self.experiments: dict[str, dict[str, Any]] = {}
        self.candidates: dict[str, dict[str, Any]] = {}
        self.exports: dict[str, dict[str, Any]] = {}
        self._pause: dict[str, threading.Event] = {}
        self._cancel: dict[str, threading.Event] = {}
        self._tasks: dict[str, asyncio.Task[None]] = {}
        self._load()

    # ------------------------------------------------------------------ persistence
    def _load(self) -> None:
        if not self.state_file or not self.state_file.exists():
            return
        try:
            data = json.loads(self.state_file.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return
        self.projects = data.get("projects", {})
        self.specs = data.get("specs", {})
        self.experiments = data.get("experiments", {})
        self.candidates = data.get("candidates", {})
        self.exports = data.get("exports", {})
        for exp in self.experiments.values():  # a restart interrupts running work
            if exp["status"] in ACTIVE:
                exp["status"] = "failed"
                exp["error"] = "Sunucu yeniden başlatıldığı için çalışma yarıda kesildi."
                for cid in exp["candidates"]:
                    cand = self.candidates.get(cid)
                    if cand and cand["status"] in {"queued", "running"}:
                        cand["status"] = "failed"

    def save(self) -> None:
        if not self.state_file:
            return
        with self.lock:
            payload = json.dumps(
                {
                    "projects": self.projects,
                    "specs": self.specs,
                    "experiments": self.experiments,
                    "candidates": self.candidates,
                    "exports": self.exports,
                },
                ensure_ascii=False,
            )
            self.state_file.parent.mkdir(parents=True, exist_ok=True)
            tmp = self.state_file.with_suffix(".tmp")
            tmp.write_text(payload, encoding="utf-8")
            os.replace(tmp, self.state_file)

    # ------------------------------------------------------------------ lookups
    def experiment(self, exp_id: str) -> dict[str, Any]:
        exp = self.experiments.get(exp_id)
        if not exp:
            raise ResourceNotFoundError("Experiment", exp_id)
        return exp

    def candidate(self, candidate_id: str) -> dict[str, Any]:
        cand = self.candidates.get(candidate_id)
        if not cand:
            raise ResourceNotFoundError("Candidate", candidate_id)
        return cand

    # ------------------------------------------------------------------ views
    def candidate_view(self, cand: dict[str, Any]) -> dict[str, Any]:
        """Candidate without the (large) source code."""
        return {k: v for k, v in cand.items() if k != "code"}

    def summary(self, exp: dict[str, Any]) -> dict[str, Any]:
        cands = [self.candidates[c] for c in exp["candidates"] if c in self.candidates]
        done = [c for c in cands if c["status"] in {"completed", "failed", "cancelled"}]
        return {
            "id": exp["id"],
            "spec_id": exp["spec_id"],
            "status": exp["status"],
            "objective": exp.get("objective", ""),
            "created_at": exp["created_at"],
            "started_at": exp.get("started_at"),
            "finished_at": exp.get("finished_at"),
            "frameworks": [c["framework_id"] for c in cands],
            "completed_count": len(done),
            "total_count": len(cands),
            "model_snapshot": exp["model_snapshot"],
        }

    def detail(self, exp: dict[str, Any]) -> dict[str, Any]:
        with self.lock:
            body = {k: v for k, v in exp.items() if k != "events"}
            body["event_count"] = len(exp.get("events", []))
            body["candidate_details"] = [
                self.candidate_view(self.candidates[c]) for c in exp["candidates"] if c in self.candidates
            ]
            body["summary"] = self.summary(exp)
            return json.loads(json.dumps(body, default=str))

    # ------------------------------------------------------------------ events
    def add_event(self, exp: dict[str, Any], framework_id: str | None, etype: str, payload: dict[str, Any]) -> None:
        with self.lock:
            events: list[dict[str, Any]] = exp.setdefault("events", [])
            seq = exp["event_seq"] = exp.get("event_seq", 0) + 1
            events.append(
                {"seq": seq, "ts": now_iso(), "framework_id": framework_id, "type": etype, "payload": payload}
            )
            if len(events) > MAX_EVENTS:
                del events[: len(events) - MAX_EVENTS]

    def events_after(self, exp: dict[str, Any], after: int, limit: int = 500) -> dict[str, Any]:
        with self.lock:
            items = [e for e in exp.get("events", []) if e["seq"] > after][:limit]
            return {"events": json.loads(json.dumps(items, default=str)), "last_seq": exp.get("event_seq", 0)}

    # ------------------------------------------------------------------ lifecycle
    def build(self, exp: dict[str, Any], frameworks: list[str]) -> list[str]:
        if exp["status"] not in {"created", "built"}:
            raise IllegalStateTransitionError(exp["status"], "built")
        with self.lock:
            for cid in exp["candidates"]:
                self.candidates.pop(cid, None)
            ids: list[str] = []
            for fw in frameworks:
                cid = generate_id("can")
                self.candidates[cid] = {
                    "id": cid,
                    "experiment_id": exp["id"],
                    "framework_id": fw,
                    "status": "ready",
                    "code": runner.load_skeleton_source(fw),
                    "metrics": None,
                    "evaluation": None,
                    "usage": None,
                    "progress": {"repetitions_done": 0, "repetitions_total": exp["repetitions"]},
                    "measured": None,
                    "telemetry": {"agents": [], "links": []},
                    "event_count": 0,
                    "error": None,
                }
                ids.append(cid)
            exp["candidates"] = ids
            exp["status"] = "built"
        self.save()
        return ids

    def start(self, exp: dict[str, Any]) -> None:
        if exp["status"] not in RUNNABLE:
            raise IllegalStateTransitionError(exp["status"], "running")
        with self.lock:
            exp.update(
                {"status": "running", "started_at": now_iso(), "finished_at": None, "error": None, "events": [], "event_seq": 0}
            )
            for cid in exp["candidates"]:
                cand = self.candidates[cid]
                cand.update(
                    {
                        "status": "queued",
                        "metrics": None,
                        "evaluation": None,
                        "usage": None,
                        "measured": None,
                        "error": None,
                        "telemetry": {"agents": [], "links": []},
                        "event_count": 0,
                        "progress": {"repetitions_done": 0, "repetitions_total": exp["repetitions"]},
                    }
                )
        self._pause[exp["id"]] = threading.Event()
        self._cancel[exp["id"]] = threading.Event()
        self.save()
        self._tasks[exp["id"]] = asyncio.create_task(self._orchestrate(exp["id"]))

    def pause(self, exp: dict[str, Any]) -> None:
        if exp["status"] != "running":
            raise IllegalStateTransitionError(exp["status"], "paused")
        self._pause[exp["id"]].set()
        exp["status"] = "paused"
        self.add_event(exp, None, "experiment.paused", {})
        self.save()

    def resume(self, exp: dict[str, Any]) -> None:
        if exp["status"] != "paused":
            raise IllegalStateTransitionError(exp["status"], "running")
        self._pause[exp["id"]].clear()
        exp["status"] = "running"
        self.add_event(exp, None, "experiment.resumed", {})
        self.save()

    def cancel(self, exp: dict[str, Any]) -> None:
        if exp["status"] not in ACTIVE:
            raise IllegalStateTransitionError(exp["status"], "cancelled")
        self._cancel[exp["id"]].set()
        self._pause[exp["id"]].clear()
        self.add_event(exp, None, "experiment.cancel_requested", {})

    # ------------------------------------------------------------------ orchestrator
    async def _orchestrate(self, exp_id: str) -> None:
        exp = self.experiments[exp_id]
        cancel = self._cancel[exp_id]
        pause = self._pause[exp_id]
        try:
            fixture = runner.fixture_state()
            exp["fixture"] = fixture
            if not fixture["integrity_verified"]:
                raise RuntimeError("Benchmark fixture bütünlük doğrulaması başarısız (sha256 uyuşmuyor).")
            self.add_event(exp, None, "experiment.started", {"frameworks": len(exp["candidates"])})
            for cid in list(exp["candidates"]):
                if cancel.is_set():
                    break
                await self._run_candidate(exp, self.candidates[cid], fixture, cancel, pause)
            with self.lock:
                runner.normalize_scores([self.candidates[c] for c in exp["candidates"]])
                if cancel.is_set():
                    for cid in exp["candidates"]:
                        cand = self.candidates[cid]
                        if cand["status"] in {"queued", "running"}:
                            cand["status"] = "cancelled"
                    exp["status"] = "cancelled"
                else:
                    exp["status"] = "completed"
                exp["finished_at"] = now_iso()
            self.add_event(exp, None, f"experiment.{exp['status']}", {})
        except Exception as exc:
            with self.lock:
                exp["status"] = "failed"
                exp["error"] = f"{type(exc).__name__}: {exc}"
                exp["finished_at"] = now_iso()
                for cid in exp["candidates"]:
                    cand = self.candidates[cid]
                    if cand["status"] in {"queued", "running"}:
                        cand["status"] = "failed"
            self.add_event(exp, None, "experiment.failed", {"error": exp["error"]})
        finally:
            self.save()

    async def _run_candidate(
        self,
        exp: dict[str, Any],
        cand: dict[str, Any],
        fixture: dict[str, Any],
        cancel: threading.Event,
        pause: threading.Event,
    ) -> None:
        fw = cand["framework_id"]
        with self.lock:
            cand["status"] = "running"
        self.add_event(exp, fw, "run.started", {})
        reps: list[dict[str, Any]] = []
        all_events: list[dict[str, Any]] = []

        def on_event(record: dict[str, Any]) -> None:
            self.add_event(exp, fw, record["type"], record["payload"])

        for repetition in range(1, exp["repetitions"] + 1):
            while pause.is_set() and not cancel.is_set():
                await asyncio.sleep(0.1)
            if cancel.is_set():
                break
            result = await asyncio.to_thread(
                runner.run_worker, fw, exp["id"], cand["id"], repetition, on_event, cancel
            )
            if result["error"] == "cancelled":
                break
            ok = result["error"] is None
            score = (
                runner.score_output(result["output"], fixture["labeled_conflicts"], exp["threshold"])
                if ok
                else runner.score_output(None, fixture["labeled_conflicts"], exp["threshold"])
            )
            tokens = runner.estimate_tokens(result["events"], result["output"])
            reps.append({"ok": ok, "score": score, "tokens": tokens, "duration_ms": result["duration_ms"], "error": result["error"]})
            if repetition == 1:
                all_events = result["events"]
            with self.lock:
                cand["progress"]["repetitions_done"] = repetition
                cand["event_count"] += len(result["events"])
            await asyncio.sleep(0)

        with self.lock:
            if not reps:
                cand["status"] = "cancelled"
                return
            n = len(reps)
            successes = sum(1 for r in reps if r["ok"])
            last = reps[-1]["score"]
            cand["measured"] = {
                "repetitions": n,
                "successes": successes,
                "avg_f1": sum(r["score"]["conflict_f1"] for r in reps) / n,
                "avg_duration_ms": sum(r["duration_ms"] for r in reps) / n,
                "avg_tokens": sum(r["tokens"] for r in reps) / n,
            }
            cand["evaluation"] = {
                "schema_pass": all(r["score"]["schema_pass"] for r in reps),
                "conflict_f1": round(cand["measured"]["avg_f1"], 4),
                "precision": round(sum(r["score"]["precision"] for r in reps) / n, 4),
                "recall": round(sum(r["score"]["recall"] for r in reps) / n, 4),
                "predicted_conflicts": last["predicted_conflicts"],
                "labeled_conflicts": last["labeled_conflicts"],
                "eligible": all(r["score"]["eligible"] for r in reps),
                "criteria": last["criteria"],
                "threshold": exp["threshold"],
            }
            cand["usage"] = {
                "total_tokens": round(cand["measured"]["avg_tokens"]),
                "source": "estimated",
                "note": "İşçiler model çağrısı yapmaz; token değeri olay yüklerinin boyutundan tahmin edilir.",
            }
            cand["duration_ms"] = round(cand["measured"]["avg_duration_ms"], 3)
            cand["telemetry"] = runner.build_telemetry(all_events)
            cand["error"] = next((r["error"] for r in reps if r["error"]), None)
            cand["status"] = "completed" if successes else "failed"
            runner.normalize_scores([self.candidates[c] for c in exp["candidates"]])
        self.add_event(
            exp,
            fw,
            "run.finished",
            {"status": cand["status"], "f1": cand["evaluation"]["conflict_f1"], "eligible": cand["evaluation"]["eligible"]},
        )
        self.save()
