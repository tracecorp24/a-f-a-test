import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CAPABILITIES, FRAMEWORKS_DATA, THEME } from "../data/mockData";
import { FRAMEWORK_PIPELINES } from "../data/frameworkRuns";
import { ApiError, frameworkName, post, STATUS_LABEL, type Candidate, type Ranking } from "../api/client";
import { resolveExperimentId, useExperiment, useExperimentList } from "../api/useExperiment";
import { ExperimentPicker, NoExperiment } from "../components/ExperimentPicker";
import { KVRow, PageHeader } from "../components/UI";
import { useI18n } from "../i18n";

const DEFAULT_WEIGHTS = [40, 25, 20, 15];
const DEFAULT_MIN_QUALITY = 80;
const METRIC_LABELS = ["Kalite", "Hız", "Token Verimliliği", "Güvenilirlik"] as const;

/** Axis domain that fits the measured values, in steps of 10. */
function domainOf(values: number[]): [number, number] {
  if (!values.length) return [0, 100];
  const lo = Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10);
  return [Math.min(lo, 90), 100];
}

export function ComparisonLabPage() {
  const { t, locale } = useI18n();
  const routed = (useLocation().state as { experimentId?: string } | null)?.experimentId;
  const { list, loading: listLoading, error: listError } = useExperimentList();
  const [chosen, setChosen] = useState<string | null>(null);
  const expId = chosen ?? resolveExperimentId(routed, list);
  const { experiment, error } = useExperiment(expId);

  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [minQuality, setMinQuality] = useState(DEFAULT_MIN_QUALITY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [rankError, setRankError] = useState("");
  const detailHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    detailHeading.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);
  useEffect(() => setSelectedId(null), [expId]);

  const candidates = experiment?.candidate_details ?? [];
  const measured = useMemo(() => candidates.filter((c) => c.metrics && c.evaluation), [candidates]);
  const measuredKey = measured.map((c) => `${c.id}:${c.metrics?.quality}:${c.metrics?.speed}`).join("|");
  const totalW = weights.reduce((a, b) => a + b, 0);

  // Ranking is computed by the API (ADR-007: hard gates first, then weighted score).
  useEffect(() => {
    if (!expId || !measured.length || !totalW) {
      setRanking(null);
      return;
    }
    let alive = true;
    const timer = setTimeout(() => {
      post<Ranking>(`/v1/experiments/${expId}/rankings`, {
        weights: { quality: weights[0], speed: weights[1], token: weights[2], reliability: weights[3] },
        min_quality: minQuality,
      })
        .then((r) => alive && (setRanking(r), setRankError("")))
        .catch((e) => alive && setRankError(e instanceof ApiError ? e.message : t("Sıralama alınamadı.")));
    }, 200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expId, measuredKey, totalW, weights, minQuality]);

  const byFw = useMemo(() => Object.fromEntries(candidates.map((c) => [c.framework_id, c])), [candidates]);
  const ranked = ranking?.ranked ?? [];
  const top = ranked[0];
  const topCandidate = top ? byFw[top.framework_id] : undefined;
  const eligibleIds = new Set(ranked.map((r) => r.framework_id));
  const selected: Candidate | undefined = candidates.find((c) => c.id === selectedId);
  const selectedName = selected ? frameworkName(selected.framework_id) : "";
  const selectedStatic = FRAMEWORKS_DATA.find(({ name }) => name === selectedName);
  const selectedPipeline = FRAMEWORK_PIPELINES[selectedName];
  const selectedScore = ranked.find((r) => r.framework_id === selected?.framework_id)?.total_score;

  const speeds = measured.map((c) => c.metrics!.speed);
  const qualities = measured.map((c) => c.metrics!.quality);
  const [xLo, xHi] = domainOf(speeds);
  const [yLo, yHi] = domainOf(qualities);
  const chart = { left: 52, right: 560, top: 35, bottom: 273 };
  const scaleX = (v: number) => chart.left + ((v - xLo) / (xHi - xLo)) * (chart.right - chart.left);
  const scaleY = (v: number) => chart.bottom - ((v - yLo) / (yHi - yLo)) * (chart.bottom - chart.top);
  const ticks = (lo: number, hi: number) => Array.from({ length: Math.floor((hi - lo) / 10) + 1 }, (_, i) => lo + i * 10);

  const eligiblePool = measured.filter((c) => eligibleIds.has(c.framework_id));
  const paretoPoints = eligiblePool
    .filter((a) => !eligiblePool.some((b) => b.metrics!.quality >= a.metrics!.quality && b.metrics!.speed >= a.metrics!.speed
      && (b.metrics!.quality > a.metrics!.quality || b.metrics!.speed > a.metrics!.speed)))
    .sort((a, b) => a.metrics!.speed - b.metrics!.speed);

  if (!expId) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader eyebrow={t("KARAR MOTORU VE PARETO SINIRI")} title={t("Karşılaştırma Laboratuvarı ve Öneri")} description={t("Ölçülen sonuçlara göre öncelik ağırlıklarını belirleyin ve kazananı seçin.")} />
      <NoExperiment loading={listLoading} error={listError} />
    </div>
  );

  const pending = experiment && experiment.status !== "completed";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        eyebrow={t("KARAR MOTORU VE PARETO SINIRI")}
        title={t("Karşılaştırma Laboratuvarı ve Öneri")}
        description={t("Öncelik ağırlıklarını belirleyin, 2D Pareto dengesini inceleyin ve kazanan adayı seçin. Skorlar seçili deneyin ölçümlerinden hesaplanır.")}
        right={
          <>
            <ExperimentPicker list={list} value={expId} onChange={setChosen} />
            <div className="arena-status-bar">
              <span>{t("Aday Havuzu: ")}<strong style={{ color: THEME.text }}>{candidates.length}</strong></span>
              <span style={{ color: THEME.line }}>|</span>
              <span style={{ color: THEME.green }}>{eligiblePool.length} {t("Uygun")}</span>
              <span style={{ color: THEME.line }}>|</span>
              <span style={{ color: THEME.cyan }}>{t("Lider: ")}<strong>{top ? frameworkName(top.framework_id) : "—"}</strong> ({top ? top.total_score.toFixed(1) : "—"})</span>
            </div>
          </>
        }
      />

      {(error || rankError) && <p role="alert" style={{ color: THEME.red }}>{error || rankError}</p>}
      {pending && experiment && (
        <p role="status" style={{ color: "var(--accent-amber-ink)" }}>
          {t("Deney durumu: ")}{t(STATUS_LABEL[experiment.status])}{t(". Sonuçlar tamamlandıkça güncellenir. ")}<Link to="/execution-arena" state={{ experimentId: expId }}>{t("Arenaya git →")}</Link>
        </p>
      )}
      {experiment && !measured.length && !pending && (
        <p role="status" style={{ color: THEME.muted }}>{t("Bu deneyde ölçülmüş sonuç yok.")}</p>
      )}

      <div className="arena-pareto-layout">
        <div className="arena-pareto-sidebar">
          <section className="arena-card arena-pareto-card">
            <div className="arena-card-header"><h2 className="arena-card-title">{t("Kalite ve Hız Pareto Eğrisi")}</h2></div>
            <div className="arena-pareto-body">
              <svg viewBox="0 0 590 330" className="arena-pareto-chart" role="group" aria-label={t("Yatay eksende hız, dikey eksende kalite skoru. Ayrıntılar için bir framework noktası seçin.")}>
                <rect x={chart.left} y={chart.top} width={chart.right - chart.left} height={chart.bottom - chart.top} rx="5" fill="var(--bg-card-alt)" />
                {ticks(xLo, xHi).map((v) => (
                  <g key={`x-${v}`}>
                    <line x1={scaleX(v)} y1={chart.top} x2={scaleX(v)} y2={chart.bottom} stroke="var(--border)" />
                    <text x={scaleX(v)} y={chart.bottom + 20} textAnchor="middle" fill="var(--text-secondary)" fontSize="13">{v}</text>
                  </g>
                ))}
                {ticks(yLo, yHi).map((v) => (
                  <g key={`y-${v}`}>
                    <line x1={chart.left} y1={scaleY(v)} x2={chart.right} y2={scaleY(v)} stroke="var(--border)" />
                    <text x={chart.left - 10} y={scaleY(v) + 4} textAnchor="end" fill="var(--text-secondary)" fontSize="13">{v}</text>
                  </g>
                ))}
                <text x={(chart.left + chart.right) / 2} y="322" textAnchor="middle" fill="var(--text-secondary)" fontSize="14">{t("Hız skoru →")}</text>
                <text x={chart.left} y="20" fill="var(--text-secondary)" fontSize="14">{t("Kalite skoru ↑")}</text>
                {minQuality >= yLo && <line x1={chart.left} y1={scaleY(minQuality)} x2={chart.right} y2={scaleY(minQuality)} stroke="var(--accent-amber-ink)" strokeDasharray="3 4" />}
                {paretoPoints.length > 1 && (
                  <polyline points={paretoPoints.map((p) => `${scaleX(p.metrics!.speed)},${scaleY(p.metrics!.quality)}`).join(" ")} stroke={THEME.purple} strokeWidth="2" strokeDasharray="5 4" fill="none" />
                )}
                {measured.map((item) => {
                  const name = frameworkName(item.framework_id);
                  const isWinner = top?.framework_id === item.framework_id;
                  const isEligible = eligibleIds.has(item.framework_id);
                  const cx = scaleX(item.metrics!.speed);
                  const cy = scaleY(item.metrics!.quality);
                  const dotColor = isWinner ? THEME.cyan : isEligible ? THEME.blue : "var(--text-muted)";
                  return (
                    <g
                      key={item.id}
                      className="arena-pareto-point"
                      role="button"
                      tabIndex={0}
                      aria-label={`${name}, ${t("kalite")} ${item.metrics!.quality}, ${t("hız")} ${item.metrics!.speed}`}
                      aria-pressed={item.id === selectedId}
                      onClick={() => setSelectedId(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(item.id);
                        }
                      }}
                    >
                      <circle cx={cx} cy={cy} r="14" fill="transparent" />
                      <circle className="arena-pareto-selection" cx={cx} cy={cy} r="14" fill="none" stroke={THEME.text} />
                      {paretoPoints.some(({ id }) => id === item.id) && <circle cx={cx} cy={cy} r="9" fill="none" stroke={THEME.purple} />}
                      {isWinner && <circle cx={cx} cy={cy} r="12" fill="none" stroke={dotColor} strokeWidth="1.5" />}
                      <circle cx={cx} cy={cy} r={isWinner ? 7 : 5} fill={dotColor}>
                        <title>{`${name} · ${t("Kalite")} ${item.metrics!.quality} · ${t("Hız")} ${item.metrics!.speed}`}</title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
              <div className="arena-pareto-legend">
                <span style={{ color: THEME.purple }}>{t("┄ Pareto sınırı")}</span>
                <span style={{ color: "var(--accent-amber-ink)" }}>{t("┄ Kalite eşiği · ")}{minQuality}</span>
                {top && <span style={{ color: THEME.cyan }}>{t("◎ Lider · ")}{frameworkName(top.framework_id)}</span>}
              </div>
            </div>
          </section>

          {selected && (
            <section className="arena-card" aria-labelledby="pareto-framework-details">
              <div className="arena-card-header">
                <div>
                  <h2 ref={detailHeading} id="pareto-framework-details" className="arena-card-title">{selectedName}</h2>
                  <span style={{ color: THEME.muted }}>{selectedStatic ? `${selectedStatic.architecture} · v${selectedStatic.version}` : selected.framework_id}</span>
                </div>
                <button type="button" className="arena-btn" onClick={() => setSelectedId(null)}>{t("Kapat")}</button>
              </div>
              <div className="arena-card-pad">
                {selectedPipeline && (
                  <>
                    <h3 className="arena-card-title">{t("Framework Akışı")}</h3>
                    <ol className="task-pipeline-flow">{selectedPipeline.nodes.map((node) => <li key={node}>{t(node)}</li>)}</ol>
                    <p style={{ color: THEME.muted }}>{t(selectedPipeline.desc)}</p>
                  </>
                )}
                <div className="arena-grid-2-asym">
                  <div>
                    <h3 className="arena-card-title">{t("Ölçülen Çalıştırma")}</h3>
                    <KVRow label={t("Model")} value={experiment?.model_snapshot ?? "—"} />
                    <KVRow label={t("Token (ledger)")} value={selected.usage ? `${selected.usage.total_tokens.toLocaleString(locale)}${selected.usage.exact === false ? " (~)" : ""}` : "—"} />
                    <KVRow label={t("Süre (ort.)")} value={selected.duration_ms === undefined ? "—" : `${selected.duration_ms.toFixed(2)} ms`} />
                    <KVRow label={t("Tekrar")} value={`${selected.progress.repetitions_done} / ${selected.progress.repetitions_total}`} />
                    <KVRow label={t("Ajan sayısı")} value={selected.telemetry.agents.length} />
                    <KVRow label={t("Ajanlar arası mesaj")} value={selected.telemetry.links.reduce((s, l) => s + l.messages, 0)} />
                    <KVRow
                      label={t("İletişim tokenı")}
                      value={`${selected.telemetry.links.some((l) => (l.derived_tokens ?? 0) > 0) ? "~" : ""}${selected.telemetry.links.reduce((s, l) => s + l.tokens, 0).toLocaleString(locale)}`}
                    />
                    <KVRow label={t("Görev devri")} value={selected.telemetry.links.reduce((s, l) => s + l.handoffs, 0)} />
                  </div>
                  <div>
                    <h3 className="arena-card-title">{t("Karşılaştırma ve Değerlendirme")}</h3>
                    {selected.metrics && (["quality", "speed", "token", "reliability"] as const).map((key, index) => (
                      <KVRow key={key} label={t(METRIC_LABELS[index]!)} value={`${selected.metrics![key]} / 100`} />
                    ))}
                    <KVRow label={t("Ağırlıklı puan")} value={selectedScore === undefined ? "—" : `${selectedScore.toFixed(1)} / 100`} />
                    {selected.metrics && <KVRow label={t("Kalite eşiği")} value={selected.metrics.quality >= minQuality ? t("Geçti") : t("Eşiğin altında")} />}
                    {selected.evaluation && (
                      <>
                        <KVRow label={t("JSON şema kontrolü")} value={selected.evaluation.schema_pass ? t("Geçti") : t("Başarısız")} />
                        <KVRow label={t("Çelişki tespiti F1")} value={selected.evaluation.conflict_f1.toFixed(2)} />
                        <KVRow label={t("Bulunan / etiketli çelişki")} value={`${selected.evaluation.predicted_conflicts ?? "—"} / ${selected.evaluation.labeled_conflicts}`} />
                        <KVRow label={t("Dual-Gate sonucu")} value={selected.evaluation.eligible ? t("UYGUN") : t("ELENDİ")} />
                      </>
                    )}
                  </div>
                </div>
                {selectedStatic && (
                  <details style={{ marginTop: 16 }}>
                    <summary>{t("Yetenekler (katalog)")}</summary>
                    {CAPABILITIES.map((label, index) => (
                      <KVRow key={label} label={t(label)} value={t(["Doğrulanmamış", "Adaptör ile", "Yerel"][selectedStatic.caps[index] ?? 0] ?? "—")} />
                    ))}
                  </details>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="arena-pareto-sidebar">
          <section className="arena-card">
            <div className="arena-card-header"><h2 className="arena-card-title">{t("Optimizasyon Ağırlıkları")}</h2></div>
            <div style={{ padding: 18 }}>
              {METRIC_LABELS.map((label, idx) => {
                const currentWeight = weights[idx] ?? 0;
                return (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: THEME.muted }}>{t(label)}</span>
                      <b className="arena-mono" style={{ color: THEME.text }}>{totalW ? ((currentWeight / totalW) * 100).toFixed(0) : 0}%</b>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      aria-label={`${t(label)} ${t("ağırlığı")}`}
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
                  <span style={{ color: THEME.muted }}>{t("Asgari Kalite Barajı")}</span>
                  <b className="arena-mono" style={{ color: "var(--accent-amber-ink)" }}>{minQuality} / 100</b>
                </div>
                <input type="range" min="0" max="100" aria-label={t("Asgari kalite barajı")} value={minQuality} onChange={(e) => setMinQuality(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent-amber-ink)" }} />
              </div>
              <button onClick={() => { setWeights(DEFAULT_WEIGHTS); setMinQuality(DEFAULT_MIN_QUALITY); }} className="arena-btn" style={{ width: "100%" }}>{t("Ağırlıkları Sıfırla")}</button>
            </div>
          </section>

          <section className="arena-card">
            <div className="arena-card-header"><h2 className="arena-card-title">{t("Öneri Kürsüsü")}</h2></div>
            <div style={{ padding: 18 }}>
              {top && topCandidate ? (
                <div>
                  <div className="arena-eyebrow" style={{ marginBottom: 3 }}>{t("En Yüksek Ağırlıklı Eşleşme")}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, margin: "2px 0" }}>{frameworkName(top.framework_id)}</div>
                  <div className="arena-mono" style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em", color: THEME.cyan }}>
                    {top.total_score.toFixed(1)}<span style={{ fontSize: 14, color: THEME.muted, fontWeight: 400 }}> / 100</span>
                  </div>
                  <p style={{ fontSize: 12, color: THEME.muted, margin: "6px 0 14px", lineHeight: 1.45 }}>
                    {t("Hard gate'leri (şema, F1) ve asgari kalite barajını geçen en yüksek puanlı aday.")}
                  </p>
                  {METRIC_LABELS.map((label, i) => (
                    <KVRow key={label} label={t(label)} value={`${top.breakdown[(["quality", "speed", "token", "reliability"] as const)[i]!]} / 100`} />
                  ))}
                  <Link to="/library-exporter" state={{ experimentId: expId, candidateId: topCandidate.id }} className="arena-btn arena-btn-primary" style={{ width: "100%", marginTop: 16 }}>
                    {t("Kazananı Bağımsız Proje Olarak Dışa Aktar →")}
                  </Link>
                </div>
              ) : (
                <p style={{ fontSize: 12.5, color: THEME.muted }}>
                  {ranking?.status === "NO_ELIGIBLE_CANDIDATES"
                    ? t("Hiçbir framework hard kabul kriterlerini ve kalite barajını birlikte geçemedi. Kazanan seçilmedi.")
                    : totalW ? t("Sıralama için ölçülmüş sonuç bekleniyor.") : t("En az bir ağırlık sıfırdan büyük olmalı.")}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="arena-card">
        <div className="arena-card-header">
          <h2 className="arena-card-title">{t("Ağırlıklı Sıralama Tablosu")}</h2>
          <span style={{ fontSize: 11.5, color: THEME.muted }}>{t("Normalleştirilmiş Kompozit Skor")}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="arena-table">
            <thead>
              <tr>
                <th style={{ width: 45 }}>{t("Sıra")}</th><th>Framework</th><th>{t("Kompozit Skor")}</th><th>{t("Kalite")}</th><th>{t("Hız")}</th><th>Token</th><th>{t("Güvenilirlik")}</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((fw, idx) => {
                const isHighlight = idx === 0;
                const values = [fw.breakdown.quality, fw.breakdown.speed, fw.breakdown.token, fw.breakdown.reliability];
                return (
                  <tr key={fw.candidate_id} style={{ backgroundColor: isHighlight ? "var(--accent-cyan-soft)" : "transparent", cursor: "pointer" }} onClick={() => setSelectedId(fw.candidate_id)}>
                    <td className="arena-mono" style={{ color: isHighlight ? THEME.cyan : THEME.muted, fontWeight: 700 }}>#{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{frameworkName(fw.framework_id)}</td>
                    <td className="arena-mono" style={{ fontWeight: 700, color: isHighlight ? THEME.cyan : THEME.text }}>{fw.total_score.toFixed(1)}</td>
                    {values.map((val, vi) => (
                      <td key={vi} className="arena-mono">
                        {val}
                        <div style={{ height: 3, background: THEME.lineSubtle, borderRadius: 999, overflow: "hidden", marginTop: 4 }}>
                          <div style={{ width: `${Math.max(0, Math.min(100, val))}%`, height: "100%", background: THEME.cyan }} />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
              {measured.filter((c) => !eligibleIds.has(c.framework_id)).map((c) => (
                <tr key={c.id} style={{ opacity: 0.6, cursor: "pointer" }} onClick={() => setSelectedId(c.id)}>
                  <td className="arena-mono">—</td>
                  <td style={{ fontWeight: 600 }}>{frameworkName(c.framework_id)}</td>
                  <td colSpan={5} style={{ color: THEME.red }}>
                    {t("ELENDİ · ")}{!c.evaluation!.eligible ? `${t("Hard gate: F1 ")}${c.evaluation!.conflict_f1.toFixed(2)} < ${c.evaluation!.threshold.toFixed(2)}` : `${t("Kalite ")}${c.metrics!.quality} < ${minQuality}`}
                  </td>
                </tr>
              ))}
              {!measured.length && <tr><td colSpan={7} style={{ color: THEME.muted }}>{t("Ölçülmüş sonuç yok.")}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
