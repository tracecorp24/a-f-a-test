import { useState } from "react";
import { FRAMEWORKS_DATA, THEME } from "../data/mockData";
import { EvaluationMetrics } from "../components/EvaluationMetrics";
import { PageHeader } from "../components/UI";

export function DevelopmentStudioPage() {
  const [selectedFw, setSelectedFw] = useState("LangGraph");
  const [activeTab, setActiveTab] = useState<"code" | "manifest" | "docker">("code");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        eyebrow="ADAPTÖR KODU VE UYUMLULUK DENETİMİ"
        title="Geliştirme Stüdyosu"
        description="Adaptör kodu, uyumluluk testleri ve Dual-Gate değerlendirme sonuçları."
        right={
          <div className="arena-status-bar">
            <span style={{ color: THEME.green }}>✓ 10/10 Manifest Geçerli</span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.green }}>✓ Smoke Testi Geçti</span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.cyan }}>Dondurulmuş Sözleşme</span>
          </div>
        }
      />

      <div className="arena-framework-detail-grid">
        {/* Sol Framework Listesi */}
        <div className="arena-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 10px 10px" }}>
            Aday Framework'ler
          </div>
          {FRAMEWORKS_DATA.map((item) => {
            const isActive = selectedFw === item.name;
            return (
              <button
                key={item.name}
                aria-pressed={isActive}
                onClick={() => setSelectedFw(item.name)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: 7,
                  border: isActive ? "1px solid #2c5270" : "1px solid transparent",
                  backgroundColor: isActive ? "#15283d" : "transparent",
                  color: isActive ? THEME.cyan : THEME.muted,
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 12.5,
                  cursor: "pointer",
                  marginBottom: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{item.name}</span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: THEME.green }} />
              </button>
            );
          })}
        </div>

        {/* Sağ Kod ve Uyumluluk Paneli */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="arena-card arena-grid-4" style={{ padding: "14px 18px" }}>
            <div>
              <div style={{ fontSize: 10.5, color: THEME.subtle, textTransform: "uppercase", fontWeight: 600 }}>Manifest Doğrulama</div>
              <div style={{ fontSize: 12.5, color: THEME.green, fontWeight: 600, marginTop: 3 }}>✓ PASS (schema v1)</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: THEME.subtle, textTransform: "uppercase", fontWeight: 600 }}>Worker Yaşam Döngüsü</div>
              <div style={{ fontSize: 12.5, color: THEME.green, fontWeight: 600, marginTop: 3 }}>✓ PASS (exit 0)</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: THEME.subtle, textTransform: "uppercase", fontWeight: 600 }}>JSONL İletişim Protokolü</div>
              <div style={{ fontSize: 12.5, color: THEME.green, fontWeight: 600, marginTop: 3 }}>✓ PASS (stdio)</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: THEME.subtle, textTransform: "uppercase", fontWeight: 600 }}>Model Gateway İzolasyonu</div>
              <div style={{ fontSize: 12.5, color: THEME.cyan, fontWeight: 600, marginTop: 3 }}>✓ Kilitli</div>
            </div>
          </div>

          <div className="arena-card">
            <div className="arena-card-header" style={{ backgroundColor: THEME.panelAlt }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "code" as const, label: "skeleton/main.py" },
                  { id: "manifest" as const, label: "manifest.yaml" },
                  { id: "docker" as const, label: "Dockerfile" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`arena-btn ${activeTab === tab.id ? "arena-btn-primary" : ""}`}
                    style={{ padding: "5px 11px", fontSize: 11.5 }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span
                style={{
                  fontSize: 11,
                  color: THEME.green,
                  background: "rgba(52, 211, 153, 0.12)",
                  padding: "3px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(52, 211, 153, 0.35)",
                  fontWeight: 600,
                }}
              >
                Dondurulmuş Aday
              </span>
            </div>

            <pre
              className="arena-mono"
              style={{
                margin: 0,
                padding: 18,
                backgroundColor: "#090d14",
                fontSize: 12,
                color: THEME.text,
                overflowX: "auto",
                lineHeight: 1.6,
              }}
            >
              {activeTab === "code" &&
                `"""${selectedFw} için yerel pipeline worker modülü."""
import sys
from arena_worker_sdk.protocol import read_contract_input, emit_event

def main():
    # Stdio üzerinden kanonik girdi ve araç yetkilerini oku
    contract_data = read_contract_input()
    emit_event("pipeline.start", framework="${selectedFw}", task_id=contract_data["task_id"])

    # Kilitli Model Gateway üzerinden yerel ajan döngüsünü çalıştır
    print(f"${selectedFw} çalışma zamanı üzerinde yerel akış yürütülüyor...", file=sys.stderr)

    # Sonuç ve çıkarılan çelişkileri stdio JSONL ile bildir
    emit_event("pipeline.finish", status="completed", conflicts_found=2, valid_schema=1.0)

if __name__ == "__main__":
    main()`}
              {activeTab === "manifest" &&
                `schema_version: 1
framework: "${selectedFw}"
version: "${FRAMEWORKS_DATA.find((f) => f.name === selectedFw)?.version || "1.0.0"}"
entrypoint: "python skeleton/main.py"
execution_mode: "subprocess_stdio"
conformance:
  smoke_test: "passed"
  manifest_valid: true
  protocol_version: "2.1"`}
              {activeTab === "docker" &&
                `FROM python:3.11-slim
WORKDIR /workspace
COPY pyproject.toml .
RUN pip install --no-cache-dir .
COPY . .
ENTRYPOINT ["python", "skeleton/main.py"]`}
            </pre>
          </div>
        </div>
      </div>
      <EvaluationMetrics selectedFramework={selectedFw} />
    </div>
  );
}
