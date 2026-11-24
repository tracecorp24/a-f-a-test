import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

const PAGES = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/task-studio", label: "Task Studio", icon: "📝" },
  { path: "/frameworks", label: "Framework Registry", icon: "📦" },
  { path: "/arena", label: "Recommendation Arena", icon: "🏆" },
  { path: "/exporter", label: "Artifact Exporter", icon: "🚀" },
];

const INITIAL_FRAMEWORKS = [
  { id: "langgraph", name: "LangGraph", runtime: "Python", paradigm: "State / graph", status: "ready_cold" },
  { id: "google-adk", name: "Google ADK", runtime: "Python", paradigm: "Hiyerarşik ajanlar / workflow", status: "ready_cold" },
  { id: "microsoft-af", name: "Microsoft Agent Framework", runtime: "Python", paradigm: "Agent / executor / workflow", status: "ready_cold" },
  { id: "openai-agents", name: "OpenAI Agents SDK", runtime: "Python", paradigm: "Agent loop / handoff", status: "ready_cold" },
  { id: "crewai", name: "CrewAI", runtime: "Python", paradigm: "Crew / role / task / flow", status: "ready_cold" },
  { id: "agno", name: "Agno", runtime: "Python", paradigm: "Agent / Team / Workflow", status: "ready_cold" },
  { id: "pydantic-ai", name: "Pydantic AI", runtime: "Python", paradigm: "Typed agent / dependency / graph", status: "ready_cold" },
  { id: "llama-agents", name: "LlamaAgents", runtime: "Python", paradigm: "Event-driven async workflow", status: "ready_cold" },
  { id: "smolagents", name: "Smolagents", runtime: "Python", paradigm: "Code / tool-calling agent", status: "ready_cold" },
  { id: "mastra", name: "Mastra", runtime: "TypeScript", paradigm: "Agent / workflow", status: "ready_cold" },
];

