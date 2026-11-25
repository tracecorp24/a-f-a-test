// Typed client for the Arena control-plane API (proxied through /v1).

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const { message, detail } = body as { message?: unknown; detail?: unknown };
    if (typeof message === "string" && message) return message;
    if (typeof detail === "string" && detail) return detail;
    if (Array.isArray(detail) && detail.length) {
      return detail.map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : String(d))).join("; ");
    }
  }
  return fallback;
}

export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let response: Response;
  try {
    response = await fetch(path, {
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError("Arena API’sine bağlanılamadı. Sunucunun (8080) çalıştığından emin olun.", 0);
  }
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!response.ok) throw new ApiError(messageFrom(body, `İstek başarısız (${response.status}).`), response.status);
  return body as T;
}

export const post = <T>(path: string, json?: unknown) => api<T>(path, { method: "POST", json: json ?? {} });

// ---- Domain types (mirror apps/api) ----

export type ExperimentStatus = "created" | "built" | "running" | "paused" | "completed" | "cancelled" | "failed";
export type CandidateStatus = "ready" | "queued" | "running" | "completed" | "failed" | "cancelled";

export interface Metrics {
  quality: number;
  speed: number;
  token: number;
  reliability: number;
}

export interface Evaluation {
  schema_pass: boolean;
  conflict_f1: number;
  precision: number;
  recall: number;
  predicted_conflicts: number | null;
  labeled_conflicts: number;
  eligible: boolean;
  threshold: number;
}

export interface TelemetryLink {
  from: string;
  to: string;
  messages: number;
  tokens: number;
  handoffs: number;
}

export interface Candidate {
  id: string;
  experiment_id: string;
  framework_id: string;
  status: CandidateStatus;
  metrics: Metrics | null;
  evaluation: Evaluation | null;
  usage: { total_tokens: number; source: string; note: string } | null;
  duration_ms?: number;
  progress: { repetitions_done: number; repetitions_total: number };
  telemetry: { agents: string[]; links: TelemetryLink[] };
  event_count: number;
  error: string | null;
}

export interface Fixture {
  benchmark_id: string;
  integrity_verified: boolean;
  labeled_conflicts: number;
}

export interface ExperimentSummary {
  id: string;
  spec_id: string;
  status: ExperimentStatus;
  objective: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  frameworks: string[];
  completed_count: number;
  total_count: number;
  model_snapshot: string;
}

export interface Experiment {
  id: string;
  spec_id: string;
  status: ExperimentStatus;
  objective: string;
  model_snapshot: string;
  repetitions: number;
  threshold: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error: string | null;
  fixture?: Fixture;
  event_count: number;
  candidate_details: Candidate[];
}

export interface ArenaEvent {
  seq: number;
  ts: string;
  framework_id: string | null;
  type: string;
  payload: Record<string, unknown>;
}

export interface RankedCandidate {
  candidate_id: string;
  framework_id: string;
  total_score: number;
  breakdown: Metrics;
}

export interface Ranking {
  status: "RECOMMENDED" | "NO_ELIGIBLE_CANDIDATES";
  message?: string;
  winner: string | null;
  ranked: RankedCandidate[];
  ineligible: string[];
  below_quality: string[];
  min_quality: number;
}

export interface ExportRecord {
  id: string;
  candidate_id: string;
  experiment_id: string;
  framework_id: string;
  format: "zip" | "docker" | "poetry";
  filename: string;
  files: string[];
  size_bytes: number;
  sha256: string;
  secrets_found: number;
  created_at: string;
}

export interface RuntimeInfo {
  framework_id: string;
  manifest: string;
  source: string;
  dockerfile: string;
  version: string | null;
  manifest_errors: string[];
}

export interface Verification {
  framework_id: string;
  verification_status: "verified" | "failed";
  manifest_valid: boolean;
  manifest_errors: string[];
  smoke_test: { passed: boolean; error: string | null; events: number; duration_ms: number };
}

export interface SystemStatus {
  api: string;
  frameworks: number;
  fixture: Fixture;
  design_model_configured: boolean;
  experiments: number;
}

// ---- Framework naming (UI display name <-> backend id) ----

export const FRAMEWORK_IDS: Record<string, string> = {
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
};

const NAMES_BY_ID = Object.fromEntries(Object.entries(FRAMEWORK_IDS).map(([name, id]) => [id, name]));
export const frameworkName = (id: string) => NAMES_BY_ID[id] ?? id;

// ---- Last experiment memory ----

const LAST_KEY = "arena.lastExperimentId";
export const rememberExperiment = (id: string) => {
  try {
    localStorage.setItem(LAST_KEY, id);
  } catch {
    /* storage unavailable */
  }
};
export const lastExperimentId = (): string | null => {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
};

export const isActive = (status: ExperimentStatus | undefined) =>
  status === "running" || status === "paused";

export const STATUS_LABEL: Record<ExperimentStatus, string> = {
  created: "Oluşturuldu",
  built: "Hazır",
  running: "Çalışıyor",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
  cancelled: "İptal edildi",
  failed: "Başarısız",
};
