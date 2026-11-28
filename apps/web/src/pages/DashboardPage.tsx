import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { THEME } from "../data/mockData";
import { api, STATUS_LABEL, type SystemStatus } from "../api/client";
import { useExperimentList } from "../api/useExperiment";
import { PageHeader } from "../components/UI";
import { useI18n } from "../i18n";

export function DashboardPage() {
  const { t, locale } = useI18n();
  const { list } = useExperimentList();
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [systemError, setSystemError] = useState("");
  useEffect(() => {
    api<SystemStatus>("/v1/system/status").then(setSystem).catch((e: Error) => setSystemError(e.message));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        eyebrow={t("AŞAMA 1 · GENEL BAKIŞ")}
        title="Agentic Arena"
        description={t("Aynı görevi, aynı modelle 10 farklı framework'e aynı anda yaptırın ve sonuçları adil şekilde karşılaştırın.")}
      />

      {/* How it works */}
      <section className="arena-card arena-card-pad">
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>{t("Nasıl Çalışır?")}</h2>
        <div className="arena-grid-4">
          {[
            {
              phase: 1,
              color: THEME.blue,
              icon: "⊞",
              title: t("Keşif"),
              desc: t("Framework Matrisinde adayları ve yeteneklerini inceleyin."),
              path: "/framework-hub",
              cta: t("Matrise Git →"),
            },
            {
              phase: 2,
              color: THEME.cyan,
              icon: "✎",
              title: t("Görev Tasarımı"),
              desc: t("Görev Stüdyosu'nda ne yapılmasını istediğinizi serbest dilde yazın. Sorularla netleştirin."),
              path: "/task-pipeline",
              cta: t("Stüdyoya Git →"),
            },
            {
              phase: 3,
              color: THEME.green,
              icon: "▶",
              title: t("Analiz"),
              desc: t("Arenada framework ilerlemesini ve seçili framework’ün telemetrisini inceleyin."),
              path: "/execution-arena",
              cta: t("Arenaya Git →"),
            },
            {
              phase: 4,
              color: THEME.purple,
              icon: "◈",
              title: t("Karar"),
              desc: t("F1 skoru, token verimliliği ve hız ölçütlerine göre en iyi framework'ü seçin. Dışa aktarın."),
              path: "/comparison-lab",
              cta: t("Laboratuvara Git →"),
            },
          ].map((step) => (
            <div
              key={step.phase}
              style={{
                backgroundColor: THEME.panelAlt,
                border: `1px solid ${THEME.line}`,
                borderRadius: 10,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: `${step.color}26`,
                  border: `1.5px solid ${step.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: step.color,
                }}
              >
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: THEME.text, marginBottom: 6 }}>
                  {step.title}
                </div>
                <p style={{ fontSize: 12.5, color: THEME.muted, margin: 0, lineHeight: 1.55 }}>
                  {step.desc}
                </p>
              </div>
              <Link
                to={step.path}
                style={{
                  marginTop: "auto",
                  fontSize: 12,
                  fontWeight: 600,
                  color: step.color,
                  textDecoration: "none",
                }}
              >
                {step.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Registered frameworks summary */}
      <section className="arena-card arena-card-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{t("Kayıtlı Framework'ler")}</h2>
          <Link
            to="/framework-hub"
            style={{ fontSize: 12, fontWeight: 600, color: THEME.cyan, textDecoration: "none" }}
          >
            {t("Tüm Yetenek Matrisini Gör →")}
          </Link>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            "LangGraph", "Google ADK", "OpenAI Agents", "CrewAI",
            "Pydantic AI", "Agno", "LlamaAgents", "Smolagents",
            "Mastra", "Microsoft AF",
          ].map((fw) => (
            <span
              key={fw}
              style={{
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: THEME.panelAlt,
                border: `1px solid ${THEME.line}`,
                borderRadius: 6,
                padding: "5px 12px",
                color: THEME.text,
              }}
            >
              {fw}
            </span>
          ))}
        </div>
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            backgroundColor: "var(--accent-green-soft)",
            border: "1px solid var(--accent-green-line)",
            borderRadius: 8,
            fontSize: 12.5,
            color: THEME.muted,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: THEME.green, fontWeight: 700 }}>{t("Adil Karşılaştırma Garantisi: ")}</span>
          {t("Tüm framework'ler aynı görevi, aynı kilitli modeli (örn. gemini-1.5-pro) ve aynı araç yetkilerini kullanır. Hiçbir framework'e özel sistem prompt avantajı tanınmaz.")}
        </div>
      </section>

      {/* Live system status */}
      <section className="arena-card arena-card-pad" aria-labelledby="system-status">
        <h2 id="system-status" style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>{t("Sistem Durumu")}</h2>
        {systemError ? (
          <p role="alert" style={{ color: THEME.red, margin: 0 }}>{systemError}</p>
        ) : (
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12.5 }}>
            <span style={{ color: system ? THEME.green : THEME.muted }}>{t("● API ")}{system ? t("çalışıyor") : t("denetleniyor…")}</span>
            <span style={{ color: system?.fixture.integrity_verified ? THEME.green : THEME.muted }}>
              {system ? `${system.fixture.integrity_verified ? "✓" : "✗"} ${t("Benchmark verisi bütünlüğü")} (${system.fixture.benchmark_id})` : "…"}
            </span>
            <span style={{ color: THEME.muted }}>{system ? `${system.frameworks} ${t("framework işçisi")}` : ""}</span>
            <span style={{ color: system?.design_model_configured ? THEME.green : "var(--accent-amber-ink)" }}>
              {system ? (system.design_model_configured ? t("✓ AI görev tasarımı yapılandırıldı") : t("AI görev tasarımı için ARENA_DESIGN_MODEL / ARENA_DESIGN_API_KEY tanımlı değil (demo görev kullanılabilir)")) : ""}
            </span>
          </div>
        )}
        <h3 style={{ fontSize: 12, fontWeight: 700, margin: "18px 0 8px", color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t("Son Deneyler")}</h3>
        {list.length === 0 ? (
          <p style={{ color: THEME.muted, margin: 0, fontSize: 12.5 }}>{t("Henüz deney yok. Görev Stüdyosu'ndan başlatın.")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {list.slice(0, 5).map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", fontSize: 12.5, padding: "8px 12px", background: THEME.panelAlt, borderRadius: 8, border: `1px solid ${THEME.lineSubtle}` }}>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.objective || e.id}</span>
                <span className="arena-mono" style={{ color: THEME.muted }}>{new Date(e.created_at).toLocaleString(locale)}</span>
                <span style={{ color: e.status === "completed" ? THEME.green : e.status === "failed" ? THEME.red : THEME.cyan, fontWeight: 600 }}>{t(STATUS_LABEL[e.status])} · {e.completed_count}/{e.total_count}</span>
                <Link to="/execution-arena" state={{ experimentId: e.id }} style={{ color: THEME.cyan, textDecoration: "none", fontWeight: 600 }}>{t("Arena")}</Link>
                <Link to="/comparison-lab" state={{ experimentId: e.id }} style={{ color: THEME.purple, textDecoration: "none", fontWeight: 600 }}>{t("Karşılaştır")}</Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {t("Hızlı Erişim")}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: t("Framework Matrisi"), desc: t("10×10 yetenek karşılaştırması"), path: "/framework-hub", icon: "⊞" },
            { label: t("Çalıştırma Arenası"), desc: t("Framework ilerlemesi ve ajan telemetrisi"), path: "/execution-arena", icon: "▶" },
            { label: t("Geliştirme Stüdyosu"), desc: t("Adaptör kodu ve Dual-Gate metrikleri"), path: "/development-studio", icon: "⚙" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{ textDecoration: "none" }}
            >
              <div
                className="arena-card"
                style={{
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span style={{ fontSize: 20, color: THEME.cyan }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: THEME.muted }}>{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
