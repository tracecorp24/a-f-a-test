import { frameworkName, type Candidate } from "../api/client";
import { THEME } from "../data/mockData";
import { useI18n } from "../i18n";

export function EvaluationMetrics({
  candidates,
  selectedFramework,
  threshold,
  fixtureLabeled,
}: {
  candidates: Candidate[];
  selectedFramework: string;
  threshold?: number;
  fixtureLabeled?: number;
}) {
  const { t } = useI18n();
  const rows = candidates
    .filter((c) => c.evaluation)
    .map((c) => ({ id: c.framework_id, name: frameworkName(c.framework_id), ev: c.evaluation! }))
    .sort((a, b) => b.ev.conflict_f1 - a.ev.conflict_f1);
  const gate = threshold ?? rows[0]?.ev.threshold ?? 0.9;
  const qualifiedCount = rows.filter((r) => r.ev.eligible).length;
  const best = rows[0];

  return (
    <section aria-labelledby="evaluation-metrics" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="arena-card-header">
        <h2 className="arena-card-title" id="evaluation-metrics">{t("Değerlendirme Metrikleri")}</h2>
        <span className="arena-status-bar">
          <span style={{ color: THEME.green }}>{qualifiedCount} / {rows.length} {t("Baraj Geçti")}</span>
          <span style={{ color: THEME.amber }}>F1 ≥ {gate.toFixed(2)}</span>
        </span>
      </div>

      {rows.length === 0 ? (
        <section className="arena-card arena-card-pad">
          <p style={{ margin: 0, color: THEME.muted }}>
            {t("Henüz ölçülmüş değerlendirme yok. Görev Stüdyosu'ndan bir deney başlatın; sonuçlar tamamlandıkça burada görünür.")}
          </p>
        </section>
      ) : (
        <>
          <section className="arena-card arena-card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{t("Etiketli Çelişki F1 Skoru Karşılaştırması")}</h2>
                <span style={{ fontSize: 12, color: THEME.muted }}>
                  {t("Sarı çizgi: zorunlu hard gate barajı")} ({gate.toFixed(2)}){fixtureLabeled !== undefined ? ` · ${t("etiketli çelişki")}: ${fixtureLabeled}` : ""}
                </span>
              </div>
              {best && <span style={{ fontSize: 12, color: THEME.green, fontWeight: 600 }}>{t("En Yüksek:")} {best.name} ({best.ev.conflict_f1.toFixed(2)})</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map(({ id, name, ev }) => {
                const isPassing = ev.conflict_f1 >= gate;
                return (
                  <div key={id} style={{ display: "grid", gridTemplateColumns: "135px 1fr 60px", alignItems: "center", gap: 14, fontSize: 12.5 }}>
                    <span style={{ fontWeight: 600, color: isPassing ? THEME.text : THEME.red }}>{name}</span>
                    <div style={{ position: "relative", height: 16, backgroundColor: THEME.panelAlt, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: `${gate * 100}%`, top: 0, bottom: 0, width: 2, backgroundColor: THEME.amber, zIndex: 2 }} />
                      <div style={{ width: `${Math.max(0, Math.min(1, ev.conflict_f1)) * 100}%`, height: "100%", backgroundColor: isPassing ? THEME.cyan : THEME.red, borderRadius: 4 }} />
                    </div>
                    <span className="arena-mono" style={{ fontWeight: 700, color: isPassing ? THEME.green : THEME.red, textAlign: "right" }}>{ev.conflict_f1.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="arena-card">
            <div className="arena-card-header">
              <h2 className="arena-card-title">{t("Dual-Gate Değerlendirme Çetelesi")} ({rows.length} Framework)</h2>
              <span style={{ fontSize: 11.5, color: THEME.muted }}>{t("Etiketli held-out çelişki seti")}</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="arena-table">
                <thead>
                  <tr>
                    <th>Framework</th>
                    <th>Gate 1: JSON Schema</th>
                    <th>Gate 2: Conflict F1 (≥ {gate.toFixed(2)})</th>
                    <th>Precision / Recall</th>
                    <th>{t("Bulunan / Etiketli")}</th>
                    <th>{t("Sonuç Durumu")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ id, name, ev }) => {
                    const ok = ev.conflict_f1 >= gate;
                    return (
                      <tr key={id} style={{ backgroundColor: name === selectedFramework ? "var(--bg-active)" : undefined }}>
                        <td style={{ fontWeight: 600 }}>{name}</td>
                        <td><span style={{ color: ev.schema_pass ? THEME.green : THEME.red, fontWeight: 600 }}>{ev.schema_pass ? "✓ PASS" : "✗ FAIL"}</span></td>
                        <td><span className="arena-mono" style={{ color: ok ? THEME.green : THEME.red, fontWeight: 700 }}>{ev.conflict_f1.toFixed(2)} {ok ? "✓" : "✗"}</span></td>
                        <td className="arena-mono">{ev.precision.toFixed(2)} / {ev.recall.toFixed(2)}</td>
                        <td className="arena-mono">{ev.predicted_conflicts ?? "—"} / {ev.labeled_conflicts}</td>
                        <td>
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, backgroundColor: ev.eligible ? "rgba(52, 211, 153, 0.14)" : "rgba(251, 113, 133, 0.14)", color: ev.eligible ? THEME.green : THEME.red, border: `1px solid ${ev.eligible ? THEME.green : THEME.red}` }}>
                            {ev.eligible ? t("UYGUN") : t("ELENDİ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
