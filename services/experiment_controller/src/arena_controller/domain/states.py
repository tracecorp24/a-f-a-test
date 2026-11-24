"""Experiment and Candidate State Machines (GP §4.2, İnşa Planı §4.2)."""

from enum import StrEnum
from typing import Final, Mapping
from arena_kernel.errors import IllegalStateTransitionError


class SpecState(StrEnum):
    DRAFT = "draft"
    CLARIFYING = "clarifying"
    READY_FOR_REVIEW = "ready_for_review"
    APPROVED = "approved"
    ARCHIVED = "archived"


ALLOWED_SPEC_TRANSITIONS: Final[Mapping[SpecState, frozenset[SpecState]]] = {
    SpecState.DRAFT: frozenset({SpecState.CLARIFYING, SpecState.READY_FOR_REVIEW, SpecState.ARCHIVED}),
    SpecState.CLARIFYING: frozenset({SpecState.CLARIFYING, SpecState.READY_FOR_REVIEW, SpecState.ARCHIVED}),
    SpecState.READY_FOR_REVIEW: frozenset({SpecState.CLARIFYING, SpecState.APPROVED, SpecState.ARCHIVED}),
    SpecState.APPROVED: frozenset({SpecState.ARCHIVED}),
    SpecState.ARCHIVED: frozenset(),
}


def transition_spec(current: SpecState, target: SpecState) -> SpecState:
    """Validate and perform spec state transition."""
    allowed = ALLOWED_SPEC_TRANSITIONS.get(current, frozenset())
    if target not in allowed:
        raise IllegalStateTransitionError(current=current.value, target=target.value)
    return target


class CandidateState(StrEnum):
    PREFLIGHT = "preflight"
    BLOCKED = "blocked"
    BUILDING = "building"
    VALIDATING = "validating"
    READY = "ready"
    BUILD_FAILED = "build_failed"
    QUEUED = "queued"
    RUNNING = "running"
    RUN_FAILED = "run_failed"
    EVALUATING = "evaluating"
    EVALUATION_FAILED = "evaluation_failed"
    COMPLETED = "completed"
    EXPORTED = "exported"


ALLOWED_CANDIDATE_TRANSITIONS: Final[Mapping[CandidateState, frozenset[CandidateState]]] = {
    CandidateState.PREFLIGHT: frozenset({CandidateState.BUILDING, CandidateState.BLOCKED}),
    CandidateState.BLOCKED: frozenset({CandidateState.PREFLIGHT}),
    CandidateState.BUILDING: frozenset({CandidateState.VALIDATING, CandidateState.BUILD_FAILED}),
    CandidateState.VALIDATING: frozenset(
        {CandidateState.BUILDING, CandidateState.READY, CandidateState.BUILD_FAILED}
    ),
    CandidateState.BUILD_FAILED: frozenset({CandidateState.BUILDING}),
    CandidateState.READY: frozenset({CandidateState.QUEUED}),
    CandidateState.QUEUED: frozenset({CandidateState.RUNNING}),
    CandidateState.RUNNING: frozenset(
        {CandidateState.EVALUATING, CandidateState.RUN_FAILED}
    ),
    CandidateState.RUN_FAILED: frozenset({CandidateState.QUEUED}),
    CandidateState.EVALUATING: frozenset(
        {CandidateState.COMPLETED, CandidateState.EVALUATION_FAILED}
    ),
    CandidateState.EVALUATION_FAILED: frozenset({CandidateState.EVALUATING}),
    CandidateState.COMPLETED: frozenset({CandidateState.EXPORTED}),
    CandidateState.EXPORTED: frozenset(),
}


def transition_candidate(current: CandidateState, target: CandidateState) -> CandidateState:
    """Validate and perform candidate state transition."""
    allowed = ALLOWED_CANDIDATE_TRANSITIONS.get(current, frozenset())
    if target not in allowed:
        raise IllegalStateTransitionError(current=current.value, target=target.value)
    return target


class ExperimentOutcome(StrEnum):
    SUCCESS = "success"
    FAILED = "failed"
    TIMED_OUT = "timed_out"
    CANCELLED = "cancelled"
