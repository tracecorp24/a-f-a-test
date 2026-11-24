"""Initial schema migration: projects, task_specs, experiments, candidates, jobs, events, audit_events.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-11-24 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'projects',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('owner', sa.String(255), nullable=True),
        sa.Column('archived', sa.Boolean(), default=False, nullable=False),
    )

    op.create_table(
        'task_specs',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('project_id', sa.String(32), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('revision', sa.Integer(), default=1, nullable=False),
        sa.Column('schema_json', postgresql.JSONB(), nullable=False),
        sa.Column('spec_hash', sa.String(64), nullable=False),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        'experiments',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('spec_id', sa.String(32), sa.ForeignKey('task_specs.id'), nullable=False),
        sa.Column('model_snapshot', sa.String(255), nullable=False),
        sa.Column('status', sa.String(50), default='created', nullable=False),
        sa.Column('budgets', postgresql.JSONB(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'candidates',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('experiment_id', sa.String(32), sa.ForeignKey('experiments.id'), nullable=False),
        sa.Column('framework_id', sa.String(50), nullable=False),
        sa.Column('source_digest', sa.String(64), nullable=True),
        sa.Column('status', sa.String(50), default='preflight', nullable=False),
    )

    op.create_table(
        'jobs',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('job_type', sa.String(100), nullable=False),
        sa.Column('scope_id', sa.String(32), nullable=False),
        sa.Column('payload', postgresql.JSONB(), nullable=False),
        sa.Column('state', sa.String(50), default='queued', nullable=False),
        sa.Column('priority', sa.Integer(), default=100, nullable=False),
        sa.Column('attempts', sa.Integer(), default=0, nullable=False),
        sa.Column('max_attempts', sa.Integer(), default=3, nullable=False),
        sa.Column('lease_owner', sa.String(100), nullable=True),
        sa.Column('lease_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('idempotency_key', sa.String(128), unique=True, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        'events',
        sa.Column('event_id', sa.String(32), primary_key=True),
        sa.Column('experiment_id', sa.String(32), nullable=False),
        sa.Column('run_id', sa.String(32), nullable=True),
        sa.Column('candidate_id', sa.String(32), nullable=True),
        sa.Column('phase', sa.String(50), nullable=False),
        sa.Column('seq', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('type', sa.String(100), nullable=False),
        sa.Column('payload', postgresql.JSONB(), nullable=False),
    )

    op.create_table(
        'audit_events',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('actor', sa.String(100), nullable=False),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('target', sa.String(100), nullable=False),
        sa.Column('outcome', sa.String(50), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('redacted_details', postgresql.JSONB(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('audit_events')
    op.drop_table('events')
    op.drop_table('jobs')
    op.drop_table('candidates')
    op.drop_table('experiments')
    op.drop_table('task_specs')
    op.drop_table('projects')
