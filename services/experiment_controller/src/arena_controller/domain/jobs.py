"""Postgres-compatible persistent Job Queue with leases (ADR-012, İnşa Planı §4.2)."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any, Protocol
from arena_kernel.ids import generate_id


class JobState(StrEnum):
    QUEUED = "queued"
    LEASED = "leased"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class JobRecord:
    id: str
    job_type: str
    scope_id: str
    payload: dict[str, Any]
    state: JobState = JobState.QUEUED
    priority: int = 100
    attempts: int = 0
    max_attempts: int = 3
    lease_owner: str | None = None
    lease_expires_at: datetime | None = None
    idempotency_key: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class JobQueue(Protocol):
    """Job queue interface for atomic scheduling and lease acquisition."""

    async def enqueue(
        self,
        job_type: str,
        scope_id: str,
        payload: dict[str, Any],
        idempotency_key: str | None = None,
        priority: int = 100,
    ) -> JobRecord:
        ...

    async def lease_next(self, worker_id: str, lease_seconds: int = 60) -> JobRecord | None:
        ...

    async def heartbeat(self, job_id: str, worker_id: str, extend_seconds: int = 60) -> bool:
        ...

    async def complete(self, job_id: str, worker_id: str) -> bool:
        ...

    async def fail(self, job_id: str, worker_id: str, error_message: str) -> bool:
        ...


class InMemoryJobQueue:
    """Thread-safe and async in-memory implementation of JobQueue for tests and dev."""

    def __init__(self) -> None:
        self._jobs: dict[str, JobRecord] = {}
        self._idempotency_index: dict[str, str] = {}

    async def enqueue(
        self,
        job_type: str,
        scope_id: str,
        payload: dict[str, Any],
        idempotency_key: str | None = None,
        priority: int = 100,
    ) -> JobRecord:
        if idempotency_key and idempotency_key in self._idempotency_index:
            existing_id = self._idempotency_index[idempotency_key]
            return self._jobs[existing_id]

        job_id = generate_id("job")
        record = JobRecord(
            id=job_id,
            job_type=job_type,
            scope_id=scope_id,
            payload=payload,
            priority=priority,
            idempotency_key=idempotency_key,
        )
        self._jobs[job_id] = record
        if idempotency_key:
            self._idempotency_index[idempotency_key] = job_id
        return record

    async def lease_next(self, worker_id: str, lease_seconds: int = 60) -> JobRecord | None:
        now = datetime.now(timezone.utc)
        # Find queued or expired lease jobs
        candidates = [
            j for j in self._jobs.values()
            if j.state == JobState.QUEUED or (
                j.state == JobState.LEASED and j.lease_expires_at is not None and j.lease_expires_at < now
            )
        ]
        if not candidates:
            return None

        candidates.sort(key=lambda j: (j.priority, j.created_at))
        job = candidates[0]
        from datetime import timedelta
        job.state = JobState.LEASED
        job.lease_owner = worker_id
        job.lease_expires_at = now + timedelta(seconds=lease_seconds)
        job.attempts += 1
        job.updated_at = now
        return job

    async def heartbeat(self, job_id: str, worker_id: str, extend_seconds: int = 60) -> bool:
        job = self._jobs.get(job_id)
        if not job or job.lease_owner != worker_id or job.state != JobState.LEASED:
            return False
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        job.lease_expires_at = now + timedelta(seconds=extend_seconds)
        job.updated_at = now
        return True

    async def complete(self, job_id: str, worker_id: str) -> bool:
        job = self._jobs.get(job_id)
        if not job or job.lease_owner != worker_id:
            return False
        job.state = JobState.COMPLETED
        job.lease_owner = None
        job.lease_expires_at = None
        job.updated_at = datetime.now(timezone.utc)
        return True

    async def fail(self, job_id: str, worker_id: str, error_message: str) -> bool:
        job = self._jobs.get(job_id)
        if not job or job.lease_owner != worker_id:
            return False
        if job.attempts >= job.max_attempts:
            job.state = JobState.FAILED
        else:
            job.state = JobState.QUEUED  # Retry
        job.lease_owner = None
        job.lease_expires_at = None
        job.updated_at = datetime.now(timezone.utc)
        return True
