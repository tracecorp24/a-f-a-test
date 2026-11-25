import { useState } from "react";
import { THEME } from "../data/mockData";
import { KVRow, PageHeader, SvgNode } from "../components/UI";

const NODE_INFO: Record<string, [string, string, string, string, string]> = {
  "Kullanıcı Görevi": ["Kullanıcıdan gelen ham görev girdisini ayrıştırır.", "Tamamlandı", "145", "0.18 sn", "Yok"],
  "Planlayıcı": ["Görev için dinamik alt adımlar ve rota planı üretir.", "Tamamlandı", "1,326", "0.91 sn", "Yok"],
  "Araştırmacı": ["Dış araçları (Search, Read) kullanarak kanıt toplar.", "Çalışıyor", "4,218", "2.14 sn", "Search, DocumentReader"],
  "Analizci": ["Toplanan bilgileri karşılaştırıp çelişkileri çıkarır.", "Kuyrukta", "—", "—", "DiffCalculator"],
  "Doğrulayıcı": ["Çıktıyı JSON Schema ve F1 kabul eşiğine göre doğrular.", "Kuyrukta", "—", "—", "SchemaVerifier"],
  "Son Çıktı": ["Onaylanan kanonik yanıtı paketleyip teslim eder.", "Kuyrukta", "—", "—", "Yok"],
};

