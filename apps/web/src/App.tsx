import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

const PAGES = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/task-studio", label: "Task Studio", icon: "📝" },
  { path: "/pipeline-designer", label: "Pipeline Designer", icon: "⚡" },
  { path: "/settings/model", label: "Model Settings", icon: "🔑" },
  { path: "/frameworks", label: "Framework Registry", icon: "📦" },
  { path: "/experiments", label: "Experiment Monitor", icon: "🔬" },
  { path: "/trace-explorer", label: "Trace Explorer", icon: "🔍" },
  { path: "/evaluations", label: "Evaluation & Criteria", icon: "⚖️" },
  { path: "/arena", label: "Recommendation Arena", icon: "🏆" },
  { path: "/exporter", label: "Artifact Exporter", icon: "🚀" },
];

export default function App() {
  const location = useLocation();
  const [selectedFramework, setSelectedFramework] = useState("langgraph");

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0f172a", color: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{ width: 260, borderRight: "1px solid #334155", backgroundColor: "#1e293b", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #334155" }}>
          <h2 style={{ margin: 0, fontSize: 18, color: "#38bdf8" }}>Agentic Arena</h2>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>v0.1.0 Foundation</span>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
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
                  padding: "10px 12px",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: isActive ? "#38bdf8" : "#cbd5e1",
                  backgroundColor: isActive ? "rgba(56, 189, 248, 0.1)" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  marginBottom: 4,
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
        {/* Top Bar */}
        <header style={{ height: 56, borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", backgroundColor: "#1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 14, color: "#94a3b8" }}>Active Mode:</span>
            <span style={{ fontSize: 13, background: "#0284c7", color: "#fff", padding: "3px 8px", borderRadius: 4 }}>Native Comparison</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e" }}></span>
            <span style={{ fontSize: 13, color: "#cbd5e1" }}>System Ready</span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/task-studio" element={<PlaceholderView title="Task Studio" desc="Gereksinim netleştirme, serbest alanlar ve TaskSpec onay ekranı." />} />
            <Route path="/pipeline-designer" element={<PlaceholderView title="Pipeline Designer" desc="Doğal dil, görsel akış ve kod import arayüzü." />} />
            <Route path="/settings/model" element={<PlaceholderView title="Model & Gateway Settings" desc="Tek model bağlantısı, AES-256-GCM secret yönetimi ve model probe." />} />
            <Route path="/frameworks" element={<PlaceholderView title="Framework Registry" desc="10 framework OCI image durumu ve capability raporları." />} />
            <Route path="/experiments" element={<PlaceholderView title="Experiment Monitor" desc="Eş zamanlı çalışan adaylar, canlı durum ve bütçe kullanımı." />} />
            <Route path="/trace-explorer" element={<PlaceholderView title="Trace Explorer" desc="Span waterfall, ajanlar arası mesajlaşma ve token haritası." />} />
            <Route path="/evaluations" element={<PlaceholderView title="Evaluation & Criteria" desc="Hard kriter kapıları ve held-out test sonuçları." />} />
            <Route path="/arena" element={<PlaceholderView title="Recommendation Arena" desc="Ağırlıklı skorlama, radar grafiği ve kanıta dayalı öneri." />} />
            <Route path="/exporter" element={<PlaceholderView title="Artifact Exporter" desc="Kazanan pipeline'ın bağımsız, secret-free export paketi." />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function DashboardView() {
  return (
    <div>
      <h1 style={{ fontSize: 24, margin: "0 0 8px 0" }}>Agentic Framework Arena</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 24px 0" }}>
        One task. One model. Ten frameworks. Measurable results.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card title="Task Status" value="Ready to Clarify" status="neutral" />
        <Card title="Active Frameworks" value="10 Ready" status="positive" />
        <Card title="Gateway Model" value="Single Locked Model" status="positive" />
      </div>
    </div>
  );
}

function PlaceholderView({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h1 style={{ fontSize: 24, margin: "0 0 8px 0" }}>{title}</h1>
      <p style={{ color: "#94a3b8" }}>{desc}</p>
      <div style={{ marginTop: 24, padding: 24, borderRadius: 8, border: "1px dashed #475569", textAlign: "center", color: "#64748b" }}>
        Modül Faz planına göre geliştirilmektedir.
      </div>
    </div>
  );
}

function Card({ title, value, status }: { title: string; value: string; status: "positive" | "neutral" }) {
  return (
    <div style={{ backgroundColor: "#1e293b", padding: 20, borderRadius: 8, border: "1px solid #334155" }}>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: status === "positive" ? "#38bdf8" : "#f8fafc" }}>{value}</div>
    </div>
  );
}
