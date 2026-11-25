import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CAPABILITIES, EVALUATION_RESULTS, FRAMEWORKS_DATA, THEME } from "../data/mockData";
import { FRAMEWORK_PIPELINES, INITIAL_RUNS, SAMPLE_RUN_MODEL, TELEMETRY } from "../data/frameworkRuns";
import { KVRow, PageHeader } from "../components/UI";

interface RankedItem {
  name: string;
  v: [number, number, number, number];
  score: number;
}

export function ComparisonLabPage() {
  const [weights, setWeights] = useState([40, 25, 20, 15]);
  const [minQuality, setMinQuality] = useState(80);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    detailHeading.current?.scrollIntoView({ block: "nearest" });
  }, [selectedName]);

  const resetWeights = () => {
    setWeights([40, 25, 20, 15]);
    setMinQuality(80);
  };

  const totalW = weights.reduce((a, b) => a + b, 0);
  const eligiblePool = FRAMEWORKS_DATA.filter((fw) => fw.v[0] >= minQuality);

  const ranked: RankedItem[] = totalW
    ? eligiblePool
        .map((fw) => {
          const w0 = weights[0] ?? 0;
          const w1 = weights[1] ?? 0;
          const w2 = weights[2] ?? 0;
          const w3 = weights[3] ?? 0;
          const score = (fw.v[0] * w0 + fw.v[1] * w1 + fw.v[2] * w2 + fw.v[3] * w3) / totalW;
          return { name: fw.name, v: fw.v, score };
        })
        .sort((a, b) => b.score - a.score)
    : [];

  const top = ranked[0] ?? null;
  const selected = FRAMEWORKS_DATA.find(({ name }) => name === selectedName);
  const selectedPipeline = selected ? FRAMEWORK_PIPELINES[selected.name] : undefined;
  const selectedRun = INITIAL_RUNS.find(({ name }) => name === selectedName);
  const selectedEvaluation = EVALUATION_RESULTS.find(({ name }) => name === selectedName);
  const selectedTelemetry = selected ? TELEMETRY[selected.name] : undefined;
  const selectedScore = ranked.find(({ name }) => name === selectedName)?.score;

  const paretoPoints = eligiblePool
    .filter(
      (a) =>
        !eligiblePool.some(
          (b) => b.v[0] >= a.v[0] && b.v[1] >= a.v[1] && (b.v[0] > a.v[0] || b.v[1] > a.v[1])
        )
    )
    .sort((a, b) => a.v[1] - b.v[1]);

  const chart = { left: 52, right: 560, top: 35, bottom: 273 };
  const scaleX = (speed: number) => chart.left + (speed - 60) / 40 * (chart.right - chart.left);
  const scaleY = (quality: number) => chart.bottom - (quality - 70) / 30 * (chart.bottom - chart.top);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        eyebrow="KARAR MOTORU VE PARETO SINIRI"
        title="Karşılaştırma Laboratuvarı ve Öneri"
        description="Öncelik ağırlıklarını belirleyin, 2D Pareto dengesini inceleyin ve kazanan adayı seçin."
        right={
          <div className="arena-status-bar">
            <span>Aday Havuzu: <strong style={{ color: THEME.text }}>10</strong></span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.green }}>{eligiblePool.length} Uygun</span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.cyan }}>
              Lider: <strong>{top ? top.name : "—"}</strong> ({top ? top.score.toFixed(1) : "—"})
            </span>
          </div>
        }
      />

      <div className="arena-pareto-layout">
        <div className="arena-pareto-sidebar">
          {/* Pareto Grafiği */}
          <section className="arena-card arena-pareto-card">
            <div className="arena-card-header">
              <h2 className="arena-card-title">Kalite ve Hız Pareto Eğrisi</h2>
            </div>
            <div className="arena-pareto-body">
              <svg viewBox="0 0 590 330" className="arena-pareto-chart" role="group" aria-label="Yatay eksende hız, dikey eksende kalite skoru. Ayrıntılar için bir framework noktası seçin.">
                <rect x={chart.left} y={chart.top} width={chart.right - chart.left} height={chart.bottom - chart.top} rx="5" fill="#0d141d" />
                {[60, 70, 80, 90, 100].map((v) => (
                  <g key={`x-${v}`}>
                    <line x1={scaleX(v)} y1={chart.top} x2={scaleX(v)} y2={chart.bottom} stroke="#253141" />
                    <text x={scaleX(v)} y={chart.bottom + 20} textAnchor="middle" fill="#aebbc9" fontSize="13">{v}</text>
                  </g>
                ))}
                {[70, 80, 90, 100].map((v) => (
                  <g key={`y-${v}`}>
                    <line x1={chart.left} y1={scaleY(v)} x2={chart.right} y2={scaleY(v)} stroke="#253141" />
                    <text x={chart.left - 10} y={scaleY(v) + 4} textAnchor="end" fill="#aebbc9" fontSize="13">{v}</text>
                  </g>
                ))}

                <text x={(chart.left + chart.right) / 2} y="322" textAnchor="middle" fill="#aebbc9" fontSize="14">Hız skoru →</text>
                <text x={chart.left} y="20" fill="#aebbc9" fontSize="14">Kalite skoru ↑</text>
                <line x1={chart.left} y1={scaleY(minQuality)} x2={chart.right} y2={scaleY(minQuality)} stroke={THEME.amber} strokeDasharray="3 4" />

                {paretoPoints.length > 1 && (
                  <polyline
                    points={paretoPoints.map((p) => `${scaleX(p.v[1])},${scaleY(p.v[0])}`).join(" ")}
                    stroke={THEME.purple}
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    fill="none"
                  />
                )}

                {FRAMEWORKS_DATA.map((item) => {
                  const isWinner = top && item.name === top.name;
                  const isEligible = item.v[0] >= minQuality;
                  const cx = scaleX(item.v[1]);
                  const cy = scaleY(item.v[0]);
                  const dotColor = isWinner ? THEME.cyan : isEligible ? THEME.blue : "#475569";

                  return (
                    <g
                      key={item.name}
                      className="arena-pareto-point"
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.name}, kalite ${item.v[0]}, hız ${item.v[1]}`}
                      aria-pressed={item.name === selectedName}
                      onClick={() => setSelectedName(item.name)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedName(item.name);
                        }
                      }}
                    >
                      <circle cx={cx} cy={cy} r="14" fill="transparent" />
                      <circle className="arena-pareto-selection" cx={cx} cy={cy} r="14" fill="none" stroke={THEME.text} />
                      {paretoPoints.some(({ name }) => name === item.name) && <circle cx={cx} cy={cy} r="9" fill="none" stroke={THEME.purple} />}
                      {isWinner && <circle cx={cx} cy={cy} r="12" fill="none" stroke={dotColor} strokeWidth="1.5" />}
                      <circle cx={cx} cy={cy} r={isWinner ? 7 : 5} fill={dotColor}>
                        <title>{`${item.name} · Kalite ${item.v[0]} · Hız ${item.v[1]}`}</title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
              <div className="arena-pareto-legend">
                <span style={{ color: THEME.purple }}>┄ Pareto sınırı</span>
                <span style={{ color: THEME.amber }}>┄ Kalite eşiği · {minQuality}</span>
                {top && <span style={{ color: THEME.cyan }}>◎ Lider · {top.name}</span>}
              </div>
            </div>
          </section>
          {selected && (
            <section className="arena-card" aria-labelledby="pareto-framework-details">
              <div className="arena-card-header">
                <div>
                  <h2 ref={detailHeading} id="pareto-framework-details" className="arena-card-title">{selected.name}</h2>
                  <span style={{ color: THEME.muted }}>{selected.architecture} · v{selected.version}</span>
                </div>
                <button type="button" className="arena-btn" onClick={() => setSelectedName(null)}>Kapat</button>
              </div>
              <div className="arena-card-pad">
                {selectedPipeline && (
                  <>
                    <h3 className="arena-card-title">Framework Akışı</h3>
                    <ol className="task-pipeline-flow">
                      {selectedPipeline.nodes.map((node) => <li key={node}>{node}</li>)}
                    </ol>
                    <p style={{ color: THEME.muted }}>{selectedPipeline.desc}</p>
                  </>
                )}
                <div className="arena-grid-2-asym">
                  <div>
                    <h3 className="arena-card-title">Örnek Çalıştırma</h3>
                    {selectedRun ? (
                      <>
                        <KVRow label="Model" value={SAMPLE_RUN_MODEL} />
                        <KVRow label="Token tüketimi" value={selectedRun.tokens.toLocaleString("tr-TR")} />
                        <KVRow label="Süre" value={selectedRun.time} />
                        <KVRow label="İlerleme" value={`%${selectedRun.pct}`} />
                      </>
                    ) : <p>Çalıştırma verisi yok.</p>}
                    {selectedTelemetry && (
                      <>
                        <KVRow label="Ajan sayısı" value={selectedTelemetry.agents.length} />
                        <KVRow label="Ajanlar arası mesaj" value={selectedTelemetry.links.reduce((sum, link) => sum + link[2], 0)} />
                        <KVRow label="İletişim tokenı" value={selectedTelemetry.links.reduce((sum, link) => sum + link[3], 0).toLocaleString("tr-TR")} />
                        <KVRow label="Görev devri" value={selectedTelemetry.links.reduce((sum, link) => sum + link[4], 0)} />
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="arena-card-title">Karşılaştırma ve Değerlendirme</h3>
                    {["Kalite", "Hız", "Token verimliliği", "Güvenilirlik"].map((label, index) => (
                      <KVRow key={label} label={label} value={`${selected.v[index]} / 100`} />
                    ))}
                    <KVRow label="Ağırlıklı puan" value={selectedScore === undefined ? "—" : `${selectedScore.toFixed(1)} / 100`} />
                    <KVRow label="Kalite eşiği" value={selected.v[0] >= minQuality ? "Geçti" : "Eşiğin altında"} />
                    {selectedEvaluation && (
                      <>
                        <KVRow label="JSON şema kontrolü" value={selectedEvaluation.schemaPass ? "Geçti" : "Başarısız"} />
                        <KVRow label="Çelişki tespiti F1" value={selectedEvaluation.conflictF1.toFixed(2)} />
                        <KVRow label="Test seti doğruluğu" value={`%${selectedEvaluation.heldOutAccuracy.toFixed(1)}`} />
                        <KVRow label="Dual-Gate sonucu" value={selectedEvaluation.overallStatus} />
                      </>
                    )}
                  </div>
                </div>
                <details style={{ marginTop: 16 }}>
                  <summary>Yetenekler</summary>
                  {CAPABILITIES.map((label, index) => (
                    <KVRow key={label} label={label} value={["Doğrulanmamış", "Adaptör ile", "Yerel"][selected.caps[index] ?? 0] ?? "—"} />
                  ))}
                </details>
              </div>
            </section>
          )}
        </div>

        <div className="arena-pareto-sidebar">
          {/* Ağırlıklar */}
          <section className="arena-card">
            <div className="arena-card-header">
              <h2 className="arena-card-title">Optimizasyon Ağırlıkları</h2>
            </div>
            <div style={{ padding: 18 }}>
              {["Kalite", "Hız", "Token Verimliliği", "Güvenilirlik"].map((label, idx) => {
                const currentWeight = weights[idx] ?? 0;
                return (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: THEME.muted }}>{label}</span>
                      <b className="arena-mono" style={{ color: THEME.text }}>
                        {totalW ? ((currentWeight / totalW) * 100).toFixed(0) : 0}%
                      </b>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentWeight}
                      onChange={(e) => {
                        const next = [...weights];
                        next[idx] = Number(e.target.value);
                        setWeights(next);
                      }}
                      style={{ width: "100%", accentColor: THEME.cyan }}
                    />
                  </div>
                );
              })}

              <div style={{ marginBottom: 16, borderTop: `1px solid ${THEME.line}`, paddingTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: THEME.muted }}>Asgari Kalite Barajı</span>
                  <b className="arena-mono" style={{ color: THEME.amber }}>{minQuality} / 100</b>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  value={minQuality}
                  onChange={(e) => setMinQuality(Number(e.target.value))}
                  style={{ width: "100%", accentColor: THEME.amber }}
                />
              </div>

              <button onClick={resetWeights} className="arena-btn" style={{ width: "100%" }}>
                Ağırlıkları Sıfırla
              </button>
            </div>
          </section>

          {/* Öneri Kürsüsü */}
          <section className="arena-card">
            <div className="arena-card-header">
              <h2 className="arena-card-title">Öneri Kürsüsü</h2>
            </div>
            <div style={{ padding: 18 }}>
              {top ? (
                <div>
                  <div className="arena-eyebrow" style={{ marginBottom: 3 }}>En Yüksek Ağırlıklı Eşleşme</div>
                  <div style={{ fontSize: 22, fontWeight: 700, margin: "2px 0" }}>{top.name}</div>
                  <div className="arena-mono" style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em", color: THEME.cyan }}>
                    {top.score.toFixed(1)}
                    <span style={{ fontSize: 14, color: THEME.muted, fontWeight: 400 }}> / 100</span>
                  </div>
                  <p style={{ fontSize: 12, color: THEME.muted, margin: "6px 0 14px", lineHeight: 1.45 }}>
                    Mevcut öncelik parametrelerinize göre asgari kalite barajını geçen en yüksek puanlı aday.
                  </p>

                  <KVRow label="Kalite" value={`${top.v[0]} / 100`} />
                  <KVRow label="Hız" value={`${top.v[1]} / 100`} />
                  <KVRow label="Token Verimliliği" value={`${top.v[2]} / 100`} />
                  <KVRow label="Güvenilirlik" value={`${top.v[3]} / 100`} />

                  <Link to="/library-exporter" className="arena-btn arena-btn-primary" style={{ width: "100%", marginTop: 16 }}>
                    Kazananı Bağımsız Proje Olarak Dışa Aktar →
                  </Link>
                </div>
              ) : (
                <p style={{ fontSize: 12.5, color: THEME.muted }}>Belirtilen asgari kalite eşiğini karşılayan framework bulunamadı.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Sıralama Tablosu */}
      <section className="arena-card">
        <div className="arena-card-header">
          <h2 className="arena-card-title">Ağırlıklı Sıralama Tablosu</h2>
          <span style={{ fontSize: 11.5, color: THEME.muted }}>Normalleştirilmiş Kompozit Skor</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="arena-table">
            <thead>
              <tr>
                <th style={{ width: 45 }}>Sıra</th>
                <th>Framework</th>
                <th>Kompozit Skor</th>
                <th>Kalite</th>
                <th>Hız</th>
                <th>Token</th>
                <th>Güvenilirlik</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((fw, idx) => {
                const isHighlight = idx === 0;
                return (
                  <tr key={fw.name} style={{ backgroundColor: isHighlight ? "rgba(56, 189, 248, 0.06)" : "transparent" }}>
                    <td className="arena-mono" style={{ color: isHighlight ? THEME.cyan : THEME.muted, fontWeight: 700 }}>
                      #{idx + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{fw.name}</td>
                    <td className="arena-mono" style={{ fontWeight: 700, color: isHighlight ? THEME.cyan : THEME.text }}>
                      {fw.score.toFixed(1)}
                    </td>
                    {fw.v.map((val, vi) => (
                      <td key={vi} className="arena-mono">
                        {val}
                        <div style={{ height: 3, background: THEME.lineSubtle, borderRadius: 999, overflow: "hidden", marginTop: 4 }}>
                          <div style={{ width: `${val}%`, height: "100%", background: THEME.cyan }} />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
