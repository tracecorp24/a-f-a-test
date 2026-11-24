"""Benchmark Integrity and Hard Criteria Ranking Tests (ADR-007, İnşa Planı §1.5)."""

from arena_contracts import CriterionPolicy, CriterionStatus
from arena_evaluation.domain.evaluator import EvaluationEngine
from arena_recommendation.domain.ranking import CandidateBenchmarkData, RankingEngine
from arena_telemetry.domain.store import TelemetryEventStore


def test_telemetry_event_deduplication() -> None:
    from datetime import datetime, timezone
    from arena_contracts import ArenaEvent

    store = TelemetryEventStore()
    evt = ArenaEvent(
        event_id="evt_01JDX123",
        experiment_id="exp_01",
        run_id="run_01",
        phase="benchmark",
        seq=1,
        timestamp=datetime.now(timezone.utc),
        type="node.finish",
        payload={"result": "ok"},
    )

    first_insert = store.append_event(evt)
    second_insert = store.append_event(evt)

    assert first_insert is True
    assert second_insert is False  # Deduplicated
    assert len(store.get_run_events("run_01")) == 1


def test_evaluation_engine_hard_gate_blocking() -> None:
    engine = EvaluationEngine()

    c1 = engine.evaluate_criterion("schema_valid", CriterionPolicy.REQUIRED, True, True, "json_schema")
    c2 = engine.evaluate_criterion("f1_score", CriterionPolicy.REQUIRED, 0.85, 0.90, "labeled_f1")

    assert c1.status == CriterionStatus.PASSED
    assert c2.status == CriterionStatus.FAILED

    # Because c2 failed and policy is REQUIRED, hard gate check fails
    assert engine.check_hard_gates([c1, c2]) is False


def test_ranking_engine_adr007_hard_gate_before_weights() -> None:
    """ADR-007: Candidates failing hard criteria cannot be recommended."""
    ranking = RankingEngine()

    candidates = [
        # LangGraph: eligible, good scores
        CandidateBenchmarkData(
            candidate_id="can_lg",
            framework_id="langgraph",
            is_eligible=True,
            quality_score=90.0,
            speed_score=80.0,
            token_efficiency_score=85.0,
            reliability_score=95.0,
        ),
        # CrewAI: higher quality, but FAILED hard gate (e.g. schema invalid or egress violation)
        CandidateBenchmarkData(
            candidate_id="can_crew",
            framework_id="crewai",
            is_eligible=False,
            quality_score=98.0,
            speed_score=90.0,
            token_efficiency_score=90.0,
            reliability_score=90.0,
        ),
    ]

    result = ranking.rank_candidates(candidates)
    assert result["status"] == "RECOMMENDED"
    # Even though CrewAI had 98 quality, it was ineligible, so LangGraph wins!
    assert result["winner"] == "langgraph"
    assert "crewai" in result["ineligible"]


def test_ranking_engine_no_eligible_winner() -> None:
    """When all candidates fail hard criteria, no winner is fabricated."""
    ranking = RankingEngine()
    candidates = [
        CandidateBenchmarkData("c1", "langgraph", False, 90, 80, 80, 80),
        CandidateBenchmarkData("c2", "google-adk", False, 85, 75, 70, 80),
    ]

    result = ranking.rank_candidates(candidates)
    assert result["status"] == "NO_ELIGIBLE_CANDIDATES"
    assert result["winner"] is None