export function PipelineDesignerPage() {
  const [selectedNode, setSelectedNode] = useState("Araştırmacı");
  const [isPaused, setIsPaused] = useState(false);

  const fallbackData: [string, string, string, string, string] = [
    "Dış araçları kullanarak kanıt toplar.",
    "Çalışıyor",
    "4,218",
    "2.14 sn",
    "Search, DocumentReader",
  ];
  const nodeData = NODE_INFO[selectedNode] ?? fallbackData;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        eyebrow="İŞ AKIŞI TOPOLOJİSİ VE YÖNLENDİRME"
        title="Pipeline Tasarımcısı"
        description="Ajan iş akışı, paralel dallanma, geri besleme döngüleri ve düğüm durum denetleyicisi."
        right={
          <>
            <div className="arena-status-bar">
              <span><strong style={{ color: THEME.text }}>6</strong> Düğüm</span>
              <span style={{ color: THEME.line }}>|</span>
              <span style={{ color: THEME.cyan }}>● 1 Aktif</span>
              <span style={{ color: THEME.line }}>|</span>
              <span style={{ color: THEME.green }}>● 2 Tamamlandı</span>
              <span style={{ color: THEME.line }}>|</span>
              <span className="arena-mono">12.8K Token</span>
            </div>
            <button onClick={() => setIsPaused(!isPaused)} className="arena-btn arena-btn-primary">
              {isPaused ? "▶ Sürdür" : "❚❚ Duraklat"}
            </button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.35fr) minmax(270px, 1fr)", gap: 18 }}>
        {/* SVG Çizge Alanı */}
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">Yerel İş Akışı Çizgesi</h2>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: isPaused ? THEME.amber : THEME.cyan, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: isPaused ? THEME.amber : THEME.cyan }} />
              {isPaused ? "Duraklatıldı" : "Çalışıyor (Canlı)"}
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
            <svg viewBox="0 0 980 375" style={{ display: "block", width: "100%", height: "auto", minHeight: 270 }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                </marker>
              </defs>

              <path d="M165 180 H210" fill="none" stroke="#52768b" strokeWidth="1.6" markerEnd="url(#arrow)" />
              <path
                d="M345 180 H370 V95 H395"
                fill="none"
                stroke={THEME.cyan}
                strokeWidth="2"
                strokeDasharray={isPaused ? "none" : "7 6"}
                markerEnd="url(#arrow)"
              />
              <path d="M345 180 H370 V265 H395" fill="none" stroke="#52768b" strokeWidth="1.6" markerEnd="url(#arrow)" />
              <path d="M545 95 H575 V180 H605" fill="none" stroke="#52768b" strokeWidth="1.6" markerEnd="url(#arrow)" />
              <path d="M545 265 H575 V180 H605" fill="none" stroke="#52768b" strokeWidth="1.6" markerEnd="url(#arrow)" />
              <path d="M750 180 H810" fill="none" stroke="#52768b" strokeWidth="1.6" markerEnd="url(#arrow)" />
              <path d="M677 150 V30 H470 V65" fill="none" stroke={THEME.purple} strokeDasharray="5 5" strokeWidth="1.6" markerEnd="url(#arrow)" />
              <text x="570" y="23" fill="#94a3b8" fontSize="11">
                Doğrulama başarısız olursa tekrar dene (Tekrar Deneme Döngüsü)
              </text>

              <SvgNode x={30} y={150} w={135} h={60} icon="↳" title="Kullanıcı Görevi" sub="Girdi" status="complete" selected={selectedNode === "Kullanıcı Görevi"} onClick={() => setSelectedNode("Kullanıcı Görevi")} />
              <SvgNode x={210} y={150} w={135} h={60} icon="◇" title="Planlayıcı" sub="Ajan" status="complete" selected={selectedNode === "Planlayıcı"} onClick={() => setSelectedNode("Planlayıcı")} />
              <SvgNode x={395} y={65} w={150} h={60} icon="⌕" title="Araştırmacı" sub="Ajan (Aktif)" status="running" selected={selectedNode === "Araştırmacı"} onClick={() => setSelectedNode("Araştırmacı")} />
              <SvgNode x={395} y={235} w={150} h={60} icon="≋" title="Analizci" sub="Ajan" status="queued" selected={selectedNode === "Analizci"} onClick={() => setSelectedNode("Analizci")} />
              <SvgNode x={605} y={150} w={145} h={60} icon="✓" title="Doğrulayıcı" sub="Dual-Gate" status="queued" selected={selectedNode === "Doğrulayıcı"} onClick={() => setSelectedNode("Doğrulayıcı")} />
              <SvgNode x={810} y={150} w={140} h={60} icon="↗" title="Son Çıktı" sub="Paket Çıktı" status="queued" selected={selectedNode === "Son Çıktı"} onClick={() => setSelectedNode("Son Çıktı")} />
            </svg>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", color: THEME.muted, fontSize: 11.5, padding: "11px 16px", borderTop: `1px solid ${THEME.line}` }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.green, marginRight: 6 }} />Tamamlandı</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.cyan, marginRight: 6 }} />Çalışıyor</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.muted, marginRight: 6 }} />Kuyrukta</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.purple, marginRight: 6 }} />Geri Dönüş Yolu</span>
          </div>
        </section>

        {/* Düğüm Denetleyicisi */}
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">Düğüm Denetleyicisi</h2>
          </div>
          <div style={{ padding: 18 }}>
            <div className="arena-eyebrow" style={{ marginBottom: 3 }}>Seçili Düğüm</div>
            <div style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 6px" }}>{selectedNode}</div>
            <p style={{ fontSize: 12.5, color: THEME.muted, margin: "0 0 14px", lineHeight: 1.5 }}>{nodeData[0]}</p>

            <KVRow
              label="Durum"
              value={nodeData[1]}
              color={nodeData[1] === "Tamamlandı" ? THEME.green : nodeData[1] === "Çalışıyor" ? THEME.cyan : THEME.muted}
            />
            <KVRow label="Kilitli Model" value="gemini-1.5-pro" />
            <KVRow label="Kullanılan Token" value={nodeData[2]} />
            <KVRow label="Geçen Süre" value={nodeData[3]} />
            <KVRow label="Erişilen Araçlar" value={nodeData[4]} />

            <div style={{ color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 10.5, margin: "16px 0 6px", fontWeight: 700 }}>
              Çalışma Zamanı Kısıtları
            </div>
            <div style={{ fontSize: 11.5, border: `1px solid ${THEME.line}`, borderRadius: 6, padding: "7px 10px", color: THEME.muted, backgroundColor: THEME.panelAlt }}>
              Ortak Model Gateway · ADR-0003 Model Kilidi
            </div>
          </div>
        </section>
      </div>

      {/* Çalışma İzi Tablosu */}
      <section className="arena-card">
        <div className="arena-card-header">
          <h2 className="arena-card-title">Çalışma İzi Günlüğü</h2>
          <span className="arena-mono" style={{ fontSize: 11, color: THEME.muted }}>
            Çalıştırma #042 · Canlı Olay Akışı
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="arena-table">
            <thead>
              <tr>
                <th>Zaman Damgası</th>
                <th>Düğüm</th>
                <th>Olay</th>
                <th>Token</th>
                <th>Süre</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="arena-mono">10:24:31.102</td>
                <td style={{ fontWeight: 600 }}>Kullanıcı Görevi</td>
                <td style={{ color: THEME.green }}>● Tamamlandı</td>
                <td className="arena-mono">145</td>
                <td className="arena-mono">0.18 sn</td>
              </tr>
              <tr>
                <td className="arena-mono">10:24:32.015</td>
                <td style={{ fontWeight: 600 }}>Planlayıcı</td>
                <td style={{ color: THEME.green }}>● Tamamlandı</td>
                <td className="arena-mono">1,326</td>
                <td className="arena-mono">0.91 sn</td>
              </tr>
              <tr>
                <td className="arena-mono">10:24:33.240</td>
                <td style={{ fontWeight: 600 }}>Araştırmacı</td>
                <td style={{ color: THEME.cyan }}>● Çalışıyor (Araç G/Ç)</td>
                <td className="arena-mono">4,218</td>
                <td className="arena-mono">2.14 sn</td>
              </tr>
              <tr>
                <td className="arena-mono" style={{ color: THEME.muted }}>—</td>
                <td style={{ fontWeight: 600, color: THEME.muted }}>Analizci</td>
                <td style={{ color: THEME.muted }}>● Beklemede</td>
                <td style={{ color: THEME.muted }}>—</td>
                <td style={{ color: THEME.muted }}>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
