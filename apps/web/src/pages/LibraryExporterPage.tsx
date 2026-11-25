import { useState } from "react";
import { THEME } from "../data/mockData";
import { PageHeader } from "../components/UI";

export function LibraryExporterPage() {
  const [downloaded, setDownloaded] = useState(false);
  const [exportFormat, setExportFormat] = useState<"zip" | "docker" | "poetry">("zip");

  return (
    <div>
      <PageHeader
        eyebrow="ADR-0009 VE ADR-0010 SECRET-FREE DIŞA AKTARIM"
        title="Proje Dışa Aktarımı ve Çıktılar"
        description="Kazanan pipeline'ın platform bağımlılığı ve gizli anahtar içermeyen taşınabilir bağımsız paketi."
        right={
          <div className="arena-status-bar">
            <span style={{ color: THEME.green }}>✓ Secret-Free Denetlendi</span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.cyan }}>Sıfır Platform Bağımlılığı</span>
          </div>
        }
      />

      <div className="arena-grid-2-asym">
        <div className="arena-card arena-card-pad">
          <div style={{ display: "flex", gap: 8, marginBottom: 18, borderBottom: `1px solid ${THEME.line}`, paddingBottom: 14, flexWrap: "wrap" }}>
            {[
              { id: "zip" as const, label: "📦 Bağımsız Zip" },
              { id: "docker" as const, label: "🐳 Docker Paketi" },
              { id: "poetry" as const, label: "🐍 Python Paketi" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setExportFormat(tab.id)}
                className={`arena-btn ${exportFormat === tab.id ? "arena-btn-primary" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.cyan, margin: "0 0 8px" }}>
            arena-export-langgraph.zip (Kazanan Aday Paketi)
          </h3>
          <p style={{ fontSize: 12.5, color: THEME.muted, lineHeight: 1.6, margin: "0 0 18px" }}>
            Bu paket hiçbir Arena kütüphanesine veya platform gizli anahtarına bağımlı değildir. Bağımsız Docker ortamında veya temiz bir Python sanal ortamında doğrudan çalıştırılabilir.
          </p>

          <div
            className="arena-mono"
            style={{
              backgroundColor: THEME.panelAlt,
              borderRadius: 8,
              padding: 16,
              fontSize: 12,
              color: THEME.text,
              marginBottom: 20,
              border: `1px solid ${THEME.line}`,
              lineHeight: 1.9,
            }}
          >
            <div>📄 README.md (Bağımsız çalıştırma talimatı ve ortam değişkenleri)</div>
            <div>🐳 Dockerfile (Minimal bağımsız container tanımı)</div>
            <div>📦 pyproject.toml (Yalnızca LangGraph ve resmi bağımlılıkları)</div>
            <div>🐍 main.py (Dondurulmuş yerel pipeline kodu)</div>
            <div>🔒 .env.example (Model sağlayıcısı için boş şablon — API anahtarı içermez)</div>
          </div>

          <button onClick={() => setDownloaded(true)} className="arena-btn arena-btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>
            {downloaded ? "✓ Paket İndirildi (Zip Hazır)" : "Bağımsız Projeyi İndir"}
          </button>
        </div>

        <div className="arena-card arena-card-pad">
          <h4 style={{ fontSize: 12.5, color: THEME.muted, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Dışa Aktarım Geçmişi ve Doğrulama
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
            <div style={{ backgroundColor: THEME.panelAlt, padding: 12, borderRadius: 8, border: `1px solid ${THEME.lineSubtle}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <b style={{ color: THEME.text }}>arena-export-langgraph.zip</b>
                <span className="arena-mono" style={{ color: THEME.green }}>✓ SHA256 OK</span>
              </div>
              <div className="arena-mono" style={{ fontSize: 11, color: THEME.muted }}>
                2026-11-24 10:25 · 48.2 KB · 0 gizli anahtar bulundu
              </div>
            </div>

            <div style={{ backgroundColor: THEME.panelAlt, padding: 12, borderRadius: 8, border: `1px solid ${THEME.lineSubtle}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <b style={{ color: THEME.text }}>arena-export-agno.zip</b>
                <span className="arena-mono" style={{ color: THEME.green }}>✓ SHA256 OK</span>
              </div>
              <div className="arena-mono" style={{ fontSize: 11, color: THEME.muted }}>
                2026-11-23 16:50 · 42.1 KB · 0 gizli anahtar bulundu
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: 14, borderRadius: 8, backgroundColor: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.25)" }}>
            <div style={{ color: THEME.green, fontWeight: 600, fontSize: 12, marginBottom: 5 }}>
              ✓ ADR-0009 İzolasyon Garantisi
            </div>
            <div style={{ color: THEME.muted, fontSize: 12, lineHeight: 1.55 }}>
              Platform dışa aktarılan paketleri AST düzeyinde tarar. Hiçbir sabit kodlu API anahtarı, dahili paket referansı veya özel günlük içermez.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
