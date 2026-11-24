/**
 * Data contracts and interfaces for Agentic Arena TypeScript apps and workers.
 */

export type UsageSource =
  | 'measured'
  | 'provider_reported'
  | 'derived'
  | 'estimated'
  | 'unsupported'
  | 'unknown';

export type CriterionPolicy = 'required' | 'preferred' | 'free' | 'not_applicable';

export type CriterionStatus = 'passed' | 'failed' | 'warning' | 'unresolved' | 'unknown';

export type CapabilityStatus = 'verified' | 'pending_provider_probe' | 'unsupported' | 'unknown';

export type RuntimeStatus =
  | 'not_installed'
  | 'pulling'
  | 'ready_cold'
  | 'ready_warm'
  | 'busy'
  | 'degraded'
  | 'update_available'
  | 'blocked';

export interface ErrorBody {
  readonly code: string;
  readonly message: string;
  readonly correlation_id: string;
  readonly retryable: boolean;
  readonly details?: unknown;
}

export interface UsageRecord {
  readonly prompt_tokens: number;
  readonly completion_tokens: number;
  readonly total_tokens: number;
  readonly usage_source: UsageSource;
  readonly reasoning_tokens?: number | null;
  readonly cached_prompt_tokens?: number | null;
  readonly cost?: number | null;
  readonly currency?: string;
}

export interface ToolContract {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly input_schema: Record<string, unknown>;
  readonly permission: string;
  readonly timeout_ms: number;
  readonly output_schema_ref?: string | null;
  readonly deterministic?: boolean;
}

export interface CriterionResult {
  readonly criterion_id: string;
  readonly policy: CriterionPolicy;
  readonly status: CriterionStatus;
  readonly evaluator: string;
  readonly sample_count: number;
  readonly confidence: UsageSource;
  readonly value?: number | boolean | string | null;
  readonly threshold?: number | boolean | string | null;
  readonly evidence_refs?: readonly string[];
}

export interface ArenaEvent {
  readonly event_id: string;
  readonly experiment_id: string;
  readonly phase: string;
  readonly seq: number;
  readonly timestamp: string;
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly run_id?: string | null;
  readonly candidate_id?: string | null;
}

export interface RunSpec {
  readonly run_id: string;
  readonly candidate_id: string;
  readonly experiment_id: string;
  readonly input_ref: string;
  readonly repetition: number;
  readonly gateway_base_url: string;
  readonly tool_broker_url: string;
  readonly max_tokens: number;
  readonly max_calls: number;
  readonly watchdog_seconds: number;
  readonly seed?: number | null;
  readonly order_index?: number;
  readonly allowed_tools?: readonly string[];
}

export interface FrameworkManifest {
  readonly id: string;
  readonly upstream: string;
  readonly runtime: 'python' | 'typescript';
  readonly package: string;
  readonly release_version: string;
  readonly worker_protocol: 1;
  readonly capabilities: Record<string, CapabilityStatus>;
  readonly status: RuntimeStatus;
  readonly image_digest?: string;
  readonly lockfile_sha256?: string;
  readonly docs_revision?: string;
}
