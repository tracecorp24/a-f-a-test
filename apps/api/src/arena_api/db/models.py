"""Database models for Agentic Arena PostgreSQL schema (GP §14.1)."""

from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String(32), primary_key=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    owner = Column(String(255), nullable=True)
    archived = Column(Boolean, default=False, nullable=False)


class TaskSpecModel(Base):
    __tablename__ = "task_specs"

    id = Column(String(32), primary_key=True)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False)
    revision = Column(Integer, default=1, nullable=False)
    schema_json = Column(JSONB, nullable=False)
    spec_hash = Column(String(64), nullable=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class ExperimentModel(Base):
    __tablename__ = "experiments"

    id = Column(String(32), primary_key=True)
    spec_id = Column(String(32), ForeignKey("task_specs.id"), nullable=False)
    model_snapshot = Column(String(255), nullable=False)
    status = Column(String(50), default="created", nullable=False)
    budgets = Column(JSONB, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)


class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(String(32), primary_key=True)
    experiment_id = Column(String(32), ForeignKey("experiments.id"), nullable=False)
    framework_id = Column(String(50), nullable=False)
    source_digest = Column(String(64), nullable=True)
    status = Column(String(50), default="preflight", nullable=False)


class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(String(32), primary_key=True)
    job_type = Column(String(100), nullable=False)
    scope_id = Column(String(32), nullable=False)
    payload = Column(JSONB, nullable=False)
    state = Column(String(50), default="queued", nullable=False)
    priority = Column(Integer, default=100, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=3, nullable=False)
    lease_owner = Column(String(100), nullable=True)
    lease_expires_at = Column(DateTime(timezone=True), nullable=True)
    idempotency_key = Column(String(128), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class EventModel(Base):
    __tablename__ = "events"

    event_id = Column(String(32), primary_key=True)
    experiment_id = Column(String(32), nullable=False)
    run_id = Column(String(32), nullable=True)
    candidate_id = Column(String(32), nullable=True)
    phase = Column(String(50), nullable=False)
    seq = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    type = Column(String(100), nullable=False)
    payload = Column(JSONB, nullable=False)


class AuditEventModel(Base):
    __tablename__ = "audit_events"

    id = Column(String(32), primary_key=True)
    actor = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    target = Column(String(100), nullable=False)
    outcome = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    redacted_details = Column(JSONB, nullable=True)
