"""Unit tests for state machines and job queue."""

import pytest
from arena_controller.domain.jobs import InMemoryJobQueue, JobState
from arena_controller.domain.states import (
    CandidateState,
    SpecState,
    transition_candidate,
    transition_spec,
)
from arena_kernel.errors import IllegalStateTransitionError


def test_spec_allowed_transitions() -> None:
    state = SpecState.DRAFT
    state = transition_spec(state, SpecState.CLARIFYING)
    assert state == SpecState.CLARIFYING

    state = transition_spec(state, SpecState.READY_FOR_REVIEW)
    assert state == SpecState.READY_FOR_REVIEW

    state = transition_spec(state, SpecState.APPROVED)
    assert state == SpecState.APPROVED


def test_spec_illegal_transition() -> None:
    with pytest.raises(IllegalStateTransitionError) as exc_info:
        transition_spec(SpecState.DRAFT, SpecState.APPROVED)
    assert exc_info.value.code == "ILLEGAL_STATE_TRANSITION"


def test_candidate_allowed_transitions() -> None:
    state = CandidateState.PREFLIGHT
    state = transition_candidate(state, CandidateState.BUILDING)
    state = transition_candidate(state, CandidateState.VALIDATING)
    state = transition_candidate(state, CandidateState.READY)
    state = transition_candidate(state, CandidateState.QUEUED)
    state = transition_candidate(state, CandidateState.RUNNING)
    state = transition_candidate(state, CandidateState.EVALUATING)
    state = transition_candidate(state, CandidateState.COMPLETED)
    assert state == CandidateState.COMPLETED


def test_candidate_illegal_transition() -> None:
    with pytest.raises(IllegalStateTransitionError):
        transition_candidate(CandidateState.PREFLIGHT, CandidateState.COMPLETED)


@pytest.mark.asyncio
async def test_job_queue_lifecycle() -> None:
    queue = InMemoryJobQueue()
    job = await queue.enqueue("build_candidate", "can_01JDX", {"framework": "langgraph"})
    assert job.state == JobState.QUEUED

    leased = await queue.lease_next("worker-1", lease_seconds=30)
    assert leased is not None
    assert leased.id == job.id
    assert leased.lease_owner == "worker-1"
    assert leased.state == JobState.LEASED

    heartbeat_ok = await queue.heartbeat(leased.id, "worker-1")
    assert heartbeat_ok is True

    completed = await queue.complete(leased.id, "worker-1")
    assert completed is True

    # No more jobs available
    next_job = await queue.lease_next("worker-2")
    assert next_job is None
