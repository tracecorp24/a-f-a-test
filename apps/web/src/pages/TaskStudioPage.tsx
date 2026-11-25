import { useState } from "react";
import { Link } from "react-router-dom";
import { TASK_TEMPLATES, THEME } from "../data/mockData";
import { PageHeader } from "../components/UI";

export function TaskStudioPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("doc-review");
  const [objective, setObjective] = useState(
    "Sözleşmeleri analiz et, teslim tarihi ve bütçe çelişkilerini bul ve kanıtlı rapor üret."
  );
  const [isApproved, setIsApproved] = useState(false);
  const specHash = "4d933042f4d12823a3717b23dde4dfde8e76238870ff528aa1357777b6d2ffee";

  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id);
    const found = TASK_TEMPLATES.find((t) => t.id === id);
    if (found) {
      setObjective(found.sampleObjective);
      setIsApproved(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="KANONİK GÖREV TANIMI (TASKSPEC)"
        title="Görev Stüdyosu"
        description="Görev hedefini belirleyin, kilitli modeli seçin ve RFC 8785 deterministik kanonik hash ile onaylayın."
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: THEME.muted }}>Şablon Seç:</span>
            <select
              className="arena-select"
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {TASK_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="arena-grid-2-asym">
        <div className="arena-card arena-card-pad">
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: THEME.text,
              display: "block",
              marginBottom: 8,
            }}
          >
            Görev Hedefi (Prompt)
          </label>
          <textarea
            className="arena-textarea"
            rows={4}
            value={objective}
            onChange={(e) => {
              setObjective(e.target.value);
              setIsApproved(false);
            }}
            style={{ width: "100%", lineHeight: 1.55 }}
          />

          <div style={{ marginTop: 22 }}>
            <h4 style={{ fontSize: 13, color: THEME.cyan, margin: "0 0 8px" }}>
              Zorunlu Hard Gate Kriterleri (Geçiş Barajı)
            </h4>
            <div
              style={{
                fontSize: 12.5,
                color: THEME.muted,
                lineHeight: 1.85,
                backgroundColor: THEME.panelAlt,
                padding: 14,
                borderRadius: 8,
                border: `1px solid ${THEME.line}`,
              }}
            >
              <div>
                • <code className="arena-mono" style={{ color: THEME.green }}>valid_schema</code>: JSON Schema doğrulaması == 1.0 (Başarısız olan doğrudan elenir)
              </div>
              <div>
                • <code className="arena-mono" style={{ color: THEME.green }}>conflict_f1</code>: Etiketli çelişki tespit F1 skoru ≥ 0.90 (Dual-Gate eşiği)
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h4 style={{ fontSize: 13, color: THEME.purple, margin: "0 0 6px" }}>
              İzin Verilen Serbest Tasarım Alanları
            </h4>
            <p style={{ fontSize: 12.5, color: THEME.muted, margin: 0, lineHeight: 1.6 }}>
              Ajan sayısı, DAG topolojisi, sistem promptu ve hafıza stratejisi her framework'ün kendi yerel yeteneklerine bırakılmıştır.
            </p>
          </div>

          <div style={{ marginTop: 24 }}>
            {!isApproved ? (
              <button onClick={() => setIsApproved(true)} className="arena-btn arena-btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>
                Tanımı Onayla ve Kilitle (RFC 8785 Hash Üret)
              </button>
            ) : (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  backgroundColor: "rgba(52, 211, 153, 0.12)",
                  border: `1px solid ${THEME.green}`,
                  color: THEME.green,
                  fontSize: 12.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  ✓ Görev Kilitlendi! RFC 8785 Kanonik Hash:{" "}
                  <code className="arena-mono">{specHash.slice(0, 18)}...</code>
                </span>
                <Link to="/execution-arena" style={{ color: THEME.text, textDecoration: "underline", fontWeight: 600 }}>
                  Arenada Başlat →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="arena-card arena-card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontSize: 13, color: THEME.muted, margin: 0 }}>Kanonik TaskSpec YAML</h4>
            <span className="arena-mono" style={{ fontSize: 11, color: THEME.cyan }}>
              RFC 8785 Kanonik
            </span>
          </div>
          <pre
            className="arena-mono"
            style={{
              margin: 0,
              padding: 16,
              backgroundColor: THEME.panelAlt,
              borderRadius: 8,
              fontSize: 11.5,
              color: THEME.text,
              overflowX: "auto",
              border: `1px solid ${THEME.line}`,
              lineHeight: 1.65,
            }}
          >
            {`schema_version: 1
project_id: ${selectedTemplate}
input_mode: natural_language
comparison_mode: native
frameworks: [LangGraph, Google ADK, OpenAI Agents, CrewAI, Pydantic AI, Agno, LlamaAgents, Smolagents, Mastra, Microsoft AF]
model:
  model_id: gemini-1.5-pro
  provider: google_genai
  fallback: disabled
criteria:
  - id: valid_schema
    policy: required
    threshold: 1.0
  - id: conflict_f1
    policy: required
    threshold: 0.90`}
          </pre>
        </div>
      </div>
    </div>
  );
}
