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
import { KVRow, PageHeader, SvgNode } from "../components/UI";
import { SuccessTestFlow, type BenchmarkPlan, type SuccessCriteria } from "../components/SuccessTestFlow";

const fmtDuration = (ms?: number) => (ms === undefined ? "—" : ms < 1000 ? `${ms.toFixed(1)} ms` : `${(ms / 1000).toFixed(2)} sn`);

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
  const routed = (useLocation().state as { experimentId?: string } | null)?.experimentId;
  const { list, loading: listLoading, error: listError, refresh } = useExperimentList();
  const [chosen, setChosen] = useState<string | null>(null);
  const expId = chosen ?? resolveExperimentId(routed, list);
  const { experiment, events, error, reload } = useExperiment(expId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [task, setTask] = useState<SpecTask | null>(null);

  const active = isActive(experiment?.status);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [active]);

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
      <PageHeader eyebrow="AŞAMA 3 · ÇALIŞTIRMA ARENASI VE TELEMETRİ" title="Çalıştırma Arenası" description="Framework çalışmalarını ve ajan iletişim telemetrisini canlı izleyin." />
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
  const shownEvents = events
    .filter((e) => e.framework_id === null || e.framework_id === selected?.framework_id)
    .slice(-12)
    .reverse();

  async function control(action: "pause" | "resume" | "cancel" | "run") {
    if (!expId || busy) return;
    setBusy(true);
    setActionError("");
    try {
      await post(`/v1/experiments/${expId}/${action}`);
      await reload();
      void refresh();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "İşlem tamamlanamadı.");
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
        eyebrow="AŞAMA 3 · ÇALIŞTIRMA ARENASI VE TELEMETRİ"
        title="Çalıştırma Arenası"
        description="Her framework'ün yerel işçisi API üzerinden çalıştırılır. İlerleme, token tahmini ve ajan telemetrisi gerçek çalıştırma olaylarından üretilir."
        right={
          <>
            <ExperimentPicker list={list} value={expId} onChange={setChosen} />
            <div className="arena-status-bar">
              <span style={{ color: status === "failed" ? THEME.red : THEME.green, fontWeight: 600 }}>
                {status ? STATUS_LABEL[status] : "…"}
              </span>
              <span style={{ color: THEME.line }}>|</span>
              <span style={{ color: THEME.green, fontWeight: 600 }}>{completedCount} / {candidates.length} Tamamlandı</span>
              <span style={{ color: THEME.line }}>|</span>
              <span>Toplam: <strong className="arena-mono" style={{ color: THEME.text }}>~{(totalTokens / 1000).toFixed(1)}K</strong></span>
              <span style={{ color: THEME.line }}>|</span>
              <span className="arena-mono" style={{ color: THEME.amber }}>{(elapsedMs / 1000).toFixed(1)} sn</span>
            </div>
            {status === "running" && <button disabled={busy} onClick={() => void control("pause")} className="arena-btn arena-btn-primary">❚❚ Duraklat</button>}
            {status === "paused" && <button disabled={busy} onClick={() => void control("resume")} className="arena-btn arena-btn-primary">▶ Sürdür</button>}
            {active && <button disabled={busy} onClick={() => void control("cancel")} className="arena-btn">■ İptal Et</button>}
            {(status === "built" || status === "completed" || status === "cancelled" || status === "failed") && (
              <button disabled={busy} onClick={() => void control("run")} className="arena-btn arena-btn-primary">
                {status === "built" ? "▶ Çalıştır" : "↻ Yeniden Çalıştır"}
              </button>
            )}
          </>
        }
      />

      {(error || actionError) && <p role="alert" style={{ color: THEME.red }}>{actionError || error}</p>}
      {experiment?.error && <p role="alert" style={{ color: THEME.red }}>Deney hatası: {experiment.error}</p>}
      {experiment && !experiment.fixture?.integrity_verified && experiment.fixture && (
        <p role="alert" style={{ color: THEME.red }}>Benchmark fixture bütünlük doğrulaması başarısız.</p>
      )}

      <section className="arena-card arena-card-pad" aria-labelledby="run-success-criteria">
        <h2 className="arena-card-title" id="run-success-criteria">Görev ve Başarı Kriterleri</h2>
        <p>{task?.objective ?? experiment?.objective}</p>
        <p style={{ color: THEME.muted, fontSize: 12 }}>
          Veri seti: {experiment?.fixture?.benchmark_id ?? "doc-review"} (etiketli çelişki: {experiment?.fixture?.labeled_conflicts ?? "—"}) ·
          Kabul eşiği: F1 ≥ {experiment ? experiment.threshold.toFixed(2) : "—"} · Tekrar: {experiment?.repetitions ?? "—"}
        </p>
        {task?.successCriteria?.metric ? <SuccessTestFlow criteria={task.successCriteria} benchmark={task.benchmarkPlan} /> : null}
      </section>

      <div className="arena-framework-detail-grid">
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">Framework'ler</h2>
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
                    background: isSel ? "#15283d" : "transparent", border: `1px solid ${isSel ? "#2c5270" : "transparent"}`,
                    borderLeft: isSel ? `3px solid ${THEME.cyan}` : "3px solid transparent", borderRadius: 8, cursor: "pointer", color: THEME.text,
                  }}
                >
                  <b style={{ fontSize: 12.5, color: isSel ? THEME.cyan : THEME.text }}>{frameworkName(c.framework_id)}</b>
                  <span className="arena-mono" style={{ fontSize: 11, fontWeight: 600, color: failed ? THEME.red : isDone ? THEME.green : THEME.cyan }}>
                    {failed ? "✗" : isDone ? "✓" : c.status === "queued" ? "sırada" : `${pct}%`}
                  </span>
                  <small className="arena-mono" style={{ color: THEME.muted, fontSize: 10.5 }}>
                    {c.usage ? `~${c.usage.total_tokens.toLocaleString("tr-TR")} tok` : "—"}
                  </small>
                  <small className="arena-mono" style={{ color: THEME.muted, fontSize: 10.5, textAlign: "right" }}>{fmtDuration(c.duration_ms)}</small>
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
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: THEME.muted, marginLeft: 8 }}>· Yerel Akış</span>
                </h2>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: selected.status === "completed" ? THEME.green : selected.status === "failed" ? THEME.red : THEME.cyan }}>
                  ● {selected.status === "completed" ? "Tamamlandı" : selected.status === "failed" ? "Başarısız" : selected.status === "cancelled" ? "İptal" : selected.status === "running" ? "İşleniyor" : "Sırada"}
                </span>
              </div>
              <div style={{ backgroundColor: THEME.panelAlt, backgroundImage: "radial-gradient(#243244 0.8px, transparent 0.8px)", backgroundSize: "18px 18px", padding: 14 }}>
                {flowAgents.length ? (
                  <svg viewBox="0 0 620 120" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label={`${frameworkName(selected.framework_id)} çalışma akışı`}>
                    <defs>
                      <marker id="arrowA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                      </marker>
                    </defs>
                    {flowAgents.map((agent, i) => {
                      const x = 10 + i * (nodeW + gap);
                      return (
                        <g key={agent}>
                          {i > 0 && <path d={`M${x - gap} 60 H${x}`} fill="none" stroke={THEME.cyan} strokeWidth="2" markerEnd="url(#arrowA)" />}
                          <SvgNode x={x} y={31} w={nodeW} h={58} icon="◇" title={agent.length > 16 ? `${agent.slice(0, 15)}…` : agent} sub="Ajan / Düğüm" status={nodeStatus(selected)} />
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <p style={{ color: THEME.muted, margin: 0 }}>{selected.status === "completed" ? "Bu framework adlandırılmış ajan/düğüm olayı üretmedi." : "Bu çalışma için henüz akış olayı yok."}</p>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: `1px solid ${THEME.line}` }}>
                {[
                  { label: "İlerleme", value: `${progressOf(selected)}% (${selected.progress.repetitions_done}/${selected.progress.repetitions_total})`, color: selected.status === "completed" ? THEME.green : THEME.cyan },
                  { label: "Token (tahmin)", value: selected.usage ? `~${selected.usage.total_tokens.toLocaleString("tr-TR")}` : "—", color: THEME.text },
                  { label: "Süre (ort.)", value: fmtDuration(selected.duration_ms), color: THEME.text },
                  { label: "F1 / Hard Gate", value: selected.evaluation ? `${selected.evaluation.conflict_f1.toFixed(2)} ${selected.evaluation.eligible ? "✓" : "✗"}` : "—", color: selected.evaluation ? (selected.evaluation.eligible ? THEME.green : THEME.red) : THEME.muted },
                ].map((m, i) => (
                  <div key={m.label} style={{ padding: "12px 16px", borderRight: i < 3 ? `1px solid ${THEME.line}` : "none", textAlign: "center" }}>
                    <div style={{ fontSize: 10.5, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{m.label}</div>
                    <div className="arena-mono" style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              {selected.error && <p role="alert" style={{ color: THEME.red, padding: "0 16px" }}>Hata: {selected.error}</p>}
            </section>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: THEME.cyan, textTransform: "uppercase", letterSpacing: "0.09em" }}>⌁ Telemetri</span>
              <span aria-live="polite" style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>{frameworkName(selected.framework_id)} · Ajan İletişim Analizi</span>
              <div style={{ display: "flex", gap: 10, marginLeft: "auto", fontSize: 12 }}>
                <span className="arena-status-bar" style={{ padding: "4px 12px" }}>
                  <span><strong style={{ color: THEME.text }}>{totalMsgs}</strong> Mesaj</span>
                  <span style={{ color: THEME.line }}>|</span>
                  <span style={{ color: THEME.purple }}>{totalHandoffs} Handoff</span>
                  <span style={{ color: THEME.line }}>|</span>
                  <span className="arena-mono" style={{ color: THEME.green }}>~{totalTokComm.toLocaleString("tr-TR")} tok</span>
                </span>
              </div>
            </div>

            <section className="arena-card">
              <div className="arena-card-header">
                <h2 className="arena-card-title">Mesaj Akışı</h2>
                <span style={{ fontSize: 11.5, color: THEME.muted }}>Çizgi kalınlığı = mesaj hacmi</span>
              </div>
              {telemetry.links.length ? (
                <>
                  <div style={{ backgroundColor: THEME.panelAlt, backgroundImage: "radial-gradient(#243244 0.8px, transparent 0.8px)", backgroundSize: "18px 18px", padding: 12, overflowX: "auto" }}>
                    <svg viewBox={`0 0 620 ${126 + telemetry.links.length * 35}`} style={{ display: "block", width: "100%", minWidth: 480, height: "auto" }} role="img" aria-label={`${frameworkName(selected.framework_id)} ajan iletişimi. Ayrıntılar aşağıdaki tabloda.`}>
                      <defs>
                        <marker id="arrowT" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                          <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
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
                            <rect x={(x1 + x2) / 2 - 12} y={lane - 11} width="24" height="22" rx="5" fill="#15283d" />
                            <text x={(x1 + x2) / 2} y={lane + 4} textAnchor="middle" fill="#bdeefa" fontSize="12" fontWeight="700">{i + 1}</text>
                            <title>{`${lk.from} → ${lk.to} · ${lk.messages} mesaj · ~${lk.tokens} token`}</title>
                          </g>
                        );
                      })}
                      {telemetry.agents.map((name, i) => {
                        const cx = (620 / telemetry.agents.length) * (i + 0.5);
                        return (
                          <g key={name}>
                            <rect x={cx - 66} y={22} width={132} height={54} rx={8} fill="#111824" stroke="#2b3b4e" strokeWidth={1.2} />
                            <text x={cx} y={44} textAnchor="middle" fill={THEME.cyan} fontSize={16}>◇</text>
                            <text x={cx} y={64} textAnchor="middle" fill="#f1f5f9" fontSize={12} fontWeight={600}>{name.length > 18 ? `${name.slice(0, 17)}…` : name}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="arena-table">
                      <thead><tr><th>No</th><th>Kaynak</th><th>Hedef</th><th>Mesaj</th><th>Token (tahmin)</th><th>Handoff</th></tr></thead>
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
                  {selected.status === "completed" ? "Bu framework ajanlar arası mesaj üretmedi (tek ajan/düğüm)." : "Telemetri çalışma tamamlandığında oluşur."}
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      <div className="arena-telemetry-summary">
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">Canlı Olaylar</h2>
            <span className="arena-mono" style={{ fontSize: 10.5, color: active ? THEME.green : THEME.cyan }}>{active ? "● CANLI" : "KAYIT"}</span>
          </div>
          <div style={{ padding: 14 }}>
            {shownEvents.length === 0 && <p style={{ color: THEME.muted, margin: 0 }}>Henüz olay yok.</p>}
            {shownEvents.map((evt, i) => (
              <div key={evt.seq} style={{ padding: "10px 0", borderBottom: i < shownEvents.length - 1 ? `1px solid ${THEME.lineSubtle}` : "none", display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: THEME.cyan, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ color: THEME.text, fontSize: 12.5 }}>{evt.type}</b>
                  <div style={{ color: THEME.muted, fontSize: 11.5, marginTop: 2, lineHeight: 1.4, overflowWrap: "anywhere" }}>
                    {evt.framework_id ? `${frameworkName(evt.framework_id)} · ` : ""}{Object.keys(evt.payload).length ? JSON.stringify(evt.payload) : "—"}
                  </div>
                </div>
                <span className="arena-mono" style={{ color: THEME.subtle, fontSize: 10.5, flexShrink: 0 }}>{new Date(evt.ts).toLocaleTimeString("tr-TR")}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="arena-card">
          <div className="arena-card-header"><h2 className="arena-card-title">Ağ Özeti</h2></div>
          <div style={{ padding: 16 }}>
            <KVRow label="Toplam Mesaj" value={totalMsgs} />
            <KVRow label="Toplam Handoff" value={totalHandoffs} color={THEME.purple} />
            <KVRow label="İletişim Tokenı (tahmin)" value={totalTokComm.toLocaleString("tr-TR")} color={THEME.green} />
            <KVRow label="Aktif Ajan Sayısı" value={telemetry.agents.length} />
            <KVRow label="Ortalama Mesaj Boyutu" value={totalMsgs ? `${Math.round(totalTokComm / totalMsgs)} tok` : "—"} />
            <KVRow label="Model" value={experiment?.model_snapshot ?? "—"} />
            {selected?.usage && <p style={{ fontSize: 11, color: THEME.subtle }}>{selected.usage.note}</p>}

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Ajanlar</div>
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
                <KVRow label="Gönderilen Mesaj" value={sentLinks.reduce((s, l) => s + l.messages, 0)} />
                <KVRow label="Alınan Mesaj" value={receivedLinks.reduce((s, l) => s + l.messages, 0)} />
                <KVRow label="Giden Token" value={sentLinks.reduce((s, l) => s + l.tokens, 0)} />
                <KVRow label="Gelen Token" value={receivedLinks.reduce((s, l) => s + l.tokens, 0)} />
                <KVRow label="Aktarılan Handoff" value={sentLinks.reduce((s, l) => s + l.handoffs, 0)} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
