import { Link } from "react-router-dom";
import { THEME } from "../data/mockData";
import { PageHeader } from "../components/UI";

export function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        eyebrow="AŞAMA 1 · GENEL BAKIŞ"
        title="Agentic Arena"
        description="Aynı görevi, aynı modelle 10 farklı framework'e aynı anda yaptırın ve sonuçları adil şekilde karşılaştırın."
      />

      {/* How it works */}
      <section className="arena-card arena-card-pad">
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Nasıl Çalışır?</h2>
        <div className="arena-grid-4">
          {[
            {
              phase: 1,
              color: THEME.blue,
              icon: "⊞",
              title: "Keşif",
              desc: "Framework Matrisinde adayları ve yeteneklerini inceleyin.",
              path: "/framework-hub",
              cta: "Matrise Git →",
            },
            {
              phase: 2,
              color: THEME.cyan,
              icon: "✎",
              title: "Görev Tasarımı",
              desc: "Görev Stüdyosu'nda ne yapılmasını istediğinizi serbest dilde yazın. Sorularla netleştirin.",
              path: "/task-pipeline",
              cta: "Stüdyoya Git →",
            },
            {
              phase: 3,
              color: THEME.green,
              icon: "▶",
              title: "Analiz",
              desc: "Arenada framework ilerlemesini ve seçili framework’ün telemetrisini inceleyin.",
              path: "/execution-arena",
              cta: "Arenaya Git →",
            },
            {
              phase: 4,
              color: THEME.purple,
              icon: "◈",
              title: "Karar",
              desc: "F1 skoru, token verimliliği ve hız ölçütlerine göre en iyi framework'ü seçin. Dışa aktarın.",
              path: "/comparison-lab",
              cta: "Laboratuvara Git →",
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
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Kayıtlı Framework'ler</h2>
          <Link
            to="/framework-hub"
            style={{ fontSize: 12, fontWeight: 600, color: THEME.cyan, textDecoration: "none" }}
          >
            Tüm Yetenek Matrisini Gör →
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
            backgroundColor: "rgba(52, 211, 153, 0.07)",
            border: "1px solid rgba(52, 211, 153, 0.2)",
            borderRadius: 8,
            fontSize: 12.5,
            color: THEME.muted,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: THEME.green, fontWeight: 700 }}>Adil Karşılaştırma Garantisi: </span>
          Tüm framework'ler aynı görevi, aynı kilitli modeli (örn. gemini-1.5-pro) ve aynı araç yetkilerini kullanır.
          Hiçbir framework'e özel sistem prompt avantajı tanınmaz.
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Hızlı Erişim
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Framework Matrisi", desc: "10×10 yetenek karşılaştırması", path: "/framework-hub", icon: "⊞" },
            { label: "Çalıştırma Arenası", desc: "Framework ilerlemesi ve ajan telemetrisi", path: "/execution-arena", icon: "▶" },
            { label: "Geliştirme Stüdyosu", desc: "Adaptör kodu ve Dual-Gate metrikleri", path: "/development-studio", icon: "⚙" },
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
