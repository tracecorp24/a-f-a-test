import { EVALUATION_RESULTS, THEME } from "../data/mockData";

export function EvaluationMetrics({ selectedFramework }: { selectedFramework: string }) {
  const qualifiedCount = EVALUATION_RESULTS.filter((e) => e.overallStatus === "UYGUN").length;

  return (
    <section aria-labelledby="evaluation-metrics" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="arena-card-header">
        <h2 className="arena-card-title" id="evaluation-metrics">Değerlendirme Metrikleri</h2>
        <span className="arena-status-bar">
          <span style={{ color: THEME.green }}>{qualifiedCount} / {EVALUATION_RESULTS.length} Baraj? Ge?ti</span>
          <span style={{ color: THEME.amber }}>F1 ? 0.90</span>
        </span>
      </div>

      {/* F1 Dağılım Grafiği */}
      <section className="arena-card arena-card-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Etiketli Çelişki F1 Skoru Karşılaştırması</h2>
            <span style={{ fontSize: 12, color: THEME.muted }}>Sarı dikey çizgi: Zorunlu Hard Gate Barajı (0.90)</span>
          </div>
          <span style={{ fontSize: 12, color: THEME.green, fontWeight: 600 }}>En Yüksek: LangGraph (0.96)</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EVALUATION_RESULTS.map((item) => {
            const isPassing = item.conflictF1 >= 0.9;
            const barWidth = Math.max(0, ((item.conflictF1 - 0.8) / 0.2) * 100);
            return (
              <div key={item.name} style={{ display: "grid", gridTemplateColumns: "135px 1fr 60px", alignItems: "center", gap: 14, fontSize: 12.5 }}>
                <span style={{ fontWeight: 600, color: isPassing ? THEME.text : THEME.red }}>{item.name}</span>
                <div style={{ position: "relative", height: 16, backgroundColor: THEME.panelAlt, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, backgroundColor: THEME.amber, zIndex: 2 }} />
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: "100%",
                      backgroundColor: isPassing ? THEME.cyan : THEME.red,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span className="arena-mono" style={{ fontWeight: 700, color: isPassing ? THEME.green : THEME.red, textAlign: "right" }}>
                  {item.conflictF1.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detaylı Çetele */}
      <section className="arena-card">
        <div className="arena-card-header">
          <h2 className="arena-card-title">Dual-Gate Değerlendirme Çetelesi (10 Framework)</h2>
          <span style={{ fontSize: 11.5, color: THEME.muted }}>Held-Out Test Seti Doğrulaması</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="arena-table">
            <thead>
              <tr>
                <th>Framework</th>
                <th>Gate 1: JSON Schema</th>
                <th>Gate 2: Conflict F1 (≥ 0.90)</th>
                <th>Held-Out Doğruluğu</th>
                <th>Sonuç Durumu</th>
                <th style={{ textAlign: "right" }}>Öneri Havuzu</th>
              </tr>
            </thead>
            <tbody>
              {EVALUATION_RESULTS.map((row) => (
                <tr key={row.name} style={{ backgroundColor: row.name === selectedFramework ? "#15283d" : undefined }}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td>
                    <span style={{ color: THEME.green, fontWeight: 600 }}>✓ PASS (1.0)</span>
                  </td>
                  <td>
                    <span className="arena-mono" style={{ color: row.conflictF1 >= 0.9 ? THEME.green : THEME.red, fontWeight: 700 }}>
                      {row.conflictF1.toFixed(2)} {row.conflictF1 >= 0.9 ? "✓" : "✗"}
                    </span>
                  </td>
                  <td className="arena-mono">%{row.heldOutAccuracy.toFixed(1)}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 999,
                        backgroundColor: row.overallStatus === "UYGUN" ? "rgba(52, 211, 153, 0.14)" : "rgba(251, 113, 133, 0.14)",
                        color: row.overallStatus === "UYGUN" ? THEME.green : THEME.red,
                        border: `1px solid ${row.overallStatus === "UYGUN" ? THEME.green : THEME.red}`,
                      }}
                    >
                      {row.overallStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span style={{ color: row.overallStatus === "UYGUN" ? THEME.cyan : THEME.muted, fontSize: 12 }}>
                      {row.overallStatus === "UYGUN" ? "Uygun" : "Elendi"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