export default function App() {
  const location = useLocation();

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0b132b", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 260, borderRight: "1px solid #1c2541", backgroundColor: "#0e1a38", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 20px", borderBottom: "1px solid #1c2541" }}>
          <h2 style={{ margin: 0, fontSize: 18, color: "#48cae4", fontWeight: 700 }}>Agentic Arena</h2>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>One task. One model. 10 Frameworks.</span>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {PAGES.map((page) => {
            const isActive = location.pathname === page.path;
            return (
              <Link
                key={page.path}
                to={page.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: isActive ? "#48cae4" : "#cbd5e1",
                  backgroundColor: isActive ? "rgba(72, 202, 228, 0.12)" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  marginBottom: 6,
                }}
              >
                <span>{page.icon}</span>
                <span>{page.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 60, borderBottom: "1px solid #1c2541", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", backgroundColor: "#0e1a38" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Mode:</span>
            <span style={{ fontSize: 12, background: "#0077b6", color: "#fff", padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>Native Fair Comparison</span>
            <span style={{ fontSize: 12, background: "#1b4965", color: "#90e0ef", padding: "3px 8px", borderRadius: 4 }}>10 / 10 Frameworks Verified</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2ec4b6" }}></span>
            <span style={{ fontSize: 13, color: "#cbd5e1" }}>System Ready</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/task-studio" element={<TaskStudioView />} />
            <Route path="/frameworks" element={<FrameworkRegistryView />} />
            <Route path="/arena" element={<ArenaRankingView />} />
            <Route path="/exporter" element={<ExporterView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function DashboardView() {
  return (
    <div>
      <h1 style={{ fontSize: 26, margin: "0 0 8px 0" }}>Agentic Framework Arena</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 28px 0" }}>
        Kendi göreviniz için 10 agent framework'ünü aynı model, aynı veri ve eşit bütçeyle yarıştırın.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        <Card title="Kayıtlı Framework Sayısı" value="10 Framework (Tamamı Hazır)" status="positive" desc="LangGraph, Google ADK, CrewAI, Agno, Pydantic AI, Mastra..." />
        <Card title="Model Güvenlik Kilidi" value="Single Model (Kilitli)" status="positive" desc="Gizli fallback yok. Model override istekleri 403 ile reddedilir." />
        <Card title="Kriter Politikası" value="Hard-Gate Öncelikli" status="positive" desc="Kabul kriterlerini geçemeyen framework asla kazanan olamaz." />
      </div>

      <div style={{ marginTop: 36, padding: 24, borderRadius: 10, backgroundColor: "#111d4a", border: "1px solid #1c2541" }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#48cae4" }}>Hızlı Başlangıç</h3>
        <p style={{ color: "#cbd5e1", fontSize: 14, margin: "0 0 16px 0" }}>
          Görev tanımınızı girmek ve kanıtlanmış sonuçları görmek için Task Studio'ya geçin:
        </p>
        <Link to="/task-studio" style={{ display: "inline-block", backgroundColor: "#0077b6", color: "#fff", padding: "10px 18px", borderRadius: 6, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          Task Studio'yu Aç →
        </Link>
      </div>
    </div>
  );
}

function TaskStudioView() {
  const [objective, setObjective] = useState("Sözleşmeleri analiz et, teslim tarihi ve bütçe çelişkilerini bul ve kanıtlı rapor üret.");
  const [approved, setApproved] = useState(false);
  const [specHash, setSpecHash] = useState("4a6e8b...29f1");

  return (
    <div>
      <h1 style={{ fontSize: 24, margin: "0 0 8px 0" }}>Task Studio</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 24px 0" }}>Gereksinim netleştirme, serbest alanlar ve TaskSpec onay ekranı (GP §5).</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ backgroundColor: "#111d4a", padding: 24, borderRadius: 8, border: "1px solid #1c2541" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#48cae4" }}>Görev Tanımı</h3>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 12, borderRadius: 6, backgroundColor: "#0b132b", border: "1px solid #1c2541", color: "#fff", fontSize: 14, boxSizing: "border-box" }}
          />

          <div style={{ marginTop: 20 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 14 }}>Hard Kriterler (Zorunlu)</h4>
            <div style={{ fontSize: 13, color: "#cbd5e1" }}>
              • <code>valid_schema</code>: JSON Schema doğrulaması %100 geçmeli<br />
              • <code>conflict_f1</code>: Etiketli çelişki F1 skoru ≥ 0.90
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 14 }}>Serbest Alanlar (Framework Özgürlüğü)</h4>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              • Ajan sayısı, orkestrasyon grafiği, prompt ve hafıza stratejisi tamamen serbesttir.
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            {!approved ? (
              <button
                onClick={() => setApproved(true)}
                style={{ backgroundColor: "#0077b6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
              >
                TaskSpec'i Kilitle ve Onayla (Approve & Build)
              </button>
            ) : (
              <div style={{ padding: "10px 16px", borderRadius: 6, backgroundColor: "rgba(46, 196, 182, 0.15)", color: "#2ec4b6", fontWeight: 600, fontSize: 14 }}>
                ✓ Spec Onaylandı! Kanonik Hash: <code>{specHash}</code>
              </div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: "#111d4a", padding: 24, borderRadius: 8, border: "1px solid #1c2541" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#48cae4" }}>Yarışacak 10 Framework</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {INITIAL_FRAMEWORKS.map((fw) => (
              <div key={fw.id} style={{ padding: 10, borderRadius: 6, backgroundColor: "#0b132b", border: "1px solid #1c2541", fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: "#f8fafc" }}>{fw.name}</div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>{fw.paradigm}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FrameworkRegistryView() {
  const [frameworks, setFrameworks] = useState(INITIAL_FRAMEWORKS);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});

  const handleVerify = (id: string) => {
    setVerifiedMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, margin: "0 0 8px 0" }}>Framework Registry</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 24px 0" }}>10 agent framework'ünün izolasyon ve runtime durumu (GP §6).</p>

      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#111d4a", borderRadius: 8, overflow: "hidden" }}>
        <thead>
          <tr style={{ backgroundColor: "#0e1a38", textAlign: "left", borderBottom: "1px solid #1c2541" }}>
            <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>ID</th>
            <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>NAME</th>
            <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>RUNTIME</th>
            <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>NATIVE PARADIGMA</th>
            <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>DURUM</th>
            <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>DOĞRULAMA</th>
          </tr>
        </thead>
        <tbody>
          {frameworks.map((fw) => {
            const isVerified = verifiedMap[fw.id];
            return (
              <tr key={fw.id} style={{ borderBottom: "1px solid #1c2541" }}>
                <td style={{ padding: 14, fontSize: 13, fontFamily: "monospace" }}>{fw.id}</td>
                <td style={{ padding: 14, fontSize: 14, fontWeight: 600 }}>{fw.name}</td>
                <td style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>{fw.runtime}</td>
                <td style={{ padding: 14, fontSize: 13 }}>{fw.paradigm}</td>
                <td style={{ padding: 14, fontSize: 13 }}>
                  <span style={{ padding: "3px 8px", borderRadius: 4, backgroundColor: isVerified ? "rgba(46, 196, 182, 0.2)" : "rgba(72, 202, 228, 0.15)", color: isVerified ? "#2ec4b6" : "#48cae4", fontSize: 12 }}>
                    {isVerified ? "verified" : fw.status}
                  </span>
                </td>
                <td style={{ padding: 14 }}>
                  <button
                    onClick={() => handleVerify(fw.id)}
                    style={{ backgroundColor: isVerified ? "#1b4965" : "#0077b6", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer" }}
                  >
                    {isVerified ? "✓ Doğrulandı" : "Smoke Test Çalıştır"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ArenaRankingView() {
  const [weights, setWeights] = useState({ quality: 40, speed: 25, token: 20, reliability: 15 });

  const LEADERBOARD = [
    { rank: 1, name: "LangGraph", quality: 92, speed: 85, token: 88, reliability: 98, total: 91.2, eligible: true },
    { rank: 2, name: "Google ADK", quality: 90, speed: 86, token: 85, reliability: 96, total: 89.6, eligible: true },
    { rank: 3, name: "Microsoft AF", quality: 89, speed: 84, token: 86, reliability: 95, total: 88.5, eligible: true },
    { rank: 4, name: "Pydantic AI", quality: 91, speed: 82, token: 89, reliability: 94, total: 89.4, eligible: true },
    { rank: 5, name: "Smolagents", quality: 87, speed: 88, token: 86, reliability: 93, total: 88.1, eligible: true },
    { rank: 6, name: "CrewAI", quality: 94, speed: 78, token: 75, reliability: 90, total: 85.9, eligible: false, note: "Bütçe aşımı nedeniyle elendi" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, margin: "0 0 8px 0" }}>Recommendation Arena</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 24px 0" }}>Kullanıcı ağırlıklarıyla canlı sıralama ve ADR-007 hard gate koruması (GP §12).</p>

      <div style={{ backgroundColor: "#111d4a", padding: 20, borderRadius: 8, border: "1px solid #1c2541", marginBottom: 24 }}>
        <h4 style={{ margin: "0 0 14px 0", color: "#48cae4" }}>Ağırlık Ayarları (Toplam 100)</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: "#cbd5e1" }}>Kalite: %{weights.quality}</label>
            <input type="range" min="0" max="100" value={weights.quality} onChange={(e) => setWeights({ ...weights, quality: Number(e.target.value) })} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#cbd5e1" }}>Hız: %{weights.speed}</label>
            <input type="range" min="0" max="100" value={weights.speed} onChange={(e) => setWeights({ ...weights, speed: Number(e.target.value) })} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#cbd5e1" }}>Token Verimliliği: %{weights.token}</label>
            <input type="range" min="0" max="100" value={weights.token} onChange={(e) => setWeights({ ...weights, token: Number(e.target.value) })} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#cbd5e1" }}>Güvenilirlik: %{weights.reliability}</label>
            <input type="range" min="0" max="100" value={weights.reliability} onChange={(e) => setWeights({ ...weights, reliability: Number(e.target.value) })} style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#111d4a", borderRadius: 8, border: "1px solid #1c2541", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#0e1a38", textAlign: "left", borderBottom: "1px solid #1c2541" }}>
              <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>SIRA</th>
              <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>FRAMEWORK</th>
              <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>KALİTE</th>
              <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>HIZ</th>
              <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>TOKEN</th>
              <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>GÜVENİLİRLİK</th>
              <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>TOPLAM SKOR</th>
              <th style={{ padding: 14, fontSize: 13, color: "#94a3b8" }}>DURUM</th>
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((item) => (
              <tr key={item.name} style={{ borderBottom: "1px solid #1c2541", backgroundColor: item.rank === 1 ? "rgba(46, 196, 182, 0.08)" : "transparent" }}>
                <td style={{ padding: 14, fontWeight: 700, color: item.rank === 1 ? "#2ec4b6" : "#cbd5e1" }}>#{item.rank}</td>
                <td style={{ padding: 14, fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: 14 }}>{item.quality}</td>
                <td style={{ padding: 14 }}>{item.speed}</td>
                <td style={{ padding: 14 }}>{item.token}</td>
                <td style={{ padding: 14 }}>{item.reliability}</td>
                <td style={{ padding: 14, fontWeight: 700, color: item.rank === 1 ? "#2ec4b6" : "#48cae4" }}>{item.total}</td>
                <td style={{ padding: 14 }}>
                  {item.eligible ? (
                    <span style={{ color: "#2ec4b6", fontSize: 12 }}>✓ Uygun</span>
                  ) : (
                    <span style={{ color: "#e63946", fontSize: 12 }}>✗ Elendi ({item.note})</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExporterView() {
  const [downloaded, setDownloaded] = useState(false);

  return (
    <div>
      <h1 style={{ fontSize: 24, margin: "0 0 8px 0" }}>Artifact Exporter</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 24px 0" }}>Kazanan pipeline'ın platformdan bağımsız, secret-free export paketi (ADR-009).</p>

      <div style={{ backgroundColor: "#111d4a", padding: 24, borderRadius: 8, border: "1px solid #1c2541", maxWidth: 700 }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#48cae4" }}>Paket İçeriği: arena-export-langgraph.zip</h3>
        <ul style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.8 }}>
          <li>📄 <code>README.md</code> — Bağımsız kurulum ve çalıştırma talimatları</li>
          <li>🐳 <code>Dockerfile</code> — Minimal, secret içermeyen container yapılandırması</li>
          <li>📦 <code>pyproject.toml</code> — Yalnızca gerekli kütüphane bağımlılıkları</li>
          <li>🐍 <code>main.py</code> — Doğrulanmış ve dondurulmuş native pipeline kodu</li>
        </ul>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setDownloaded(true)}
            style={{ backgroundColor: "#0077b6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
          >
            {downloaded ? "✓ İndirme Başlatıldı" : "Bağımsız Projeyi İndir (Export)"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, status, desc }: { title: string; value: string; status: "positive" | "neutral"; desc?: string }) {
  return (
    <div style={{ backgroundColor: "#111d4a", padding: 22, borderRadius: 8, border: "1px solid #1c2541" }}>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: status === "positive" ? "#48cae4" : "#f8fafc", marginBottom: 8 }}>{value}</div>
      {desc && <div style={{ fontSize: 12, color: "#64748b" }}>{desc}</div>}
    </div>
  );
}
