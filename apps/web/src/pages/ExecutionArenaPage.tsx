import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { THEME } from "../data/mockData";
import { DEFAULT_TELEMETRY, INITIAL_RUNS, SAMPLE_RUN_MODEL, TELEMETRY, type LiveRun } from "../data/frameworkRuns";
import { KVRow, PageHeader, SvgNode } from "../components/UI";
import { SuccessTestFlow, type BenchmarkPlan, type SuccessCriteria } from "../components/SuccessTestFlow";

export function ExecutionArenaPage() {
  const task = useLocation().state as {
    objective: string;
    framework?: string;
    successCriteria: SuccessCriteria;
    benchmarkPlan?: BenchmarkPlan;
  } | null;
  const [runs, setRuns] = useState<LiveRun[]>(INITIAL_RUNS);
  const [selectedIdx, setSelectedIdx] = useState(() => Math.max(0, INITIAL_RUNS.findIndex(({ name }) => name === task?.framework)));
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(42.8);

  // Simulated tick
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setRuns((prev) => {
        const pending = prev.filter((r) => r.pct < 100);
        if (!pending.length) return prev;
        const target = pending[Math.floor(Math.random() * pending.length)];
        if (!target) return prev;
        return prev.map((r) =>
          r.name === target.name
            ? { ...r, pct: Math.min(100, r.pct + Math.ceil(Math.random() * 6)), tokens: r.tokens + 120 }
            : r
        );
      });
      setElapsed((e) => +(e + 1.2).toFixed(1));
    }, 2000);
    return () => clearInterval(id);
  }, [isPaused]);

  const selectedRun = runs[selectedIdx] ?? runs[0]!;
  const completedCount = runs.filter((r) => r.pct === 100).length;
  const totalTokens = (runs.reduce((s, r) => s + r.tokens, 0) / 1000).toFixed(1) + "K";
  const telemetry = TELEMETRY[selectedRun.name] ?? DEFAULT_TELEMETRY;
  const sentLinks = telemetry.links.filter(([from]) => from === selectedAgent);
  const receivedLinks = telemetry.links.filter(([, to]) => to === selectedAgent);

  const totalMsgs = telemetry.links.reduce((s, l) => s + l[2], 0);
  const totalHandoffs = telemetry.links.reduce((s, l) => s + l[4], 0);
  const totalTokComm = telemetry.links.reduce((s, l) => s + l[3], 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        eyebrow="AŞAMA 3 · ÇALIŞTIRMA ARENASI VE TELEMETRİ"
        title="Çalıştırma Arenası"
        description="Bir framework seçtiğinizde çalışma ilerlemesi ve ajan iletişim telemetrisi otomatik güncellenir. Bu görünüm örnek çalışma verilerini kullanır."
        right={
          <>
            <div className="arena-status-bar">
              <span style={{ color: THEME.green, fontWeight: 600 }}>{completedCount} / 10 Tamamlandı</span>
              <span style={{ color: THEME.line }}>|</span>
              <span>Toplam: <strong className="arena-mono" style={{ color: THEME.text }}>{totalTokens}</strong></span>
              <span style={{ color: THEME.line }}>|</span>
              <span className="arena-mono" style={{ color: THEME.amber }}>{elapsed} sn</span>
            </div>
            <button onClick={() => setIsPaused(!isPaused)} className="arena-btn arena-btn-primary">
              {isPaused ? "▶ Sürdür" : "❚❚ Duraklat"}
            </button>
          </>
        }
      />

      {task?.successCriteria?.metric ? (
        <section className="arena-card arena-card-pad" aria-labelledby="run-success-criteria">
          <h2 className="arena-card-title" id="run-success-criteria">Görev ve Başarı Kriterleri</h2>
          <p>{task.objective}</p>
          <SuccessTestFlow criteria={task.successCriteria} benchmark={task.benchmarkPlan} />
        </section>
      ) : null}

      {/* ── Üst satır: Framework listesi + Seçili framework pipeline ── */}
      <div className="arena-framework-detail-grid">

        {/* Sol: Framework listesi */}
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">Framework'ler</h2>
            <span className="arena-mono" style={{ fontSize: 10.5, color: THEME.muted }}>
              {completedCount}/10
            </span>
          </div>
          <div style={{ padding: "6px 8px" }}>
            {runs.map((r, i) => {
              const isSel = i === selectedIdx;
              const isDone = r.pct === 100;
              return (
                <button
                  key={r.name}
                  aria-pressed={isSel}
                  onClick={() => {
                    if (i !== selectedIdx) setSelectedAgent(null);
                    setSelectedIdx(i);
                  }}
                  style={{
                    display: "grid",
                    width: "100%",
                    gridTemplateColumns: "1fr auto",
                    rowGap: 3,
                    textAlign: "left",
                    margin: "3px 0",
                    padding: "9px 11px",
                    background: isSel ? "#15283d" : "transparent",
                    border: `1px solid ${isSel ? "#2c5270" : "transparent"}`,
                    borderLeft: isSel ? `3px solid ${THEME.cyan}` : "3px solid transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: THEME.text,
                    transition: "all 0.12s ease",
                  }}
                >
                  <b style={{ fontSize: 12.5, color: isSel ? THEME.cyan : THEME.text }}>{r.name}</b>
                  <span className="arena-mono" style={{ fontSize: 11, fontWeight: 600, color: isDone ? THEME.green : THEME.cyan }}>
                    {isDone ? "✓" : `${r.pct}%`}
                  </span>
                  <small className="arena-mono" style={{ color: THEME.muted, fontSize: 10.5 }}>
                    {r.tokens.toLocaleString()} tok
                  </small>
                  <small className="arena-mono" style={{ color: THEME.muted, fontSize: 10.5, textAlign: "right" }}>
                    {r.time}
                  </small>
                  <div style={{ gridColumn: "1/-1", height: 3, background: THEME.lineSubtle, borderRadius: 999, overflow: "hidden", marginTop: 2 }}>
                    <div
                      style={{
                        width: `${r.pct}%`, height: "100%",
                        background: isDone ? THEME.green : THEME.cyan,
                        transition: "width .3s ease",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Sağ: Seçili framework pipeline + meta */}
        <div className="arena-selected-flows">
          <section className="arena-card">
            <div className="arena-card-header">
              <h2 className="arena-card-title">
                {selectedRun.name}
                <span style={{ fontSize: 11.5, fontWeight: 500, color: THEME.muted, marginLeft: 8 }}>
                  · Yerel Akış
                </span>
              </h2>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: selectedRun.pct === 100 ? THEME.green : THEME.cyan }}>
                {selectedRun.pct === 100 ? "● Tamamlandı" : "● İşleniyor"}
              </span>
            </div>

            <div
              style={{
                backgroundColor: THEME.panelAlt,
                backgroundImage: "radial-gradient(#243244 0.8px, transparent 0.8px)",
                backgroundSize: "18px 18px",
                padding: 14,
              }}
            >
              <svg viewBox="0 0 620 200" style={{ display: "block", width: "100%", height: "auto" }}>
                <defs>
                  <marker id="arrowA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                  </marker>
                </defs>
                <path d="M140 100 H190" fill="none" stroke={THEME.cyan} strokeWidth="2"
                  strokeDasharray={isPaused ? "none" : "7 6"} markerEnd="url(#arrowA)" />
                <path d="M360 100 H415" fill="none" stroke={THEME.cyan} strokeWidth="2"
                  strokeDasharray={isPaused ? "none" : "7 6"} markerEnd="url(#arrowA)" />
                <path d="M490 75 V30 H300 V70" fill="none" stroke={THEME.purple}
                  strokeDasharray="5 5" strokeWidth="1.5" markerEnd="url(#arrowA)" />

                <SvgNode x={10} y={70} w={130} h={58} icon="◇" title="Planlayıcı" sub="Ajan" status="complete" />
                <SvgNode x={190} y={70} w={170} h={58} icon="⌕" title="Araştırma" sub="Ajan" status={selectedRun.pct === 100 ? "complete" : "running"} />
                <SvgNode x={415} y={70} w={150} h={58} icon="✓" title="Değerlendirici" sub="Dual-Gate" status={selectedRun.pct === 100 ? "complete" : "queued"} />
                <text x={300} y={22} textAnchor="middle" fill="#94a3b8" fontSize={10.5}>
                  Koşullu Geri Besleme
                </text>
              </svg>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, borderTop: `1px solid ${THEME.line}` }}>
              {[
                { label: "İlerleme", value: `${selectedRun.pct}%`, color: selectedRun.pct === 100 ? THEME.green : THEME.cyan },
                { label: "Token", value: selectedRun.tokens.toLocaleString(), color: THEME.text },
                { label: "Süre", value: selectedRun.time, color: THEME.text },
                { label: "Model", value: SAMPLE_RUN_MODEL, color: THEME.muted },
              ].map((m, i) => (
                <div
                  key={m.label}
                  style={{
                    padding: "12px 16px",
                    borderRight: i < 3 ? `1px solid ${THEME.line}` : "none",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 10.5, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    {m.label}
                  </div>
                  <div className="arena-mono" style={{ fontSize: 13, fontWeight: 700, color: m.color }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: THEME.cyan, textTransform: "uppercase", letterSpacing: "0.09em" }}>
              ⌁ Telemetri
            </span>
            <span aria-live="polite" style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>
              {selectedRun.name} · Ajan İletişim Analizi
              {telemetry === DEFAULT_TELEMETRY && " · Genel örnek akış"}
            </span>
            <div style={{ display: "flex", gap: 10, marginLeft: "auto", fontSize: 12 }}>
              <span className="arena-status-bar" style={{ padding: "4px 12px" }}>
                <span><strong style={{ color: THEME.text }}>{totalMsgs}</strong> Mesaj</span>
                <span style={{ color: THEME.line }}>|</span>
                <span style={{ color: THEME.purple }}>{totalHandoffs} Handoff</span>
                <span style={{ color: THEME.line }}>|</span>
                <span className="arena-mono" style={{ color: THEME.green }}>{totalTokComm.toLocaleString()} tok</span>
              </span>
            </div>
          </div>
          <section className="arena-card">
            <div className="arena-card-header">
              <h2 className="arena-card-title">Mesaj Akışı</h2>
              <span style={{ fontSize: 11.5, color: THEME.muted }}>Çizgi kalınlığı = mesaj hacmi</span>
            </div>

            {/* Mini SVG iletişim grafiği */}
            <div
              style={{
                backgroundColor: THEME.panelAlt,
                backgroundImage: "radial-gradient(#243244 0.8px, transparent 0.8px)",
                backgroundSize: "18px 18px",
                padding: 12,
                overflowX: "auto",
              }}
            >
              <svg
                viewBox={`0 0 620 ${126 + telemetry.links.length * 35}`}
                style={{ display: "block", width: "100%", minWidth: 480, height: "auto" }}
                role="img"
                aria-label={`${selectedRun.name} ajan iletişimi. Bağlantı numaralarının ayrıntıları aşağıdaki tabloda.`}
              >
                <defs>
                  <marker id="arrowT" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                  </marker>
                </defs>
                {/* Dynamic links */}
                {telemetry.links.map((lk, i) => {
                  const fromIdx = telemetry.agents.findIndex((a) => a.name === lk[0]);
                  const toIdx = telemetry.agents.findIndex((a) => a.name === lk[1]);
                  const count = telemetry.agents.length;
                  if (fromIdx < 0 || toIdx < 0) return null;
                  const spacing = 620 / count;
                  const x1 = spacing * (fromIdx + 0.5) - 20 + i * 10;
                  const x2 = spacing * (toIdx + 0.5) + 20 - i * 10;
                  const lane = 110 + i * 35;
                  const sw = Math.max(1.2, Math.min(5, lk[2] * 0.7));
                  return (
                    <g key={i}>
                      <path
                        d={`M${x1} 76 V${lane} H${x2} V80`}
                        fill="none"
                        stroke={THEME.cyan}
                        strokeWidth={sw}
                        strokeOpacity={0.7}
                        markerEnd="url(#arrowT)"
                      />
                      <rect x={(x1 + x2) / 2 - 12} y={lane - 11} width="24" height="22" rx="5" fill="#15283d" />
                      <text x={(x1 + x2) / 2} y={lane + 4} textAnchor="middle" fill="#bdeefa" fontSize="12" fontWeight="700">
                        {i + 1}
                      </text>
                      <title>{`${lk[0]} → ${lk[1]} · ${lk[2]} mesaj · ${lk[3]} token`}</title>
                    </g>
                  );
                })}
                {telemetry.agents.map((ag, i) => {
                  const spacing = 620 / telemetry.agents.length;
                  const cx = spacing * (i + 0.5);
                  return (
                    <g key={ag.name}>
                      <rect x={cx - 66} y={22} width={132} height={54} rx={8}
                        fill="#111824" stroke="#2b3b4e" strokeWidth={1.2} />
                      <text x={cx} y={44} textAnchor="middle" fill={THEME.cyan} fontSize={16}>{ag.icon}</text>
                      <text x={cx} y={64} textAnchor="middle" fill="#f1f5f9" fontSize={12} fontWeight={600}>
                        {ag.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bağlantı tablosu */}
            <div style={{ overflowX: "auto" }}>
              <table className="arena-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kaynak</th>
                    <th>Hedef</th>
                    <th>Mesaj</th>
                    <th>Token</th>
                    <th>Handoff</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetry.links.map((lk, i) => (
                    <tr key={i}>
                      <td className="arena-mono">{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{lk[0]}</td>
                      <td style={{ color: THEME.muted }}>{lk[1]}</td>
                      <td className="arena-mono" style={{ color: THEME.cyan, fontWeight: 700 }}>{lk[2]}</td>
                      <td className="arena-mono">{lk[3]}</td>
                      <td className="arena-mono" style={{ color: THEME.purple, fontWeight: 600 }}>{lk[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <div className="arena-telemetry-summary">
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">Canlı Olaylar</h2>
            <span className="arena-mono" style={{ fontSize: 10.5, color: THEME.cyan }}>SSE</span>
          </div>
          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 0 }}>
            {telemetry.events.map((evt, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 0",
                  borderBottom: i < telemetry.events.length - 1 ? `1px solid ${THEME.lineSubtle}` : "none",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 7, height: 7, borderRadius: "50%",
                    backgroundColor: THEME.cyan,
                    marginTop: 5, flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <b style={{ color: THEME.text, fontSize: 12.5 }}>{evt.label}</b>
                  <div style={{ color: THEME.muted, fontSize: 11.5, marginTop: 2, lineHeight: 1.4 }}>
                    {evt.detail}
                  </div>
                </div>
                <span className="arena-mono" style={{ color: THEME.subtle, fontSize: 10.5, flexShrink: 0 }}>
                  {evt.time}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Ajan özet metrikleri */}
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">Ağ Özeti</h2>
          </div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 0 }}>
            <KVRow label="Toplam Mesaj" value={totalMsgs} />
            <KVRow label="Toplam Handoff" value={totalHandoffs} color={THEME.purple} />
            <KVRow label="İletişim Tokenı" value={totalTokComm.toLocaleString()} color={THEME.green} />
            <KVRow label="Aktif Ajan Sayısı" value={telemetry.agents.length} />
            <KVRow label="Ortalama Mesaj Boyutu"
              value={totalMsgs ? Math.round(totalTokComm / totalMsgs) + " tok" : "—"} />

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                Ajanlar
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {telemetry.agents.map((ag) => {
                  const sent = telemetry.links.filter((l) => l[0] === ag.name).reduce((s, l) => s + l[2], 0);
                  const recv = telemetry.links.filter((l) => l[1] === ag.name).reduce((s, l) => s + l[2], 0);
                  return (
                    <button
                      key={ag.name}
                      type="button"
                      aria-pressed={selectedAgent === ag.name}
                      onClick={() => setSelectedAgent(selectedAgent === ag.name ? null : ag.name)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12,
                        padding: "5px 8px",
                        backgroundColor: THEME.panelAlt,
                        borderRadius: 6,
                        border: `1px solid ${selectedAgent === ag.name ? THEME.cyan : THEME.lineSubtle}`,
                        color: THEME.text,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ color: THEME.cyan, marginRight: 6 }}>{ag.icon}</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{ag.name}</span>
                      <span className="arena-mono" style={{ fontSize: 10.5, color: THEME.muted }}>
                        ↑{sent} ↓{recv}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedAgent && (
              <div style={{ marginTop: 14 }}>
                <h3 className="arena-card-title">{selectedAgent}</h3>
                <KVRow label="Gönderilen Mesaj" value={sentLinks.reduce((sum, link) => sum + link[2], 0)} />
                <KVRow label="Alınan Mesaj" value={receivedLinks.reduce((sum, link) => sum + link[2], 0)} />
                <KVRow label="Giden Token" value={sentLinks.reduce((sum, link) => sum + link[3], 0)} />
                <KVRow label="Gelen Token" value={receivedLinks.reduce((sum, link) => sum + link[3], 0)} />
                <KVRow label="Aktarılan Handoff" value={sentLinks.reduce((sum, link) => sum + link[4], 0)} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
