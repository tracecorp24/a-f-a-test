import { useState } from "react";
import { THEME } from "../data/mockData";
import { KVRow, PageHeader, SvgNode } from "../components/UI";

const COMM_LINKS: [string, string, number, number, number][] = [
  ["Planlayıcı", "Araştırmacı", 5, 1200, 2],
  ["Planlayıcı", "Analizci", 3, 820, 1],
  ["Araştırmacı", "Analizci", 7, 2400, 2],
  ["Araştırmacı", "Doğrulayıcı", 3, 400, 1],
  ["Analizci", "Doğrulayıcı", 4, 980, 1],
  ["Planlayıcı", "Doğrulayıcı", 2, 100, 1],
];

export function TelemetryCenterPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const getAgentMetrics = (name: string) => {
    const send = COMM_LINKS.filter((x) => x[0] === name);
    const recv = COMM_LINKS.filter((x) => x[1] === name);
    const sum = (arr: [string, string, number, number, number][], idx: 2 | 3 | 4) =>
      arr.reduce((s, x) => s + x[idx], 0);
    return {
      sent: sum(send, 2),
      recv: sum(recv, 2),
      outTok: sum(send, 3),
      inTok: sum(recv, 3),
      handoffs: sum(send, 4),
    };
  };

  const agentStats = selectedAgent ? getAgentMetrics(selectedAgent) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        eyebrow="AJANLAR ARASI İLETİŞİM TELEMETRİSİ"
        title="Telemetri Merkezi"
        description="Ajanlar arası mesaj trafiği, el sıkışmalar (handoff) ve kanonik token aktarım analizi."
        right={
          <div className="arena-status-bar">
            <span><strong style={{ color: THEME.text }}>24</strong> Mesaj</span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.purple }}>8 Handoff</span>
            <span style={{ color: THEME.line }}>|</span>
            <span className="arena-mono" style={{ color: THEME.green }}>5.9K İletişim Tokenı</span>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.35fr) minmax(260px, 1fr)", gap: 18 }}>
        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">İletişim ve Token Akış Grafiği</h2>
            <span style={{ fontSize: 11.5, color: THEME.cyan }}>Çizgi Kalınlığı = Mesaj Hacmi</span>
          </div>

          <div
            style={{
              backgroundColor: THEME.panelAlt,
              backgroundImage: "radial-gradient(#243244 0.8px, transparent 0.8px)",
              backgroundSize: "18px 18px",
              padding: 14,
            }}
          >
            <svg viewBox="0 0 900 410" style={{ display: "block", width: "100%", height: "auto" }}>
              <defs>
                <marker id="arrowComm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                </marker>
              </defs>

              <path d="M380 95 C340 125 230 120 170 165" fill="none" stroke={THEME.cyan} strokeWidth="3" markerEnd="url(#arrowComm)" />
              <rect x="195" y="104" width="112" height="19" rx="4" fill="#0d131d" />
              <text x="251" y="117" textAnchor="middle" fill="#94a3b8" fontSize={11}>5 mesaj · 1.2K</text>

              <path d="M540 95 C580 125 710 120 740 165" fill="none" stroke={THEME.cyan} strokeWidth="2" markerEnd="url(#arrowComm)" />
              <rect x="592" y="104" width="112" height="19" rx="4" fill="#0d131d" />
              <text x="648" y="117" textAnchor="middle" fill="#94a3b8" fontSize={11}>3 mesaj · 820</text>

              <path d="M250 195 H660" fill="none" stroke={THEME.cyan} strokeWidth="5" markerEnd="url(#arrowComm)" />
              <rect x="402" y="171" width="112" height="19" rx="4" fill="#0d131d" />
              <text x="458" y="184" textAnchor="middle" fill="#94a3b8" fontSize={11}>7 mesaj · 2.4K</text>

              <path d="M170 225 C210 280 340 275 420 310" fill="none" stroke={THEME.cyan} strokeWidth="2" markerEnd="url(#arrowComm)" />
              <rect x="207" y="255" width="112" height="19" rx="4" fill="#0d131d" />
              <text x="263" y="268" textAnchor="middle" fill="#94a3b8" fontSize={11}>3 mesaj · 400</text>

              <path d="M740 225 C700 280 560 275 500 310" fill="none" stroke={THEME.cyan} strokeWidth="3" markerEnd="url(#arrowComm)" />
              <rect x="592" y="255" width="112" height="19" rx="4" fill="#0d131d" />
              <text x="648" y="268" textAnchor="middle" fill="#94a3b8" fontSize={11}>4 mesaj · 980</text>

              <path d="M460 95 V310" fill="none" stroke={THEME.cyan} strokeWidth="1.5" markerEnd="url(#arrowComm)" />
              <rect x="459" y="258" width="112" height="19" rx="4" fill="#0d131d" />
              <text x="515" y="271" textAnchor="middle" fill="#94a3b8" fontSize={11}>2 mesaj · 100</text>

              <SvgNode x={380} y={35} w={160} h={60} icon="◇" title="Planlayıcı" sub="Ajan" selected={selectedAgent === "Planlayıcı"} onClick={() => setSelectedAgent("Planlayıcı")} />
              <SvgNode x={90} y={165} w={160} h={60} icon="⌕" title="Araştırmacı" sub="Ajan" selected={selectedAgent === "Araştırmacı"} onClick={() => setSelectedAgent("Araştırmacı")} />
              <SvgNode x={660} y={165} w={160} h={60} icon="≋" title="Analizci" sub="Ajan" selected={selectedAgent === "Analizci"} onClick={() => setSelectedAgent("Analizci")} />
              <SvgNode x={380} y={310} w={160} h={60} icon="✓" title="Doğrulayıcı" sub="Ajan" selected={selectedAgent === "Doğrulayıcı"} onClick={() => setSelectedAgent("Doğrulayıcı")} />
            </svg>
          </div>
        </section>

        <section className="arena-card">
          <div className="arena-card-header">
            <h2 className="arena-card-title">Ajan Detay Analizi</h2>
            {selectedAgent && (
              <button onClick={() => setSelectedAgent(null)} className="arena-btn" style={{ padding: "4px 10px", fontSize: 11 }}>
                Sıfırla
              </button>
            )}
          </div>
          <div style={{ padding: 18 }}>
            {selectedAgent && agentStats ? (
              <div>
                <div className="arena-eyebrow" style={{ marginBottom: 3 }}>Seçili Ajan</div>
                <div style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 12px" }}>{selectedAgent}</div>
                <KVRow label="Gönderilen Mesaj" value={agentStats.sent} />
                <KVRow label="Alınan Mesaj" value={agentStats.recv} />
                <KVRow label="Giden Token" value={agentStats.outTok.toLocaleString()} />
                <KVRow label="Gelen Token" value={agentStats.inTok.toLocaleString()} />
                <KVRow label="Aktarılan Handoff" value={agentStats.handoffs} />
              </div>
            ) : (
              <div>
                <div className="arena-eyebrow" style={{ marginBottom: 3 }}>Ağ Özeti</div>
                <div style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 6px" }}>4 Ajan Topolojisi</div>
                <p style={{ fontSize: 12.5, color: THEME.muted, margin: "0 0 14px", lineHeight: 1.5 }}>
                  Çizgedeki herhangi bir ajana tıklayarak özel mesaj ve token akışını görebilirsiniz.
                </p>
                <KVRow label="Toplam Mesaj" value="24" />
                <KVRow label="Toplam Handoff" value="8" />
                <KVRow label="Trafik Tokenı" value="5,900" />
                <KVRow label="Ort. Mesaj Boyutu" value="246 token" />
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="arena-card">
        <div className="arena-card-header">
          <h2 className="arena-card-title">İletişim Trafiği Matrisi</h2>
          <span style={{ fontSize: 11.5, color: THEME.muted }}>Ajan çiftleri bazında toplanmış istatistikler</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="arena-table">
            <thead>
              <tr>
                <th>Kaynak Ajan</th>
                <th>Hedef Ajan</th>
                <th>Mesaj Sayısı</th>
                <th>Token Hacmi</th>
                <th>Handoff Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {COMM_LINKS.map((link, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{link[0]}</td>
                  <td>{link[1]}</td>
                  <td className="arena-mono" style={{ fontWeight: 600, color: THEME.cyan }}>{link[2]}</td>
                  <td className="arena-mono">{link[3]}</td>
                  <td className="arena-mono" style={{ color: THEME.purple, fontWeight: 600 }}>{link[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
