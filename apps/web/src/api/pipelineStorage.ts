/** Pipeline wizard persistence: survives page refreshes, tab closes and browser restarts. */

import type { TaskFlow } from "../components/taskFlow";
import type { TaskQuestion } from "../components/TaskQuestionnaire";

const STORAGE_KEY = "arena.pipeline.v1";
const HISTORY_KEY = "arena.pipeline.history.v1";
const HISTORY_LIMIT = 10;

export interface PipelineSnapshot {
  step: string;
  objective: string;
  flow: TaskFlow;
  scopeQuestions: TaskQuestion[];
  clarification: string[][];
  benchmarkQuestions: TaskQuestion[];
  benchmark: string[][];
  scopeInstruction: string;
  benchmarkInstruction: string;
  selectedFw: string;
  demoLoaded: boolean;
  scopeContext: string;
  benchmarkContext: string;
  builtInNotice: boolean;
}

export interface HistoryEntry {
  ts: number;
  label: string;
  snapshot: PipelineSnapshot;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null; // corrupted or unavailable storage: start fresh, never crash the page
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota/private mode: persistence is best-effort, the UI keeps working in memory
  }
}

export function loadPipelineSnapshot(): PipelineSnapshot | null {
  const snap = readJson<PipelineSnapshot>(STORAGE_KEY);
  if (!snap || typeof snap !== "object" || typeof snap.objective !== "string" || !Array.isArray(snap.flow?.blocks)) {
    return null;
  }
  return snap;
}

export function savePipelineSnapshot(snapshot: PipelineSnapshot): void {
  writeJson(STORAGE_KEY, snapshot);
}

export function clearPipelineSnapshot(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadHistory(): HistoryEntry[] {
  const entries = readJson<HistoryEntry[]>(HISTORY_KEY);
  return Array.isArray(entries) ? entries.filter((entry) => entry?.snapshot && typeof entry.ts === "number") : [];
}

export function pushHistory(snapshot: PipelineSnapshot, label: string): void {
  const entries = loadHistory().filter((entry) => entry.label !== label);
  entries.unshift({ ts: Date.now(), label, snapshot });
  writeJson(HISTORY_KEY, entries.slice(0, HISTORY_LIMIT));
}
