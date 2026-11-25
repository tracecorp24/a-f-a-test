import { useCallback, useEffect, useRef, useState } from "react";
import {
  api,
  ApiError,
  isActive,
  lastExperimentId,
  rememberExperiment,
  type ArenaEvent,
  type Experiment,
  type ExperimentSummary,
} from "./client";

/** Resolve which experiment to show: explicit id > last used > most recent on the server. */
export function useExperimentList() {
  const [list, setList] = useState<ExperimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setList(await api<ExperimentSummary[]>("/v1/experiments"));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deney listesi alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { list, loading, error, refresh };
}

export function resolveExperimentId(explicit: string | null | undefined, list: ExperimentSummary[]): string | null {
  if (explicit) return explicit;
  const remembered = lastExperimentId();
  if (remembered && list.some((e) => e.id === remembered)) return remembered;
  return list[0]?.id ?? null;
}

/** Poll one experiment (and its event stream) while it is active. */
export function useExperiment(experimentId: string | null) {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [events, setEvents] = useState<ArenaEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(experimentId));
  const lastSeq = useRef(0);
  const currentId = useRef<string | null>(null);

  const load = useCallback(async () => {
    const id = currentId.current;
    if (!id) return;
    try {
      const detail = await api<Experiment>(`/v1/experiments/${id}`);
      const feed = await api<{ events: ArenaEvent[]; last_seq: number }>(
        `/v1/experiments/${id}/events?after=${lastSeq.current}`,
      );
      if (currentId.current !== id) return; // switched while loading
      if (feed.last_seq < lastSeq.current) {
        lastSeq.current = 0; // experiment was re-run: event log restarted
        setEvents([]);
      }
      if (feed.events.length) {
        lastSeq.current = feed.last_seq;
        setEvents((prev) => [...prev, ...feed.events].slice(-500));
      }
      setExperiment(detail);
      setError("");
    } catch (e) {
      if (currentId.current !== id) return;
      setError(e instanceof ApiError ? e.message : "Deney verisi alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    currentId.current = experimentId;
    lastSeq.current = 0;
    setEvents([]);
    setExperiment(null);
    setError("");
    setLoading(Boolean(experimentId));
    if (experimentId) {
      rememberExperiment(experimentId);
      void load();
    }
  }, [experimentId, load]);

  const active = isActive(experiment?.status) || experiment?.status === "built";
  useEffect(() => {
    if (!experimentId || !active) return;
    const id = setInterval(() => void load(), 700);
    return () => clearInterval(id);
  }, [experimentId, active, load]);

  return { experiment, events, error, loading, reload: load };
}
