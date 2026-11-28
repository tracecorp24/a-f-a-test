import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { THEME } from "../data/mockData";
import {
  api,
  ApiError,
  frameworkName,
  isActive,
  post,
  STATUS_LABEL,
  type Candidate,
} from "../api/client";
import { resolveExperimentId, useExperiment, useExperimentList } from "../api/useExperiment";
import { ExperimentPicker, NoExperiment } from "../components/ExperimentPicker";
import { KVRow, Modal, PageHeader, SvgNode } from "../components/UI";
import { SuccessTestFlow, type BenchmarkPlan, type SuccessCriteria } from "../components/SuccessTestFlow";
import { useI18n } from "../i18n";

function progressOf(c: Candidate): number {
  if (c.status === "completed" || c.status === "failed") return 100;
  const { repetitions_done: done, repetitions_total: total } = c.progress;
  return total ? Math.round((done / total) * 100) : 0;
}

interface SpecTask {
  objective?: string;
  successCriteria?: SuccessCriteria;
  benchmarkPlan?: BenchmarkPlan;
}

export function ExecutionArenaPage() {
  const { t, locale } = useI18n();
  const routed = (useLocation().state as { experimentId?: string } | null)?.experimentId;
  const { list, loading: listLoading, error: listError, refresh } = useExperimentList();
  const [chosen, setChosen] = useState<string | null>(null);
  const expId = chosen ?? resolveExperimentId(routed, list);
  const { experiment, events, error, reload } = useExperiment(expId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [task, setTask] = useState<SpecTask | null>(null);

  const fmtDuration = (ms?: number) => (ms === undefined ? "—" : ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} ${t("sn")}`);

  const active = isActive(experiment?.status);
  useEffect(() => {
    // Detaylı log modalı açıkken 500ms'lik yenileme tikini duraklat: ağır yeniden çizim donma hissi yaratır.
    if (!active || logOpen) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [active, logOpen]);

  const specId = experiment?.spec_id;
  useEffect(() => {
    setTask(null);
    if (!specId) return;
    let alive = true;
    api<{ task_data: SpecTask }>(`/v1/specs/${specId}`)
      .then((spec) => alive && setTask(spec.task_data))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [specId]);

  const candidates = experiment?.candidate_details ?? [];
  const selected = candidates.find((c) => c.id === selectedId) ?? candidates[0];
  const telemetry = selected?.telemetry ?? { agents: [], links: [] };

  useEffect(() => {
    setSelectedAgent(null);
  }, [selected?.id]);

  const elapsedMs = useMemo(() => {
    if (!experiment?.started_at) return 0;
    const end = experiment.finished_at ? Date.parse(experiment.finished_at) : now;
    return Math.max(0, end - Date.parse(experiment.started_at));
  }, [experiment?.started_at, experiment?.finished_at, now]);

  if (!expId) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader eyebrow={t("AŞAMA 3 · ÇALIŞTIRMA ARENASI VE TELEMETRİ")} title={t("Çalıştırma Arenası")} description={t("Framework çalışmalarını ve ajan iletişim telemetrisini canlı izleyin.")} />
      <NoExperiment loading={listLoading} error={listError} />
    </div>
  );

  const status = experiment?.status;
  const completedCount = candidates.filter((c) => c.status === "completed" || c.status === "failed").length;
  const totalTokens = candidates.reduce((sum, c) => sum + (c.usage?.total_tokens ?? 0), 0);
  const totalMsgs = telemetry.links.reduce((s, l) => s + l.messages, 0);
  const totalHandoffs = telemetry.links.reduce((s, l) => s + l.handoffs, 0);
  const totalTokComm = telemetry.links.reduce((s, l) => s + l.tokens, 0);
  const sentLinks = telemetry.links.filter((l) => l.from === selectedAgent);
  const receivedLinks = telemetry.links.filter((l) => l.to === selectedAgent);
  const filteredEvents = events
    .filter((e) => e.framework_id === null || e.framework_id === selected?.framework_id);
  const shownEvents = (showAllEvents ? filteredEvents : filteredEvents.slice(-12)).slice().reverse();

  async function control(action: "pause" | "resume" | "cancel" | "run") {
    if (!expId || busy) return;
    setBusy(true);
    setActionError("");
    try {
      await post(`/v1/experiments/${expId}/${action}`);
      await reload();
      void refresh();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : t("İşlem tamamlanamadı."));
    } finally {
      setBusy(false);
    }
  }

  const nodeStatus = (c: Candidate | undefined): "complete" | "running" | "queued" =>
    c?.status === "completed" || c?.status === "failed" ? "complete" : c?.status === "running" ? "running" : "queued";

  const flowAgents = telemetry.agents.slice(0, 6);
  const gap = 28;
  const nodeW = flowAgents.length ? Math.min(150, (600 - gap * (flowAgents.length - 1)) / flowAgents.length) : 150;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        eyebrow={t("AŞAMA 3 · ÇALIŞTIRMA ARENASI VE TELEMETRİ")}
        title={t("Çalıştırma Arenası")}
        description={t("Her framework'ün yerel işçisi API üzerinden çalıştırılır. İlerleme, usage ledger'dan alınan kesin token kullanımı ve ajan telemetrisi gerçek çalıştırma olaylarından üretilir.")}
        right={
          <>
            <ExperimentPicker list={list} value={expId} onChange={setChosen} />
            <div className="arena-status-bar">
              <span style={{ color: status === "failed" ? THEME.red : THEME.green, fontWeight: 600 }}>
                {status ? t(STATUS_LABEL[status]) : "…"}
              </span>
              <span style={{ color: THEME.line }}>|</span>
              <span style={{ color: THEME.green, fontWeight: 600 }}>{completedCount} / {candidates.length} {t("Tamamlandı")}</span>
              <span style={{ color: THEME.line }}>|</span>
              <span>{t("Toplam:")} <strong className="arena-mono" style={{ color: THEME.text }}>{(totalTokens / 1000).toFixed(1)}K</strong></span>
              <span style={{ color: THEME.line }}>|</span>
              <span className="arena-mono" style={{ color: THEME.amber }}>{(elapsedMs / 1000).toFixed(1)} {t("sn")}</span>
            </div>
            {status === "running" && <button disabled={busy} onClick={() => void control("pause")} className="arena-btn arena-btn-primary">{t("❚❚ Duraklat")}</button>}
            {status === "paused" && <button disabled={busy} onClick={() => void control("resume")} className="arena-btn arena-btn-primary">{t("▶ Sürdür")}</button>}
            {active && <button disabled={busy} onClick={() => void control("cancel")} className="arena-btn">{t("■ İptal Et")}</button>}
            {(status === "built" || status === "completed" || status === "cancelled" || status === "failed") && (
              <button disabled={busy} onClick={() => void control("run")} className="arena-btn arena-btn-primary">
                {status === "built" ? t("▶ Çalıştır") : t("↻ Yeniden Çalıştır")}
              </button>
            )}
          </>
        }
      />

      {(error || actionError) && <p role="alert" style={{ color: THEME.red }}>{actionError || error}</p>}
      {experiment?.error && <p role="alert" style={{ color: THEME.red }}>{t("Deney hatası: ")}{experiment.error}</p>}
      {experiment && !experiment.fixture?.integrity_verified && experiment.fixture && (
        <p role="alert" style={{ color: THEME.red }}>{t("Benchmark fixture bütünlük doğrulaması başarısız.")}</p>
      )}

      <section className="arena-card arena-card-pad" aria-labelledby="run-success-criteria">
        <h2 className="arena-card-title" id="run-success-criteria">{t("Görev ve Başarı Kriterleri")}</h2>
        <p>{task?.objective ?? experiment?.objective}</p>
        <p style={{ color: THEME.muted, fontSize: 12 }}>
          {t("Veri seti: ")}{experiment?.fixture?.benchmark_id ?? "doc-review"}{t(" (etiketli çelişki: ")}{experiment?.fixture?.labeled_conflicts ?? "—"}{t(") · ")}
          {t("Kabul eşiği: F1 ≥ ")}{experiment ? experiment.threshold.toFixed(2) : "—"}{t(" · Tekrar: ")}{experiment?.repetitions ?? "—"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8, fontSize: 11.5 }}>
          <span style={{ color: THEME.muted }}>{t("Görev/Deney ID:")} <code className="arena-mono" style={{ color: THEME.cyan }}>{experiment?.id ?? "—"}</code></span>
          <span style={{ color: THEME.muted }}>{t("Şartname ID:")} <code className="arena-mono" style={{ color: THEME.cyan }}>{experiment?.spec_id ?? "—"}</code></span>
          <span style={{ color: THEME.muted }}>{t("Model:")} <code className="arena-mono">{experiment?.model_snapshot ?? "—"}</code></span>
        </div>
        {task?.successCriteria?.metric ? <SuccessTestFlow criteria={task.successCriteria} benchmark={task.benchmarkPlan} /> : null}
      </section>

      <div className="arena-framework-detail-grid">
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">{t("Framework'ler")}</h2>
            <span className="arena-mono" style={{ fontSize: 10.5, color: THEME.muted }}>{completedCount}/{candidates.length}</span>
          </div>
          <div style={{ padding: "6px 8px" }}>
            {candidates.map((c) => {
              const isSel = c.id === selected?.id;
              const pct = progressOf(c);
              const isDone = c.status === "completed";
              const failed = c.status === "failed" || c.status === "cancelled";
              return (
                <button
                  key={c.id}
                  aria-pressed={isSel}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    display: "grid", width: "100%", gridTemplateColumns: "1fr auto", rowGap: 3, textAlign: "left", margin: "3px 0", padding: "9px 11px",
                    background: isSel ? "var(--bg-active)" : "transparent", border: `1px solid ${isSel ? "var(--border-accent)" : "transparent"}`,
                    borderLeft: isSel ? `3px solid ${THEME.cyan}` : "3px solid transparent", borderRadius: 8, cursor: "pointer", color: THEME.text,
                  }}
                >
                  <b style={{ fontSize: 12.5, color: isSel ? THEME.cyan : THEME.text }}>{frameworkName(c.framework_id)}</b>
                  <span className="arena-mono" style={{ fontSize: 11, fontWeight: 600, color: failed ? THEME.red : isDone ? THEME.green : THEME.cyan }}>
                    {failed ? "✗" : isDone ? "✓" : c.status === "queued" ? t("sırada") : `${pct}%`}
                  </span>
                  <small className="arena-mono" style={{ color: THEME.muted, fontSize: 10.5 }}>
                    {c.id ? `#${c.id.slice(-8)}` : "—"} · {c.usage ? `${c.usage.total_tokens.toLocaleString(locale)} tok` : "—"}
                  </small>
                  <small className="arena-mono" style={{ fontSize: 10.5, textAlign: "right", fontWeight: 700, color: c.evaluation ? (c.evaluation.eligible ? THEME.green : THEME.red) : THEME.muted }}>
                    {c.evaluation ? `${t("TEST")} ${c.evaluation.eligible ? "GEÇTİ" : "KALDI"} · F1 ${c.evaluation.conflict_f1.toFixed(2)}` : fmtDuration(c.duration_ms)}
                  </small>
                  <div style={{ gridColumn: "1/-1", height: 3, background: THEME.lineSubtle, borderRadius: 999, overflow: "hidden", marginTop: 2 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: failed ? THEME.red : isDone ? THEME.green : THEME.cyan, transition: "width .3s ease" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selected && (
          <div className="arena-selected-flows">
            <section className="arena-card">
              <div className="arena-card-header">
                <h2 className="arena-card-title">
                  {frameworkName(selected.framework_id)}
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: THEME.muted, marginLeft: 8 }}>{t("· Yerel Akış")}</span>
                </h2>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: selected.status === "completed" ? THEME.green : selected.status === "failed" ? THEME.red : THEME.cyan }}>
                  ● {selected.status === "completed" ? t("Tamamlandı") : selected.status === "failed" ? t("Başarısız") : selected.status === "cancelled" ? t("İptal") : selected.status === "running" ? t("İşleniyor") : t("Sırada")}
                </span>
              </div>
              <div style={{ backgroundColor: THEME.panelAlt, backgroundImage: "radial-gradient(var(--dot-grid) 0.8px, transparent 0.8px)", backgroundSize: "18px 18px", padding: 14 }}>
                {flowAgents.length ? (
                  <svg viewBox="0 0 620 120" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label={`${frameworkName(selected.framework_id)} ${t("çalışma akışı")}`}>
                    <defs>
                      <marker id="arrowA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M0 0 L10 5 L0 10 z" fill="var(--text-muted)" />
                      </marker>
                    </defs>
                    {flowAgents.map((agent, i) => {
                      const x = 10 + i * (nodeW + gap);
                      return (
                        <g key={agent}>
                          {i > 0 && <path d={`M${x - gap} 60 H${x}`} fill="none" stroke={THEME.cyan} strokeWidth="2" markerEnd="url(#arrowA)" />}
                          <SvgNode x={x} y={31} w={nodeW} h={58} icon="◇" title={agent.length > 16 ? `${agent.slice(0, 15)}…` : agent} sub={t("Ajan / Düğüm")} status={nodeStatus(selected)} />
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <p style={{ color: THEME.muted, margin: 0 }}>{selected.status === "completed" ? t("Bu framework adlandırılmış ajan/düğüm olayı üretmedi.") : t("Bu çalışma için henüz akış olayı yok.")}</p>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: `1px solid ${THEME.line}` }}>
                {[
                  { label: t("İlerleme"), value: `${progressOf(selected)}% (${selected.progress.repetitions_done}/${selected.progress.repetitions_total})`, color: selected.status === "completed" ? THEME.green : THEME.cyan },
                  { label: t("Token (ledger)"), value: selected.usage ? selected.usage.total_tokens.toLocaleString(locale) : "—", color: THEME.text },
                  { label: t("Süre (ort.)"), value: fmtDuration(selected.duration_ms), color: THEME.text },
                  { label: "F1 / Hard Gate", value: selected.evaluation ? `${selected.evaluation.conflict_f1.toFixed(2)} ${selected.evaluation.eligible ? "✓" : "✗"}` : "—", color: selected.evaluation ? (selected.evaluation.eligible ? THEME.green : THEME.red) : THEME.muted },
                ].map((m, i) => (
                  <div key={m.label} style={{ padding: "12px 16px", borderRight: i < 3 ? `1px solid ${THEME.line}` : "none", textAlign: "center" }}>
                    <div style={{ fontSize: 10.5, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{m.label}</div>
                    <div className="arena-mono" style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              {selected.error && <p role="alert" style={{ color: THEME.red, padding: "0 16px" }}>{t("Hata: ")}{selected.error}</p>}
            </section>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: THEME.cyan, textTransform: "uppercase", letterSpacing: "0.09em" }}>{t("⌁ Telemetri")}</span>
              <span aria-live="polite" style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>{frameworkName(selected.framework_id)} · {t("Ajan İletişim Analizi")}</span>
              <div style={{ display: "flex", gap: 10, marginLeft: "auto", fontSize: 12 }}>
                <span className="arena-status-bar" style={{ padding: "4px 12px" }}>
                  <span><strong style={{ color: THEME.text }}>{totalMsgs}</strong> {t("Mesaj")}</span>
                  <span style={{ color: THEME.line }}>|</span>
                  <span style={{ color: THEME.purple }}>{totalHandoffs} Handoff</span>
                  <span style={{ color: THEME.line }}>|</span>
                  <span className="arena-mono" style={{ color: THEME.green }}>{totalTokComm.toLocaleString(locale)} tok</span>
                </span>
              </div>
            </div>

            <section className="arena-card">
              <div className="arena-card-header">
                <h2 className="arena-card-title">{t("Mesaj Akışı")}</h2>
                <span style={{ fontSize: 11.5, color: THEME.muted }}>{t("Çizgi kalınlığı = mesaj hacmi")}</span>
              </div>
              {telemetry.links.length ? (
                <>
                  <div style={{ backgroundColor: THEME.panelAlt, backgroundImage: "radial-gradient(var(--dot-grid) 0.8px, transparent 0.8px)", backgroundSize: "18px 18px", padding: 12, overflowX: "auto" }}>
                    <svg viewBox={`0 0 620 ${126 + telemetry.links.length * 35}`} style={{ display: "block", width: "100%", minWidth: 480, height: "auto" }} role="img" aria-label={`${frameworkName(selected.framework_id)} ${t("ajan iletişimi. Ayrıntılar aşağıdaki tabloda.")}`}>
                      <defs>
                        <marker id="arrowT" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                          <path d="M0 0 L10 5 L0 10 z" fill="var(--text-muted)" />
                        </marker>
                      </defs>
                      {telemetry.links.map((lk, i) => {
                        const fromIdx = telemetry.agents.indexOf(lk.from);
                        const toIdx = telemetry.agents.indexOf(lk.to);
                        const spacing = 620 / telemetry.agents.length;
                        const x1 = spacing * (fromIdx + 0.5) - 20 + i * 10;
                        const x2 = spacing * (toIdx + 0.5) + 20 - i * 10;
                        const lane = 110 + i * 35;
                        const sw = Math.max(1.2, Math.min(5, lk.messages * 0.7));
                        return (
                          <g key={i}>
                            <path d={`M${x1} 76 V${lane} H${x2} V80`} fill="none" stroke={THEME.cyan} strokeWidth={sw} strokeOpacity={0.7} markerEnd="url(#arrowT)" />
                            <rect x={(x1 + x2) / 2 - 12} y={lane - 11} width="24" height="22" rx="5" fill="var(--bg-active)" />
                            <text x={(x1 + x2) / 2} y={lane + 4} textAnchor="middle" fill="var(--accent-cyan)" fontSize="12" fontWeight="700">{i + 1}</text>
                            <title>{`${lk.from} → ${lk.to} · ${lk.messages} ${t("mesaj")} · ~${lk.tokens} token`}</title>
                          </g>
                        );
                      })}
                      {telemetry.agents.map((name, i) => {
                        const cx = (620 / telemetry.agents.length) * (i + 0.5);
                        return (
                          <g key={name}>
                            <rect x={cx - 66} y={22} width={132} height={54} rx={8} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={1.2} />
                            <text x={cx} y={44} textAnchor="middle" fill={THEME.cyan} fontSize={16}>◇</text>
                            <text x={cx} y={64} textAnchor="middle" fill="var(--text-primary)" fontSize={12} fontWeight={600}>{name.length > 18 ? `${name.slice(0, 17)}…` : name}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="arena-table">
                      <thead><tr><th>{t("No")}</th><th>{t("Kaynak")}</th><th>{t("Hedef")}</th><th>{t("Mesaj")}</th><th>Token</th><th>Handoff</th></tr></thead>
                      <tbody>
                        {telemetry.links.map((lk, i) => (
                          <tr key={i}>
                            <td className="arena-mono">{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>{lk.from}</td>
                            <td style={{ color: THEME.muted }}>{lk.to}</td>
                            <td className="arena-mono" style={{ color: THEME.cyan, fontWeight: 700 }}>{lk.messages}</td>
                            <td className="arena-mono">{lk.tokens}</td>
                            <td className="arena-mono" style={{ color: THEME.purple, fontWeight: 600 }}>{lk.handoffs}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p style={{ padding: 16, color: THEME.muted }}>
                  {selected.status === "completed" ? t("Bu framework ajanlar arası mesaj üretmedi (tek ajan/düğüm).") : t("Telemetri çalışma tamamlandığında oluşur.")}
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      <div className="arena-telemetry-summary">
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">{t("Canlı Olaylar")}</h2>
            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <button type="button" className="arena-btn" onClick={() => setShowAllEvents((v) => !v)}>
                {showAllEvents ? t("Son 12 olay") : `${t("Tümünü göster")} (${filteredEvents.length})`}
              </button>
              <button type="button" className="arena-btn" disabled={!events.length} onClick={() => setLogOpen(true)}>{t("⤢ Detaylı Log")}</button>
              <span className="arena-mono" style={{ fontSize: 10.5, color: active ? THEME.green : THEME.cyan }}>{active ? t("● CANLI") : t("KAYIT")}</span>
            </span>
          </div>
          <div style={{ padding: 14, maxHeight: showAllEvents ? 480 : undefined, overflowY: showAllEvents ? "auto" : undefined }}>
            {shownEvents.length === 0 && <p style={{ color: THEME.muted, margin: 0 }}>{t("Henüz olay yok.")}</p>}
            {shownEvents.map((evt, i) => (
              <div key={evt.seq} style={{ padding: "10px 0", borderBottom: i < shownEvents.length - 1 ? `1px solid ${THEME.lineSubtle}` : "none", display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: THEME.cyan, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ color: THEME.text, fontSize: 12.5 }}>{evt.type}</b>
                  <div style={{ color: THEME.muted, fontSize: 11.5, marginTop: 2, lineHeight: 1.4, overflowWrap: "anywhere" }}>
                    {evt.framework_id ? `${frameworkName(evt.framework_id)} · ` : ""}{Object.keys(evt.payload).length ? JSON.stringify(evt.payload) : "—"}
                  </div>
                </div>
                <span className="arena-mono" style={{ color: THEME.subtle, fontSize: 10.5, flexShrink: 0 }}>{new Date(evt.ts).toLocaleTimeString(locale)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="arena-card">
          <div className="arena-card-header"><h2 className="arena-card-title">{t("Ağ Özeti")}</h2></div>
          <div style={{ padding: 16 }}>
            <KVRow label={t("Toplam Mesaj")} value={totalMsgs} />
            <KVRow label={t("Toplam Handoff")} value={totalHandoffs} color={THEME.purple} />
            <KVRow label={t("İletişim Tokenı")} value={totalTokComm.toLocaleString(locale)} color={THEME.green} />
            {selected?.usage?.prompt_tokens != null && (
              <KVRow
                label={t("Prompt / Yanıt (ledger)")}
                value={`${selected.usage.prompt_tokens.toLocaleString(locale)} / ${(selected.usage.completion_tokens ?? 0).toLocaleString(locale)}`}
                color={THEME.cyan}
              />
            )}
            <KVRow label={t("Aktif Ajan Sayısı")} value={telemetry.agents.length} />
            <KVRow label={t("Ortalama Mesaj Boyutu")} value={totalMsgs ? `${Math.round(totalTokComm / totalMsgs)} tok` : "—"} />
            <KVRow label="Model" value={experiment?.model_snapshot ?? "—"} />
            {selected?.usage && <p style={{ fontSize: 11, color: THEME.subtle }}>{selected.usage.note}</p>}

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{t("Ajanlar")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {telemetry.agents.map((name) => {
                  const sent = telemetry.links.filter((l) => l.from === name).reduce((s, l) => s + l.messages, 0);
                  const recv = telemetry.links.filter((l) => l.to === name).reduce((s, l) => s + l.messages, 0);
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={selectedAgent === name}
                      onClick={() => setSelectedAgent(selectedAgent === name ? null : name)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "5px 8px", backgroundColor: THEME.panelAlt, borderRadius: 6, border: `1px solid ${selectedAgent === name ? THEME.cyan : THEME.lineSubtle}`, color: THEME.text, cursor: "pointer" }}
                    >
                      <span style={{ color: THEME.cyan, marginRight: 6 }}>◇</span>
                      <span style={{ flex: 1, fontWeight: 600, textAlign: "left" }}>{name}</span>
                      <span className="arena-mono" style={{ fontSize: 10.5, color: THEME.muted }}>↑{sent} ↓{recv}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedAgent && (
              <div style={{ marginTop: 14 }}>
                <h3 className="arena-card-title">{selectedAgent}</h3>
                <KVRow label={t("Gönderilen Mesaj")} value={sentLinks.reduce((s, l) => s + l.messages, 0)} />
                <KVRow label={t("Alınan Mesaj")} value={receivedLinks.reduce((s, l) => s + l.messages, 0)} />
                <KVRow label={t("Giden Token")} value={sentLinks.reduce((s, l) => s + l.tokens, 0)} />
                <KVRow label={t("Gelen Token")} value={receivedLinks.reduce((s, l) => s + l.tokens, 0)} />
                <KVRow label={t("Aktarılan Handoff")} value={sentLinks.reduce((s, l) => s + l.handoffs, 0)} />
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal wide title={`${t("Detaylı Log")} — ${expId}`} onClose={() => setLogOpen(false)}>
        <p style={{ color: THEME.muted, fontSize: 12, marginTop: 0 }}>
          {t("Deney ID:")} <code className="arena-mono">{expId}</code>
          {experiment?.spec_id && <> · {t("Şartname:")} <code className="arena-mono">{experiment.spec_id}</code></>}
          {selected && <> · {t("Seçili test:")} <code className="arena-mono">#{selected.id.slice(-8)}</code> ({frameworkName(selected.framework_id)})</>}
          {" "}· {events.length} {t("olay")}
        </p>
        <div style={{ maxHeight: "60vh", overflow: "auto", border: `1px solid ${THEME.lineSubtle}`, borderRadius: 8, padding: 10 }}>
          {events.length === 0 && <p style={{ color: THEME.muted, margin: 0 }}>{t("Henüz olay yok.")}</p>}
          {events.slice().reverse().map((evt) => (
            <div key={evt.seq} style={{ padding: "6px 0", borderBottom: `1px solid ${THEME.lineSubtle}`, fontSize: 11.5 }}>
              <span className="arena-mono" style={{ color: THEME.subtle, marginRight: 8 }}>{new Date(evt.ts).toLocaleTimeString(locale)}</span>
              <span className="arena-mono" style={{ color: THEME.cyan, fontWeight: 700 }}>#{evt.seq}</span>
              <span style={{ color: evt.type.includes("error") || evt.type.includes("fail") ? THEME.red : THEME.text, fontWeight: 600, margin: "0 8px" }}>{evt.type}</span>
              <span style={{ color: THEME.muted }}>{evt.framework_id ? frameworkName(evt.framework_id) : "—"}</span>
              {Object.keys(evt.payload).length > 0 && (
                <pre className="arena-mono" style={{ margin: "4px 0 0 14px", fontSize: 10.5, color: THEME.muted, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{JSON.stringify(evt.payload, null, 1)}</pre>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
