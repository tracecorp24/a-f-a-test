import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

// ============================================================================
// THEME & DESIGN TOKENS
// ============================================================================
const THEME = {
  bg: "#0b1017",
  panel: "#101720",
  panelAlt: "#0d141d",
  line: "#253141",
  lineSubtle: "#1c2633",
  muted: "#91a0b4",
  text: "#e7edf6",
  cyan: "#53cbe8",
  blue: "#719dff",
  green: "#52d8a4",
  purple: "#ae92f5",
  amber: "#e7b971",
  red: "#ef8694",
};

// ============================================================================
// DATA MODELS
// ============================================================================
export interface FrameworkRecord {
  name: string;
  caps: number[]; // 10 capability values: 2=native, 1=adapter, 0=unverified
  v: [number, number, number, number]; // [Quality, Speed, Token efficiency, Reliability]
  version: string;
  architecture: string;
}

export const FRAMEWORKS_DATA: FrameworkRecord[] = [
  { name: "LangGraph", caps: [2, 2, 2, 2, 2, 2, 2, 2, 1, 2], v: [94, 76, 78, 96], version: "0.2.74", architecture: "Graph-State" },
  { name: "Google ADK", caps: [2, 2, 2, 2, 2, 2, 1, 2, 2, 1], v: [90, 85, 86, 93], version: "0.4.1", architecture: "Multi-Agent Hub" },
  { name: "OpenAI Agents", caps: [1, 1, 2, 2, 2, 2, 1, 2, 2, 2], v: [87, 91, 85, 89], version: "0.1.2", architecture: "Handoff SDK" },
  { name: "CrewAI", caps: [1, 2, 1, 2, 2, 1, 2, 2, 1, 0], v: [92, 62, 61, 86], version: "0.102.0", architecture: "Role-Playing Crew" },
  { name: "Pydantic AI", caps: [2, 1, 1, 1, 2, 2, 2, 2, 2, 2], v: [89, 87, 92, 95], version: "0.0.24", architecture: "Type-Safe Agent" },
  { name: "Agno", caps: [2, 2, 1, 2, 2, 2, 1, 1, 1, 2], v: [85, 97, 95, 84], version: "2.1.0", architecture: "High-Speed Async" },
  { name: "LlamaAgents", caps: [2, 2, 1, 1, 2, 2, 2, 1, 1, 2], v: [86, 83, 82, 88], version: "0.0.18", architecture: "Service-Bus Micro" },
  { name: "Smolagents", caps: [1, 1, 1, 1, 2, 2, 1, 0, 0, 1], v: [78, 94, 96, 81], version: "1.9.0", architecture: "Code-Action Minimal" },
  { name: "Mastra", caps: [2, 2, 2, 2, 2, 2, 1, 2, 1, 2], v: [88, 89, 87, 87], version: "0.1.32", architecture: "Workflow & Sync" },
  { name: "Microsoft AF", caps: [2, 2, 2, 2, 2, 1, 2, 2, 2, 2], v: [91, 80, 76, 95], version: "0.4.0", architecture: "Enterprise Agent" },
];

export const CAPABILITIES = [
  "State",
  "Parallel",
  "Handoff",
  "Memory",
  "Tooling",
  "Streaming",
  "Retry",
  "Human",
  "Telemetry",
  "Type safety",
];

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  criteriaCount: number;
  estimatedTime: string;
  category: string;
  sampleObjective: string;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "doc-review",
    title: "Sözleşme Çelişki & Bütçe Analizi",
    description: "PDF/Word sözleşmelerini analiz et, teslim tarihi ve bütçe tutarsızlıklarını kanıtlı raporla çıkar.",
    criteriaCount: 2,
    estimatedTime: "45 s",
    category: "Hukuk & Tedarik",
    sampleObjective: "Sözleşmeleri analiz et, teslim tarihi ve bütçe çelişkilerini bul ve kanıtlı rapor üret.",
  },
  {
    id: "sec-audit",
    title: "Kaynak Kod Güvenlik & Zafiyet Taraması",
    description: "Repository genelinde CVE, SQLi, secret leak ve OWASP Top 10 zafiyetlerini statik analizle tespit et.",
    criteriaCount: 3,
    estimatedTime: "60 s",
    category: "Siber Güvenlik",
    sampleObjective: "Kaynak kod deposunu incele, gizli anahtar ve SQL enjeksiyon açıklarını CVE referanslarıyla raporla.",
  },
  {
    id: "fin-synth",
    title: "Çok Kaynaklı Finansal Rapor Sentezi",
    description: "SEC 10-K raporlarını ve piyasa haberlerini sentezleyerek çeyreklik risk ve büyüme matrisi üret.",
    criteriaCount: 2,
    estimatedTime: "75 s",
    category: "Finans & Risk",
    sampleObjective: "Finansal tabloları ve son 30 günlük bültenleri karşılaştır, likidite risklerini modelle.",
  },
  {
    id: "api-valid",
    title: "OpenAPI Şema & Regresyon Test Üretimi",
    description: "OpenAPI spesifikasyonunu oku, sınır koşullarını içeren mock veriler ve test senaryoları türet.",
    criteriaCount: 2,
    estimatedTime: "35 s",
    category: "Yazılım Mühendisliği",
    sampleObjective: "REST API şemasına göre uç nokta sınır değerlerini test eden JSON senaryoları hazırla.",
  },
];

export interface PastExperiment {
  id: string;
  date: string;
  task: string;
  model: string;
  winner: string;
  f1: number;
  tokens: string;
  status: "completed" | "failed" | "running";
}

export const PAST_EXPERIMENTS: PastExperiment[] = [
  { id: "#042", date: "2026-11-24 10:24", task: "Sözleşme Çelişki & Bütçe Analizi", model: "gemini-1.5-pro", winner: "LangGraph", f1: 0.96, tokens: "57.2K", status: "completed" },
  { id: "#041", date: "2026-11-23 16:45", task: "Kaynak Kod Güvenlik Taraması", model: "gemini-1.5-pro", winner: "Microsoft AF", f1: 0.95, tokens: "68.4K", status: "completed" },
  { id: "#040", date: "2026-11-23 11:12", task: "Çok Kaynaklı Finansal Sentez", model: "gemini-1.5-pro", winner: "Agno", f1: 0.93, tokens: "51.0K", status: "completed" },
  { id: "#039", date: "2026-11-22 18:30", task: "OpenAPI Şema Test Üretimi", model: "gemini-1.5-pro", winner: "Pydantic AI", f1: 0.97, tokens: "42.8K", status: "completed" },
  { id: "#038", date: "2026-11-22 14:05", task: "Müşteri Geri Bildirim Sınıflandırma", model: "gemini-1.5-pro", winner: "Google ADK", f1: 0.94, tokens: "49.6K", status: "completed" },
  { id: "#037", date: "2026-11-21 09:18", task: "Dağıtık Log Hata Kök Neden Analizi", model: "gemini-1.5-pro", winner: "OpenAI Agents", f1: 0.91, tokens: "63.1K", status: "completed" },
];

const NAVIGATION_SECTIONS = [
  { path: "/", label: "Dashboard", icon: "✦" },
  { path: "/task-studio", label: "Task Studio", icon: "✎" },
  { path: "/pipeline-designer", label: "Pipeline Designer", icon: "⎇" },
  { path: "/development-studio", label: "Development Studio", icon: "⚙" },
  { path: "/execution-arena", label: "Execution Arena", icon: "▶" },
  { path: "/telemetry-center", label: "Telemetry Center", icon: "⌁" },
  { path: "/evaluation-center", label: "Evaluation Center", icon: "⚖" },
  { path: "/comparison-lab", label: "Comparison Lab", icon: "◈" },
  { path: "/library-exporter", label: "Export & Artifacts", icon: "⤓" },
];

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const location = useLocation();

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: THEME.bg,
        color: THEME.text,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Sleek Corporate Sidebar */}
      <aside
        style={{
          width: 256,
          borderRight: `1px solid ${THEME.line}`,
          backgroundColor: THEME.panel,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${THEME.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 32,
                height: 32,
                display: "inline-grid",
                placeItems: "center",
                color: THEME.cyan,
                backgroundColor: "#112634",
                border: "1px solid #2e6275",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              △
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 750, letterSpacing: "0.08em", color: THEME.text }}>
                AGENTIC ARENA
              </div>
              <div style={{ fontSize: 10, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>
                Enterprise Bench · v2.4
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: THEME.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "4px 12px 8px",
            }}
          >
            Navigasyon
          </div>
          {NAVIGATION_SECTIONS.map((sec) => {
            const isActive = location.pathname === sec.path;
            return (
              <Link
                key={sec.path}
                to={sec.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: isActive ? THEME.cyan : THEME.muted,
                  backgroundColor: isActive ? "#152838" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  marginBottom: 3,
                  border: isActive ? "1px solid #234c62" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 13, width: 16, textAlign: "center" }}>{sec.icon}</span>
                <span>{sec.label}</span>
              </Link>
            );
          })}

          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: THEME.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "16px 12px 8px",
            }}
          >
            Kaynaklar
          </div>
          <a
            href="/prototypes/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 12px",
              borderRadius: 6,
              color: THEME.muted,
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            <span>↗</span>
            <span>Raw HTML Prototipleri</span>
          </a>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${THEME.line}`, fontSize: 11, color: THEME.muted, backgroundColor: THEME.panelAlt }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: THEME.green }} />
            <span style={{ fontWeight: 600, color: THEME.text }}>10 Framework Verified</span>
          </div>
          <div style={{ fontSize: 10, color: THEME.muted }}>Tek Model · Sıfır Önyargı · ADR Uyumlu</div>
        </div>
      </aside>

      {/* Main View Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Control Bar */}
        <header
          style={{
            height: 54,
            borderBottom: `1px solid ${THEME.line}`,
            backgroundColor: THEME.panel,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Aktif Görev:</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>doc-review (#042)</span>
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: THEME.line }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kilitli Model:</span>
              <span
                style={{
                  fontSize: 11,
                  background: "#153849",
                  color: "#b6f2ff",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 600,
                  fontFamily: "ui-monospace, monospace",
                  border: "1px solid #377b91",
                }}
              >
                gemini-1.5-pro (Locked)
              </span>
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: THEME.line }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kanonik Token:</span>
              <span style={{ fontSize: 12, color: THEME.green, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>
                57.2K tokens ($0.114)
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontSize: 11,
                background: "rgba(82, 216, 164, 0.12)",
                color: THEME.green,
                padding: "3px 10px",
                borderRadius: 12,
                border: "1px solid rgba(82, 216, 164, 0.3)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: THEME.green }} />
              Dual-Gate Conformance Active
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: "24px 30px", overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<DashboardTab />} />
            <Route path="/task-studio" element={<TaskStudioTab />} />
            <Route path="/pipeline-designer" element={<PipelineDesignerTab />} />
            <Route path="/framework-hub" element={<FrameworkHubTab />} />
            <Route path="/development-studio" element={<DevelopmentStudioTab />} />
            <Route path="/execution-arena" element={<ExecutionArenaTab />} />
            <Route path="/telemetry-center" element={<TelemetryCenterTab />} />
            <Route path="/evaluation-center" element={<EvaluationCenterTab />} />
            <Route path="/comparison-lab" element={<ComparisonLabTab />} />
            <Route path="/library-exporter" element={<LibraryExporterTab />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// 1. DASHBOARD TAB (The ONLY place with MetricSparks, Tasks & History)
// ============================================================================
function DashboardTab() {
  return (
    <div>
      {/* Hero Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            AGENTIC ARENA EXECUTIVE DASHBOARD
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700, letterSpacing: "-0.03em" }}>
            Platform Kontrol & Karşılaştırma Merkezi
          </h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Aynı görev · Tek kilitli model · 10 yerel ajan framework'ü · Kanonik adil değerlendirme.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/task-studio"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#17475d",
              color: "#dcf7ff",
              border: "1px solid #3388a8",
              padding: "8px 16px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            <span>+</span> Yeni Görev Tanımla
          </Link>
          <Link
            to="/execution-arena"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#163126",
              color: "#b9ffd8",
              border: "1px solid #2d7353",
              padding: "8px 16px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            <span>▶</span> Canlı Arenayı İzle
          </Link>
        </div>
      </div>

      {/* TOP METRIC SPARKS - ONLY ON DASHBOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <MetricSpark title="Tamamlanan Deneyler" value="42 Koşu" subtitle="+5 bu hafta" color={THEME.cyan} />
        <MetricSpark title="Aktif Canlı Koşu" value="3 / 10" subtitle="7 kuyrukta / çalışıyor" color={THEME.green} />
        <MetricSpark title="Kanonik Token Tüketimi" value="57.2K" subtitle="Toplam maliyet $0.114" color={THEME.purple} />
        <MetricSpark title="En Yüksek F1 Skoru" value="0.96" subtitle="LangGraph (#042 lideri)" color={THEME.amber} />
      </div>

      {/* SECTION 1: PRE-BUILT TASK TEMPLATES */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Örnek Görev Şablonları</h2>
            <span style={{ fontSize: 12, color: THEME.muted }}>Benchmark için önceden doğrulanmış kanonik görev tanımları</span>
          </div>
          <Link to="/task-studio" style={{ fontSize: 12, color: THEME.cyan, textDecoration: "none", fontWeight: 600 }}>
            Tüm Spesifikasyonları Yönet →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {TASK_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                backgroundColor: THEME.panel,
                border: `1px solid ${THEME.line}`,
                borderRadius: 8,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "border-color 0.2s",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, background: "#162534", color: THEME.cyan, padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                    {tpl.category}
                  </span>
                  <span style={{ fontSize: 11, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>
                    ~{tpl.estimatedTime}
                  </span>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 650, margin: "0 0 6px", color: THEME.text }}>
                  {tpl.title}
                </h3>
                <p style={{ fontSize: 11, color: THEME.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
                  {tpl.description}
                </p>
              </div>

              <div>
                <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 10 }}>
                  <span style={{ color: THEME.green, fontWeight: 600 }}>{tpl.criteriaCount}</span> Zorunlu Hard Gate
                </div>
                <Link
                  to="/task-studio"
                  style={{
                    display: "block",
                    textAlign: "center",
                    backgroundColor: "#131f2d",
                    color: THEME.cyan,
                    border: `1px solid ${THEME.line}`,
                    padding: "7px 10px",
                    borderRadius: 5,
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Görevi Yükle & Başlat →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: PAST EXPERIMENTS HISTORY */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${THEME.line}` }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Geçmiş Test & Deney Tarihçesi</h2>
            <span style={{ fontSize: 11, color: THEME.muted }}>10 framework üzerinde tamamlanmış resmi benchmark kayıtları</span>
          </div>
          <span style={{ fontSize: 11, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>Son 6 Koşu Gösteriliyor</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.line}`, backgroundColor: THEME.panelAlt, textAlign: "left", color: THEME.muted, fontSize: 11 }}>
                <th style={{ padding: "10px 16px" }}>Koşu ID</th>
                <th style={{ padding: "10px 16px" }}>Tarih & Saat</th>
                <th style={{ padding: "10px 16px" }}>Görev Başlığı</th>
                <th style={{ padding: "10px 16px" }}>Kilitli Model</th>
                <th style={{ padding: "10px 16px" }}>Kazanan Framework</th>
                <th style={{ padding: "10px 16px" }}>En Yüksek F1</th>
                <th style={{ padding: "10px 16px" }}>Token</th>
                <th style={{ padding: "10px 16px" }}>Durum</th>
                <th style={{ padding: "10px 16px", textAlign: "right" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {PAST_EXPERIMENTS.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: `1px solid ${THEME.lineSubtle}` }}>
                  <td style={{ padding: "11px 16px", fontWeight: 700, fontFamily: "ui-monospace, monospace", color: THEME.cyan }}>
                    {exp.id}
                  </td>
                  <td style={{ padding: "11px 16px", color: THEME.muted }}>
                    {exp.date}
                  </td>
                  <td style={{ padding: "11px 16px", fontWeight: 600 }}>
                    {exp.task}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "#a5dcf0", backgroundColor: "#142938", padding: "2px 6px", borderRadius: 4 }}>
                      {exp.model}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontWeight: 650, color: THEME.text }}>
                    {exp.winner}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ color: THEME.green, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>
                      {exp.f1.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontFamily: "ui-monospace, monospace", color: THEME.muted }}>
                    {exp.tokens}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: exp.status === "completed" ? THEME.green : THEME.red,
                        backgroundColor: exp.status === "completed" ? "rgba(82, 216, 164, 0.12)" : "rgba(239, 134, 148, 0.12)",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      ● {exp.status === "completed" ? "Tamamlandı" : "Başarısız"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right" }}>
                    <Link to="/comparison-lab" style={{ color: THEME.cyan, fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
                      Analiz Et →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: FRAMEWORK HUB (FULL 10x10 CAPABILITY MATRIX & PROFILES - ALWAYS OPEN) */}
      <FrameworkHubSection />
    </div>
  );
}

// ============================================================================
// 2. TASK STUDIO TAB
// ============================================================================
function TaskStudioTab() {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            KANONİK TASK SPECIFICATION
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700 }}>Task Studio</h1>
          <p style={{ color: THEME.muted, fontSize: 13, margin: 0 }}>
            Görev hedefini belirleyin, kilitli modeli seçin ve RFC 8785 deterministik kanonik hash ile onaylayın.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: THEME.muted }}>Şablon Seç:</span>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            style={{
              backgroundColor: THEME.panel,
              border: `1px solid ${THEME.line}`,
              color: THEME.text,
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            {TASK_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        {/* Form Panel */}
        <div style={{ backgroundColor: THEME.panel, borderRadius: 8, border: `1px solid ${THEME.line}`, padding: 22 }}>
          <label style={{ fontSize: 13, fontWeight: 650, color: THEME.text, display: "block", marginBottom: 8 }}>
            Görev Hedefi (Objective Prompt)
          </label>
          <textarea
            rows={4}
            value={objective}
            onChange={(e) => {
              setObjective(e.target.value);
              setIsApproved(false);
            }}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 6,
              backgroundColor: THEME.panelAlt,
              border: `1px solid ${THEME.line}`,
              color: THEME.text,
              fontSize: 13,
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.5,
            }}
          />

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 13, color: THEME.cyan, margin: "0 0 8px" }}>
              Zorunlu Hard Gate Kriterleri (Geçiş Barajı)
            </h4>
            <div style={{ fontSize: 12, color: THEME.muted, lineHeight: 1.8, backgroundColor: THEME.panelAlt, padding: 12, borderRadius: 6, border: `1px solid ${THEME.line}` }}>
              <div>
                • <code style={{ color: THEME.green }}>valid_schema</code>: JSON Schema doğrulaması == 1.0 (Başarısız olan doğrudan elenir)
              </div>
              <div>
                • <code style={{ color: THEME.green }}>conflict_f1</code>: Etiketli çelişki tespit F1 skoru ≥ 0.90 (Dual-gate eşiği)
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h4 style={{ fontSize: 13, color: THEME.purple, margin: "0 0 6px" }}>İzin Verilen Serbest Tasarım Alanları</h4>
            <p style={{ fontSize: 12, color: THEME.muted, margin: 0, lineHeight: 1.6 }}>
              Ajan sayısı, DAG topolojisi, sistem promptu ve hafıza stratejisi her framework'ün kendi yerel yeteneklerine bırakılmıştır.
            </p>
          </div>

          <div style={{ marginTop: 24 }}>
            {!isApproved ? (
              <button
                onClick={() => setIsApproved(true)}
                style={{
                  backgroundColor: "#164558",
                  color: "#d0f6ff",
                  border: "1px solid #3785a3",
                  padding: "10px 20px",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Approve & Lock Spec (RFC 8785 Kanonik Hash Üret)
              </button>
            ) : (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 6,
                  backgroundColor: "rgba(82, 216, 164, 0.12)",
                  border: `1px solid ${THEME.green}`,
                  color: THEME.green,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>✓ Görev Kilitlendi! RFC 8785 Kanonik Hash: <code>{specHash.slice(0, 18)}...</code></span>
                <Link to="/execution-arena" style={{ color: THEME.text, textDecoration: "underline", fontWeight: 600 }}>
                  Arenada Başlat →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* YAML Preview Panel */}
        <div style={{ backgroundColor: THEME.panel, borderRadius: 8, border: `1px solid ${THEME.line}`, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h4 style={{ fontSize: 13, color: THEME.muted, margin: 0 }}>Kanonik TaskSpec YAML</h4>
            <span style={{ fontSize: 10, color: THEME.cyan, fontFamily: "monospace" }}>RFC 8785 Canonical</span>
          </div>
          <pre
            style={{
              margin: 0,
              padding: 14,
              backgroundColor: THEME.panelAlt,
              borderRadius: 6,
              fontSize: 11,
              color: THEME.text,
              overflowX: "auto",
              border: `1px solid ${THEME.line}`,
              fontFamily: "ui-monospace, monospace",
              lineHeight: 1.6,
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

// ============================================================================
// 3. PIPELINE DESIGNER TAB (Workflow Canvas, Inspector, Trace - NO METRIC SPARKS)
// ============================================================================
const NODE_INFO: Record<string, [string, string, string, string, string]> = {
  "User task": ["Kullanıcıdan gelen ham görev girdisini ayrıştırır.", "Done", "145", "0.18 s", "None"],
  Planner: ["Görev için dinamik alt adımlar ve rota planı üretir.", "Done", "1,326", "0.91 s", "None"],
  Researcher: ["Dış araçları (Search, Read) kullanarak kanıt toplar.", "Running", "4,218", "2.14 s", "Search, DocumentReader"],
  Analyzer: ["Toplanan bilgileri karşılaştırıp çelişkileri çıkarır.", "Queued", "—", "—", "DiffCalculator"],
  Validator: ["Çıktıyı JSON şeması ve F1 kabul eşiğine göre doğrular.", "Queued", "—", "—", "SchemaVerifier"],
  "Final output": ["Onaylanan kanonik yanıtı paketleyip teslim eder.", "Queued", "—", "—", "None"],
};

function PipelineDesignerTab() {
  const [selectedNode, setSelectedNode] = useState("Researcher");
  const [isPaused, setIsPaused] = useState(false);

  const fallbackData: [string, string, string, string, string] = [
    "Dış araçları kullanarak kanıt toplar.",
    "Running",
    "4,218",
    "2.14 s",
    "Search, DocumentReader",
  ];
  const nodeData = NODE_INFO[selectedNode] ?? fallbackData;

  return (
    <div>
      {/* Header with Compact Inline Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            WORKFLOW TOPOLOGY & ROUTING
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700 }}>Pipeline Designer</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Ajan iş akışı, paralel dallanma, geri besleme döngüleri ve düğüm durum denetleyicisi.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Inline Status Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: THEME.panel,
              border: `1px solid ${THEME.line}`,
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            <span><strong style={{ color: THEME.text }}>6</strong> Düğüm</span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.cyan }}>● 1 Aktif</span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.green }}>● 2 Tamamlandı</span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ fontFamily: "monospace" }}>12.8K Token</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              backgroundColor: "#153849",
              borderColor: "#377b91",
              color: "#b6f2ff",
              border: "1px solid",
              padding: "7px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {isPaused ? "▶ Sürdür" : "❚❚ Duraklat"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.4fr) minmax(280px, 1fr)", gap: 14 }}>
        {/* SVG Canvas Section */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Yerel İş Akışı Çizgesi</h2>
            <span style={{ fontSize: 11, fontWeight: 600, color: isPaused ? THEME.amber : THEME.cyan, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: isPaused ? THEME.amber : THEME.cyan }} />
              {isPaused ? "Duraklatıldı" : "Çalışıyor (Canlı)"}
            </span>
          </div>

          <div
            style={{
              backgroundColor: THEME.panelAlt,
              backgroundImage: "radial-gradient(#283849 0.7px, transparent .7px)",
              backgroundSize: "18px 18px",
              padding: 12,
              position: "relative",
            }}
          >
            <svg viewBox="0 0 980 375" style={{ display: "block", width: "100%", height: "auto", minHeight: 280 }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                </marker>
              </defs>

              {/* Static & Active Edges */}
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
              <text x="570" y="23" fill="#9eb0c3" fontSize="11">Doğrulama başarısız olursa tekrar dene (Retry loop)</text>

              {/* Interactive Nodes */}
              <SvgNode
                x={30}
                y={150}
                w={135}
                h={60}
                icon="↳"
                title="User task"
                sub="Girdi"
                status="complete"
                selected={selectedNode === "User task"}
                onClick={() => setSelectedNode("User task")}
              />
              <SvgNode
                x={210}
                y={150}
                w={135}
                h={60}
                icon="◇"
                title="Planner"
                sub="Ajan"
                status="complete"
                selected={selectedNode === "Planner"}
                onClick={() => setSelectedNode("Planner")}
              />
              <SvgNode
                x={395}
                y={65}
                w={150}
                h={60}
                icon="⌕"
                title="Researcher"
                sub="Ajan (Aktif)"
                status="running"
                selected={selectedNode === "Researcher"}
                onClick={() => setSelectedNode("Researcher")}
              />
              <SvgNode
                x={395}
                y={235}
                w={150}
                h={60}
                icon="≋"
                title="Analyzer"
                sub="Ajan"
                status="queued"
                selected={selectedNode === "Analyzer"}
                onClick={() => setSelectedNode("Analyzer")}
              />
              <SvgNode
                x={605}
                y={150}
                w={145}
                h={60}
                icon="✓"
                title="Validator"
                sub="Dual-Gate"
                status="queued"
                selected={selectedNode === "Validator"}
                onClick={() => setSelectedNode("Validator")}
              />
              <SvgNode
                x={810}
                y={150}
                w={140}
                h={60}
                icon="↗"
                title="Final output"
                sub="Paket Çıktı"
                status="queued"
                selected={selectedNode === "Final output"}
                onClick={() => setSelectedNode("Final output")}
              />
            </svg>
          </div>

          <div style={{ display: "flex", gap: 15, alignItems: "center", color: THEME.muted, fontSize: 11, padding: "10px 16px", borderTop: `1px solid ${THEME.line}` }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.green, marginRight: 5 }} />Tamamlandı</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.cyan, marginRight: 5 }} />Çalışıyor</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.muted, marginRight: 5 }} />Kuyrukta</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.purple, marginRight: 5 }} />Geri Dönüş Yolu</span>
          </div>
        </section>

        {/* Node Inspector Section */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Düğüm Denetleyicisi</h2>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ color: THEME.cyan, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3, fontWeight: 700 }}>
              Seçili Düğüm
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 6px" }}>{selectedNode}</div>
            <p style={{ fontSize: 12, color: THEME.muted, margin: "0 0 14px", lineHeight: 1.5 }}>{nodeData[0]}</p>

            <KVRow label="Durum" value={nodeData[1]} color={nodeData[1] === "Done" ? THEME.green : nodeData[1] === "Running" ? THEME.cyan : THEME.muted} />
            <KVRow label="Kilitli Model" value="gemini-1.5-pro" />
            <KVRow label="Kullanılan Token" value={nodeData[2]} />
            <KVRow label="Geçen Süre" value={nodeData[3]} />
            <KVRow label="Erişilen Araçlar" value={nodeData[4]} />

            <div style={{ color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontSize: 10, margin: "16px 0 6px" }}>
              Çalışma Zamanı Kısıtları
            </div>
            <div style={{ fontSize: 11, border: "1px solid #28394a", borderRadius: 4, padding: "5px 10px", color: "#b3c6d8", backgroundColor: THEME.panelAlt }}>
              Shared Model Gateway · ADR-0003 Model Lock
            </div>
          </div>
        </section>
      </div>

      {/* Execution Trace Table */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, marginTop: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Çalışma İzi (Execution Trace Log)</h2>
          <span style={{ fontSize: 11, color: THEME.muted }}>Run #042 · Live Event Stream</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.line}`, textAlign: "left", color: THEME.muted, fontSize: 11, backgroundColor: THEME.panelAlt }}>
                <th style={{ padding: "9px 14px" }}>Zaman Damgası</th>
                <th style={{ padding: "9px 14px" }}>Düğüm</th>
                <th style={{ padding: "9px 14px" }}>Olay</th>
                <th style={{ padding: "9px 14px" }}>Token</th>
                <th style={{ padding: "9px 14px" }}>Süre</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #1c2633" }}>
                <td style={{ padding: "9px 14px", fontFamily: "monospace" }}>10:24:31.102</td>
                <td style={{ padding: "9px 14px", fontWeight: 600 }}>User task</td>
                <td style={{ padding: "9px 14px", color: THEME.green }}>● Tamamlandı</td>
                <td style={{ padding: "9px 14px" }}>145</td>
                <td style={{ padding: "9px 14px" }}>0.18 s</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #1c2633" }}>
                <td style={{ padding: "9px 14px", fontFamily: "monospace" }}>10:24:32.015</td>
                <td style={{ padding: "9px 14px", fontWeight: 600 }}>Planner</td>
                <td style={{ padding: "9px 14px", color: THEME.green }}>● Tamamlandı</td>
                <td style={{ padding: "9px 14px" }}>1,326</td>
                <td style={{ padding: "9px 14px" }}>0.91 s</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #1c2633" }}>
                <td style={{ padding: "9px 14px", fontFamily: "monospace" }}>10:24:33.240</td>
                <td style={{ padding: "9px 14px", fontWeight: 600 }}>Researcher</td>
                <td style={{ padding: "9px 14px", color: THEME.cyan }}>● Çalışıyor (Tool I/O)</td>
                <td style={{ padding: "9px 14px" }}>4,218</td>
                <td style={{ padding: "9px 14px" }}>2.14 s</td>
              </tr>
              <tr>
                <td style={{ padding: "9px 14px", fontFamily: "monospace", color: THEME.muted }}>—</td>
                <td style={{ padding: "9px 14px", fontWeight: 600, color: THEME.muted }}>Analyzer</td>
                <td style={{ padding: "9px 14px", color: THEME.muted }}>● Beklemede</td>
                <td style={{ padding: "9px 14px", color: THEME.muted }}>—</td>
                <td style={{ padding: "9px 14px", color: THEME.muted }}>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// FRAMEWORK HUB (Embedded directly into DashboardTab - Always Open)
// ============================================================================
function FrameworkHubSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedFwName, setSelectedFwName] = useState("LangGraph");
  const [detail, setDetail] = useState<{ fw: string; cap: string; val: number } | null>(null);

  const states = [
    { cls: "unknown", icon: "?", label: "Doğrulanmamış", color: THEME.muted, bg: "#1a232e" },
    { cls: "adapter", icon: "~", label: "Adaptör ile", color: THEME.blue, bg: "#1a2c42" },
    { cls: "native", icon: "✓", label: "Yerel (Native)", color: THEME.green, bg: "#13352a" },
  ];

  const filteredFws = FRAMEWORKS_DATA.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedFw = FRAMEWORKS_DATA.find((f) => f.name === selectedFwName) ?? FRAMEWORKS_DATA[0]!;

  return (
    <section id="framework-hub" style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, padding: 20 }}>
      {/* Header with Compact Inline Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3, fontWeight: 700 }}>
            FRAMEWORK HUB · CANLI YETENEK & PROFİL MERKEZİ
          </div>
          <h2 style={{ fontSize: 17, margin: "0 0 4px", fontWeight: 700 }}>10x10 Yetenek Matrisi & Framework Profilleri</h2>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 12 }}>
            Kayıtlı 10 framework'ün yerel (native) ve adaptör yetenekleri, kalite/hız profilleri ve hücre denetimi (Dashboard üzerinde her zaman açık).
          </p>
        </div>

        {/* Inline Capability Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: THEME.panelAlt,
            border: `1px solid ${THEME.line}`,
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <span><strong style={{ color: THEME.text }}>10</strong> Framework</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.green }}>73 Yerel</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.blue }}>21 Adaptör</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.muted }}>6 Doğrulanmamış</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.3fr) minmax(280px, 1fr)", gap: 14 }}>
        {/* Capability Coverage Table Section */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", borderBottom: `1px solid ${THEME.line}`, backgroundColor: THEME.panelAlt }}>
            <input
              type="text"
              placeholder="Framework ara…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                backgroundColor: "#0d141d",
                border: `1px solid ${THEME.line}`,
                borderRadius: 5,
                color: THEME.text,
                padding: "6px 10px",
                width: 200,
                fontSize: 12,
              }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                backgroundColor: "#141e2b",
                border: `1px solid ${THEME.line}`,
                borderRadius: 5,
                color: THEME.text,
                padding: "6px 10px",
                fontSize: 12,
              }}
            >
              <option value="all">Tüm Seviyeler</option>
              <option value="2">Yalnız Yerel (Native)</option>
              <option value="1">Yalnız Adaptör</option>
              <option value="0">Doğrulanmamış</option>
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${THEME.line}`, textAlign: "center", color: THEME.muted, fontSize: 11 }}>
                  <th style={{ textAlign: "left", padding: "10px 14px" }}>Framework</th>
                  {CAPABILITIES.map((cap) => (
                    <th key={cap} style={{ padding: "10px 6px" }}>{cap}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFws.map((fw) => {
                  const isSelectedFw = fw.name === selectedFwName;
                  return (
                    <tr
                      key={fw.name}
                      style={{
                        borderBottom: `1px solid ${THEME.lineSubtle}`,
                        backgroundColor: isSelectedFw ? "#132332" : "transparent",
                      }}
                    >
                      <td
                        onClick={() => setSelectedFwName(fw.name)}
                        style={{
                          padding: "8px 14px",
                          fontWeight: 650,
                          cursor: "pointer",
                          color: isSelectedFw ? THEME.cyan : THEME.text,
                        }}
                      >
                        {fw.name}
                      </td>
                      {fw.caps.map((val, j) => {
                        const st = states[val] ?? states[0]!;
                        const capName = CAPABILITIES[j] ?? "";
                        const isHidden = filter !== "all" && Number(filter) !== val;
                        return (
                          <td key={j} style={{ textAlign: "center", padding: "5px 3px" }}>
                            <button
                              onClick={() => {
                                setSelectedFwName(fw.name);
                                setDetail({ fw: fw.name, cap: capName, val });
                              }}
                              style={{
                                display: isHidden ? "none" : "inline-grid",
                                placeItems: "center",
                                width: 40,
                                height: 25,
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 700,
                                backgroundColor: st.bg,
                                border: `1px solid ${st.color}`,
                                color: st.color,
                                cursor: "pointer",
                                padding: 0,
                              }}
                              title={`${fw.name} / ${capName}: ${st.label}`}
                            >
                              {st.icon}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 15, alignItems: "center", color: THEME.muted, fontSize: 11, padding: "10px 16px", borderTop: `1px solid ${THEME.line}` }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.green, marginRight: 5 }} />Yerel (Native)</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.blue, marginRight: 5 }} />Adaptör Destekli</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.muted, marginRight: 5 }} />Doğrulanmamış</span>
          </div>
        </section>

        {/* Framework Profile & Inspector Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Framework Radar/Score Profile */}
          <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Framework Profili</h2>
              <span style={{ fontSize: 10, color: THEME.cyan, backgroundColor: "#142634", padding: "2px 6px", borderRadius: 3 }}>
                v{selectedFw.version}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{selectedFw.name}</div>
            <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 12 }}>Mimari: {selectedFw.architecture}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: THEME.muted }}>Kalite Skoru</span>
                  <strong style={{ color: THEME.cyan }}>{selectedFw.v[0]} / 100</strong>
                </div>
                <div style={{ height: 4, background: "#1c2633", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${selectedFw.v[0]}%`, height: "100%", background: THEME.cyan }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: THEME.muted }}>Hız Skoru</span>
                  <strong style={{ color: THEME.blue }}>{selectedFw.v[1]} / 100</strong>
                </div>
                <div style={{ height: 4, background: "#1c2633", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${selectedFw.v[1]}%`, height: "100%", background: THEME.blue }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: THEME.muted }}>Token Verimliliği</span>
                  <strong style={{ color: THEME.green }}>{selectedFw.v[2]} / 100</strong>
                </div>
                <div style={{ height: 4, background: "#1c2633", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${selectedFw.v[2]}%`, height: "100%", background: THEME.green }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: THEME.muted }}>Güvenilirlik</span>
                  <strong style={{ color: THEME.purple }}>{selectedFw.v[3]} / 100</strong>
                </div>
                <div style={{ height: 4, background: "#1c2633", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${selectedFw.v[3]}%`, height: "100%", background: THEME.purple }} />
                </div>
              </div>
            </div>
          </section>

          {/* Cell Inspector */}
          <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, padding: 16 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 650 }}>Yetenek Hücre Detayı</h2>
            {detail ? (
              <div>
                <div style={{ color: THEME.cyan, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontWeight: 700 }}>
                  Seçilen Kesişim
                </div>
                <b style={{ fontSize: 14 }}>{detail.fw} / {detail.cap}</b>
                <div style={{ marginTop: 6, fontSize: 12, color: states[detail.val]!.color, fontWeight: 600 }}>
                  ● {states[detail.val]!.label}
                </div>
                <p style={{ fontSize: 11, color: THEME.muted, margin: "6px 0 0", lineHeight: 1.5 }}>
                  Bu yetenek, framework'ün yerel API'si veya Arena adaptör katmanı üzerinden desteklenir.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 11, color: THEME.muted, margin: 0 }}>
                Tablodaki herhangi bir hücreye tıklayarak o yeteneğin ayrıntılı sınıflandırmasını inceleyebilirsiniz.
              </p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function FrameworkHubTab() {
  return <DashboardTab />;
}

// ============================================================================
// 5. DEVELOPMENT STUDIO TAB (Harness Code, Conformance Checks, Manifest)
// ============================================================================
function DevelopmentStudioTab() {
  const [selectedFw, setSelectedFw] = useState("LangGraph");
  const [activeTab, setActiveTab] = useState<"code" | "manifest" | "docker">("code");

  return (
    <div>
      {/* Header with Compact Inline Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            HARNESS CODE & CONFORMANCE AUDIT
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700 }}>Development Studio</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Uzman adaptör kodları, dondurulmuş worker adayları ve uyumluluk testleri.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: THEME.panel,
            border: `1px solid ${THEME.line}`,
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <span style={{ color: THEME.green }}>✓ 10/10 Manifest Valid</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.green }}>✓ Smoke Verified</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.cyan }}>Dondurulmuş Sözleşme</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 16 }}>
        {/* Left Framework Selector */}
        <div style={{ backgroundColor: THEME.panel, borderRadius: 8, border: `1px solid ${THEME.line}`, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: THEME.muted, textTransform: "uppercase", padding: "4px 8px 10px" }}>
            Aday Frameworkler
          </div>
          {FRAMEWORKS_DATA.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedFw(item.name)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                borderRadius: 6,
                border: selectedFw === item.name ? "1px solid #41788c" : "1px solid transparent",
                background: selectedFw === item.name ? "#142733" : "transparent",
                color: selectedFw === item.name ? THEME.cyan : THEME.muted,
                fontWeight: selectedFw === item.name ? 600 : 400,
                fontSize: 12,
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
          ))}
        </div>

        {/* Right Code & Conformance Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Conformance Check Badges Bar */}
          <div style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: THEME.muted, textTransform: "uppercase" }}>Manifest Doğrulama</div>
              <div style={{ fontSize: 12, color: THEME.green, fontWeight: 650, marginTop: 2 }}>✓ PASS (schema v1)</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: THEME.muted, textTransform: "uppercase" }}>Worker Yaşam Döngüsü</div>
              <div style={{ fontSize: 12, color: THEME.green, fontWeight: 650, marginTop: 2 }}>✓ PASS (exit 0)</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: THEME.muted, textTransform: "uppercase" }}>JSONL İletişim Protokolü</div>
              <div style={{ fontSize: 12, color: THEME.green, fontWeight: 650, marginTop: 2 }}>✓ PASS (stdio parsed)</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: THEME.muted, textTransform: "uppercase" }}>Model Gateway İzolasyonu</div>
              <div style={{ fontSize: 12, color: THEME.cyan, fontWeight: 650, marginTop: 2 }}>✓ Kilitli (Locked)</div>
            </div>
          </div>

          {/* Code Viewer Container */}
          <div style={{ backgroundColor: THEME.panel, borderRadius: 8, border: `1px solid ${THEME.line}`, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${THEME.line}`, backgroundColor: THEME.panelAlt }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setActiveTab("code")}
                  style={{
                    backgroundColor: activeTab === "code" ? "#192f3f" : "transparent",
                    color: activeTab === "code" ? THEME.cyan : THEME.muted,
                    border: `1px solid ${activeTab === "code" ? "#31657c" : "transparent"}`,
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  skeleton/main.py
                </button>
                <button
                  onClick={() => setActiveTab("manifest")}
                  style={{
                    backgroundColor: activeTab === "manifest" ? "#192f3f" : "transparent",
                    color: activeTab === "manifest" ? THEME.cyan : THEME.muted,
                    border: `1px solid ${activeTab === "manifest" ? "#31657c" : "transparent"}`,
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  manifest.yaml
                </button>
                <button
                  onClick={() => setActiveTab("docker")}
                  style={{
                    backgroundColor: activeTab === "docker" ? "#192f3f" : "transparent",
                    color: activeTab === "docker" ? THEME.cyan : THEME.muted,
                    border: `1px solid ${activeTab === "docker" ? "#31657c" : "transparent"}`,
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Dockerfile
                </button>
              </div>

              <span style={{ fontSize: 11, color: THEME.green, background: "rgba(82, 216, 164, 0.12)", padding: "2px 8px", borderRadius: 4, border: `1px solid ${THEME.green}` }}>
                Dondurulmuş Aday (Frozen Candidate)
              </span>
            </div>

            <pre
              style={{
                margin: 0,
                padding: 16,
                backgroundColor: "#090d13",
                fontSize: 12,
                color: THEME.text,
                overflowX: "auto",
                fontFamily: "ui-monospace, monospace",
                lineHeight: 1.5,
              }}
            >
              {activeTab === "code" &&
                `"""Native pipeline worker for ${selectedFw}."""
import json
import sys
from arena_worker_sdk.protocol import read_contract_input, emit_event

def main():
    # Stdio üzerinden kanonik girdi ve araç yetkilerini oku
    contract_data = read_contract_input()
    emit_event("pipeline.start", framework="${selectedFw}", task_id=contract_data["task_id"])
    
    # Kilitli Model Gateway üzerinden yerel ajan döngüsünü koştur
    # Framework'ün kendi yerel DAG topolojisi kullanılır
    print(f"Executing native workflow on ${selectedFw} runtime...", file=sys.stderr)
    
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
    </div>
  );
}

// ============================================================================
// 6. EXECUTION ARENA TAB (Live Multi-Framework Progress - NO METRIC SPARKS)
// ============================================================================
interface LiveRun {
  name: string;
  pct: number;
  time: string;
  tokens: number;
}

const INITIAL_RUNS: LiveRun[] = [
  { name: "LangGraph", pct: 100, time: "12.4 s", tokens: 8200 },
  { name: "Google ADK", pct: 82, time: "—", tokens: 7400 },
  { name: "OpenAI Agents", pct: 100, time: "14.1 s", tokens: 9400 },
  { name: "CrewAI", pct: 56, time: "—", tokens: 5800 },
  { name: "Pydantic AI", pct: 75, time: "—", tokens: 4200 },
  { name: "Agno", pct: 100, time: "11.8 s", tokens: 7900 },
  { name: "LlamaAgents", pct: 41, time: "—", tokens: 3900 },
  { name: "Smolagents", pct: 29, time: "—", tokens: 2700 },
  { name: "Mastra", pct: 12, time: "—", tokens: 1600 },
  { name: "Microsoft AF", pct: 68, time: "—", tokens: 6100 },
];

function ExecutionArenaTab() {
  const [runs, setRuns] = useState<LiveRun[]>(INITIAL_RUNS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(42.8);
  const [events] = useState([
    { name: "LangGraph", detail: "Doğrulama tamamlandı (F1: 0.96)", time: "10:24:34" },
    { name: "Google ADK", detail: "Araç çağırma döngüsü aktif", time: "10:24:33" },
    { name: "CrewAI", detail: "Research ajanı veri topluyor", time: "10:24:32" },
    { name: "Agno", detail: "Koşu tamamlandı (11.8 s)", time: "10:24:30" },
  ]);

  // Live progress simulation ticker
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setRuns((prev) => {
        const pending = prev.filter((r) => r.pct < 100);
        if (!pending.length) return prev;
        const target = pending[Math.floor(Math.random() * pending.length)];
        if (!target) return prev;
        return prev.map((r) => {
          if (r.name === target.name) {
            const nextPct = Math.min(100, r.pct + Math.ceil(Math.random() * 6));
            return { ...r, pct: nextPct, tokens: r.tokens + 120 };
          }
          return r;
        });
      });
      setElapsed((e) => +(e + 1.2).toFixed(1));
    }, 2000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const selectedRun = runs[selectedIdx] ?? runs[0]!;
  const completedCount = runs.filter((r) => r.pct === 100).length;
  const totalTokens = (runs.reduce((s, r) => s + r.tokens, 0) / 1000).toFixed(1) + "K";

  return (
    <div>
      {/* Header with Compact Inline Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            LIVE MULTI-FRAMEWORK CONCURRENT RUN
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700 }}>Execution Arena</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Aynı görev · Tek kilitli model · 10 bağımsız framework eş zamanlı çalışıyor.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Inline Live Progress Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: THEME.panel,
              border: `1px solid ${THEME.line}`,
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            <span style={{ color: THEME.green, fontWeight: 650 }}>{completedCount} / 10 Tamamlandı</span>
            <span style={{ color: THEME.line }}>|</span>
            <span>Toplam: <strong style={{ color: THEME.text }}>{totalTokens}</strong></span>
            <span style={{ color: THEME.line }}>|</span>
            <span style={{ color: THEME.amber, fontFamily: "monospace" }}>{elapsed} s</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              backgroundColor: "#153849",
              borderColor: "#377b91",
              color: "#b6f2ff",
              border: "1px solid",
              padding: "7px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {isPaused ? "▶ Canlı Koşuyu Sürdür" : "❚❚ Duraklat"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.8fr) minmax(230px, 0.9fr)", gap: 14 }}>
        {/* Left Column: 10 Frameworks Live Progress List */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Frameworkler (10)</h2>
          </div>
          <div style={{ padding: "6px 8px" }}>
            {runs.map((r, i) => {
              const isSel = i === selectedIdx;
              const isDone = r.pct === 100;
              return (
                <button
                  key={r.name}
                  onClick={() => setSelectedIdx(i)}
                  style={{
                    display: "grid",
                    width: "100%",
                    gridTemplateColumns: "1fr auto",
                    gap: 4,
                    textAlign: "left",
                    margin: "4px 0",
                    padding: "8px 10px",
                    background: isSel ? "#142733" : "transparent",
                    border: `1px solid ${isSel ? "#41788c" : "transparent"}`,
                    borderRadius: 6,
                    cursor: "pointer",
                    color: THEME.text,
                  }}
                >
                  <b style={{ fontSize: 12 }}>{r.name}</b>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? THEME.green : THEME.cyan }}>
                    {isDone ? "Tamamlandı" : `${r.pct}%`}
                  </span>
                  <small style={{ color: THEME.muted, fontSize: 10 }}>{r.tokens.toLocaleString()} tokens</small>
                  <small style={{ color: THEME.muted, fontSize: 10, textAlign: "right" }}>{r.time}</small>
                  <div style={{ gridColumn: "1/-1", height: 4, background: "#202a38", borderRadius: 3, overflow: "hidden", marginTop: 2 }}>
                    <div style={{ width: `${r.pct}%`, height: "100%", background: isDone ? THEME.green : THEME.cyan, transition: "width .3s" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Center Column: Selected Framework Graph & Detail */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>{selectedRun.name} · Yerel Akış</h2>
            <span style={{ fontSize: 11, fontWeight: 600, color: selectedRun.pct === 100 ? THEME.green : THEME.cyan }}>
              {selectedRun.pct === 100 ? "Tamamlandı" : "İşleniyor"}
            </span>
          </div>

          <div style={{ backgroundColor: THEME.panelAlt, backgroundImage: "radial-gradient(#283849 0.7px, transparent .7px)", backgroundSize: "18px 18px", padding: 12 }}>
            <svg viewBox="0 0 620 280" style={{ display: "block", width: "100%", height: "auto" }}>
              <defs>
                <marker id="arrowLive" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                </marker>
              </defs>
              <path d="M155 135 H235" fill="none" stroke={THEME.cyan} strokeWidth="2" strokeDasharray={isPaused ? "none" : "7 6"} markerEnd="url(#arrowLive)" />
              <path d="M385 135 H465" fill="none" stroke={THEME.cyan} strokeWidth="2" strokeDasharray={isPaused ? "none" : "7 6"} markerEnd="url(#arrowLive)" />
              <path d="M535 105 V45 H310 V105" fill="none" stroke={THEME.purple} strokeDasharray="5 5" strokeWidth="1.6" markerEnd="url(#arrowLive)" />

              <SvgNode x={20} y={105} w={135} h={60} icon="◇" title="Planner" sub="Ajan" status="complete" />
              <SvgNode x={235} y={105} w={150} h={60} icon="⌕" title="Research" sub="Ajan" status={selectedRun.pct === 100 ? "complete" : "running"} />
              <SvgNode x={465} y={105} w={135} h={60} icon="✓" title="Evaluator" sub="Dual-Gate" status={selectedRun.pct === 100 ? "complete" : "queued"} />
              <text x={310} y={35} textAnchor="middle" fill="#9eb0c3" fontSize={11}>Koşullu Geri Besleme</text>
            </svg>
          </div>

          <div style={{ padding: 16 }}>
            <KVRow label="İlerleme Oranı" value={`${selectedRun.pct}%`} />
            <div style={{ height: 5, background: "#202a38", borderRadius: 4, overflow: "hidden", margin: "6px 0 12px" }}>
              <div style={{ width: `${selectedRun.pct}%`, height: "100%", background: selectedRun.pct === 100 ? THEME.green : THEME.cyan, transition: "width .3s" }} />
            </div>
            <KVRow label="Kilitli Model" value="gemini-1.5-pro" />
            <KVRow label="Tüketilen Token" value={selectedRun.tokens.toLocaleString()} />
            <KVRow label="Tamamlanma Süresi" value={selectedRun.time} />
          </div>
        </section>

        {/* Right Column: Live Event Log Stream */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Canlı Olay Akışı</h2>
            <span style={{ fontSize: 10, color: THEME.cyan }}>SSE Stream</span>
          </div>
          <div style={{ padding: 12 }}>
            {events.map((evt, idx) => (
              <div key={idx} style={{ padding: "8px 0", borderBottom: idx < events.length - 1 ? `1px solid ${THEME.lineSubtle}` : "none", display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: THEME.cyan, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <b style={{ color: THEME.text }}>{evt.name}</b>
                  <div style={{ color: THEME.muted, fontSize: 11 }}>{evt.detail}</div>
                </div>
                <span style={{ color: THEME.muted, fontSize: 10, marginLeft: "auto", fontFamily: "monospace" }}>{evt.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// 7. TELEMETRY CENTER TAB (Communication Graph, Handoffs - NO METRIC SPARKS)
// ============================================================================
const COMM_LINKS = [
  ["Planner", "Researcher", 5, 1200, 2],
  ["Planner", "Analyzer", 3, 820, 1],
  ["Researcher", "Analyzer", 7, 2400, 2],
  ["Researcher", "Validator", 3, 400, 1],
  ["Analyzer", "Validator", 4, 980, 1],
  ["Planner", "Validator", 2, 100, 1],
];

function TelemetryCenterTab() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const getAgentMetrics = (name: string) => {
    const send = COMM_LINKS.filter((x) => x[0] === name);
    const recv = COMM_LINKS.filter((x) => x[1] === name);
    const sum = (arr: any[], idx: number) => arr.reduce((s, x) => s + x[idx], 0);
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
    <div>
      {/* Header with Compact Inline Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            INTER-AGENT COMMUNICATION TELEMETRY
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700 }}>Telemetry Center</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Ajanlar arası mesaj trafiği, el sıkışmalar (handoffs) ve kanonik token aktarım analizi.
          </p>
        </div>

        {/* Inline Communication Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: THEME.panel,
            border: `1px solid ${THEME.line}`,
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <span><strong style={{ color: THEME.text }}>24</strong> Mesaj</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.purple }}>8 Handoff</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.green, fontFamily: "monospace" }}>5.9K İletişim Tokenı</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.4fr) minmax(260px, 1fr)", gap: 14 }}>
        {/* SVG Communication Graph */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>İletişim & Token Akış Grafiği</h2>
            <span style={{ fontSize: 11, color: THEME.cyan }}>Çizgi Kalınlığı = Mesaj Hacmi</span>
          </div>

          <div style={{ backgroundColor: THEME.panelAlt, backgroundImage: "radial-gradient(#283849 0.7px, transparent .7px)", backgroundSize: "18px 18px", padding: 12 }}>
            <svg viewBox="0 0 900 410" style={{ display: "block", width: "100%", height: "auto" }}>
              <defs>
                <marker id="arrowComm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                </marker>
              </defs>

              <path d="M380 95 C340 125 230 120 170 165" fill="none" stroke={THEME.cyan} strokeWidth="3" markerEnd="url(#arrowComm)" />
              <rect x="195" y="104" width="106" height="18" rx="4" fill="#0d141d" />
              <text x="248" y="117" textAnchor="middle" fill="#9eb0c3" fontSize={11}>5 msgs · 1.2K</text>

              <path d="M540 95 C580 125 710 120 740 165" fill="none" stroke={THEME.cyan} strokeWidth="2" markerEnd="url(#arrowComm)" />
              <rect x="592" y="104" width="106" height="18" rx="4" fill="#0d141d" />
              <text x="645" y="117" textAnchor="middle" fill="#9eb0c3" fontSize={11}>3 msgs · 820</text>

              <path d="M250 195 H660" fill="none" stroke={THEME.cyan} strokeWidth="5" markerEnd="url(#arrowComm)" />
              <rect x="402" y="171" width="106" height="18" rx="4" fill="#0d141d" />
              <text x="455" y="184" textAnchor="middle" fill="#9eb0c3" fontSize={11}>7 msgs · 2.4K</text>

              <path d="M170 225 C210 280 340 275 420 310" fill="none" stroke={THEME.cyan} strokeWidth="2" markerEnd="url(#arrowComm)" />
              <rect x="207" y="255" width="106" height="18" rx="4" fill="#0d141d" />
              <text x="260" y="268" textAnchor="middle" fill="#9eb0c3" fontSize={11}>3 msgs · 400</text>

              <path d="M740 225 C700 280 560 275 500 310" fill="none" stroke={THEME.cyan} strokeWidth="3" markerEnd="url(#arrowComm)" />
              <rect x="592" y="255" width="106" height="18" rx="4" fill="#0d141d" />
              <text x="645" y="268" textAnchor="middle" fill="#9eb0c3" fontSize={11}>4 msgs · 980</text>

              <path d="M460 95 V310" fill="none" stroke={THEME.cyan} strokeWidth="1.5" markerEnd="url(#arrowComm)" />
              <rect x="459" y="258" width="106" height="18" rx="4" fill="#0d141d" />
              <text x="512" y="271" textAnchor="middle" fill="#9eb0c3" fontSize={11}>2 msgs · 100</text>

              <SvgNode x={380} y={35} w={160} h={60} icon="◇" title="Planner" sub="Ajan" selected={selectedAgent === "Planner"} onClick={() => setSelectedAgent("Planner")} />
              <SvgNode x={90} y={165} w={160} h={60} icon="⌕" title="Researcher" sub="Ajan" selected={selectedAgent === "Researcher"} onClick={() => setSelectedAgent("Researcher")} />
              <SvgNode x={660} y={165} w={160} h={60} icon="≋" title="Analyzer" sub="Ajan" selected={selectedAgent === "Analyzer"} onClick={() => setSelectedAgent("Analyzer")} />
              <SvgNode x={380} y={310} w={160} h={60} icon="✓" title="Validator" sub="Ajan" selected={selectedAgent === "Validator"} onClick={() => setSelectedAgent("Validator")} />
            </svg>
          </div>
        </section>

        {/* Agent Insights Panel */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Ajan Detay Analizi</h2>
            {selectedAgent && (
              <button
                onClick={() => setSelectedAgent(null)}
                style={{ padding: "3px 8px", fontSize: 11, background: "#141e2b", border: `1px solid ${THEME.line}`, borderRadius: 4, cursor: "pointer", color: THEME.text }}
              >
                Sıfırla
              </button>
            )}
          </div>
          <div style={{ padding: 16 }}>
            {selectedAgent && agentStats ? (
              <div>
                <div style={{ color: THEME.cyan, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2, fontWeight: 700 }}>
                  Seçili Ajan
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 12px" }}>{selectedAgent}</div>
                <KVRow label="Gönderilen Mesaj" value={agentStats.sent} />
                <KVRow label="Alınan Mesaj" value={agentStats.recv} />
                <KVRow label="Giden Token" value={agentStats.outTok.toLocaleString()} />
                <KVRow label="Gelen Token" value={agentStats.inTok.toLocaleString()} />
                <KVRow label="Aktarılan Handoff" value={agentStats.handoffs} />
              </div>
            ) : (
              <div>
                <div style={{ color: THEME.cyan, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2, fontWeight: 700 }}>
                  Ağ Özeti
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 6px" }}>4 Ajan Topolojisi</div>
                <p style={{ fontSize: 12, color: THEME.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
                  Çizgedeki herhangi bir ajana tıklayarak özel mesaj ve token akışını görebilirsiniz.
                </p>
                <KVRow label="Toplam Mesaj" value="24" />
                <KVRow label="Toplam Handoff" value="8" />
                <KVRow label="Trafik Tokenı" value="5,900" />
                <KVRow label="Ort. Mesaj Boyu" value="246 tokens" />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Events Aggregation Table */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, marginTop: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>İletişim Trafiği Olay Matrisi</h2>
          <span style={{ fontSize: 11, color: THEME.muted }}>Ajan çiftleri bazında toplanmış istatistikler</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.line}`, textAlign: "left", color: THEME.muted, fontSize: 11, backgroundColor: THEME.panelAlt }}>
                <th style={{ padding: "9px 14px" }}>Kaynak Ajan</th>
                <th style={{ padding: "9px 14px" }}>Hedef Ajan</th>
                <th style={{ padding: "9px 14px" }}>Mesaj Sayısı</th>
                <th style={{ padding: "9px 14px" }}>Token Hacmi</th>
                <th style={{ padding: "9px 14px" }}>Handoff Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {COMM_LINKS.map((link, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${THEME.lineSubtle}` }}>
                  <td style={{ padding: "9px 14px", fontWeight: 600 }}>{link[0]}</td>
                  <td style={{ padding: "9px 14px" }}>{link[1]}</td>
                  <td style={{ padding: "9px 14px", fontWeight: 650, color: THEME.cyan }}>{link[2]}</td>
                  <td style={{ padding: "9px 14px", fontFamily: "monospace" }}>{link[3]}</td>
                  <td style={{ padding: "9px 14px", color: THEME.purple, fontWeight: 600 }}>{link[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 8. EVALUATION CENTER TAB (Dual-Gate Scoreboard, F1 Bar Chart, Held-Out)
// ============================================================================
interface FrameworkEval {
  name: string;
  schemaPass: boolean;
  conflictF1: number;
  heldOutAccuracy: number;
  overallStatus: "QUALIFIED" | "DISQUALIFIED";
}

const EVALUATION_RESULTS: FrameworkEval[] = [
  { name: "LangGraph", schemaPass: true, conflictF1: 0.96, heldOutAccuracy: 95.2, overallStatus: "QUALIFIED" },
  { name: "Microsoft AF", schemaPass: true, conflictF1: 0.95, heldOutAccuracy: 94.8, overallStatus: "QUALIFIED" },
  { name: "Google ADK", schemaPass: true, conflictF1: 0.94, heldOutAccuracy: 93.6, overallStatus: "QUALIFIED" },
  { name: "Pydantic AI", schemaPass: true, conflictF1: 0.94, heldOutAccuracy: 93.1, overallStatus: "QUALIFIED" },
  { name: "CrewAI", schemaPass: true, conflictF1: 0.93, heldOutAccuracy: 91.5, overallStatus: "QUALIFIED" },
  { name: "Agno", schemaPass: true, conflictF1: 0.93, heldOutAccuracy: 92.0, overallStatus: "QUALIFIED" },
  { name: "Mastra", schemaPass: true, conflictF1: 0.92, heldOutAccuracy: 90.8, overallStatus: "QUALIFIED" },
  { name: "OpenAI Agents", schemaPass: true, conflictF1: 0.92, heldOutAccuracy: 91.2, overallStatus: "QUALIFIED" },
  { name: "LlamaAgents", schemaPass: true, conflictF1: 0.91, heldOutAccuracy: 90.1, overallStatus: "QUALIFIED" },
  { name: "Smolagents", schemaPass: true, conflictF1: 0.88, heldOutAccuracy: 86.4, overallStatus: "DISQUALIFIED" },
];

function EvaluationCenterTab() {
  const qualifiedCount = EVALUATION_RESULTS.filter((e) => e.overallStatus === "QUALIFIED").length;

  return (
    <div>
      {/* Header with Compact Inline Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            ADR-0007 DUAL-GATE EVALUATION & BENCHMARK SCOREBOARD
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700 }}>Evaluation Center</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Zorunlu geçiş kapıları (Hard Gates), etiketli veri seti F1 doğrulaması ve held-out test sonuçları.
          </p>
        </div>

        {/* Inline Scoreboard Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: THEME.panel,
            border: `1px solid ${THEME.line}`,
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <span style={{ color: THEME.green, fontWeight: 650 }}>{qualifiedCount} / 10 Barajı Geçti</span>
          <span style={{ color: THEME.line }}>|</span>
          <span>Eşik: <strong style={{ color: THEME.amber }}>F1 ≥ 0.90</strong></span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.cyan }}>Schema: 10/10 Geçerli</span>
        </div>
      </div>

      {/* Visual F1 Distribution Bar Chart */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Etiketli Çelişki F1 Skoru Karşılaştırması</h2>
            <span style={{ fontSize: 11, color: THEME.muted }}>Kırmızı dikey çizgi: Zorunlu Hard Gate Barajı (0.90)</span>
          </div>
          <span style={{ fontSize: 11, color: THEME.green, fontWeight: 600 }}>En Yüksek: LangGraph (0.96)</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {EVALUATION_RESULTS.map((item) => {
            const isPassing = item.conflictF1 >= 0.90;
            const barWidth = Math.max(0, ((item.conflictF1 - 0.8) / 0.2) * 100);
            return (
              <div key={item.name} style={{ display: "grid", gridTemplateColumns: "130px 1fr 60px", alignItems: "center", gap: 12, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: isPassing ? THEME.text : THEME.red }}>{item.name}</span>
                <div style={{ position: "relative", height: 16, backgroundColor: THEME.panelAlt, borderRadius: 3, overflow: "hidden" }}>
                  {/* 0.90 threshold vertical indicator line (at 50% since range is 0.80 to 1.00) */}
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, backgroundColor: THEME.amber, zIndex: 2 }} />
                  {/* Bar fill */}
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: "100%",
                      backgroundColor: isPassing ? THEME.cyan : THEME.red,
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ fontWeight: 700, fontFamily: "monospace", color: isPassing ? THEME.green : THEME.red, textAlign: "right" }}>
                  {item.conflictF1.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Framework Scoreboard Table */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Dual-Gate Değerlendirme Çetelesi (10 Framework)</h2>
          <span style={{ fontSize: 11, color: THEME.muted }}>Held-Out Test Seti Doğrulaması</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: THEME.panelAlt, textAlign: "left", borderBottom: `1px solid ${THEME.line}`, color: THEME.muted, fontSize: 11 }}>
                <th style={{ padding: "10px 16px" }}>Framework</th>
                <th style={{ padding: "10px 16px" }}>Gate 1: JSON Schema</th>
                <th style={{ padding: "10px 16px" }}>Gate 2: Conflict F1 (≥ 0.90)</th>
                <th style={{ padding: "10px 16px" }}>Held-Out Doğruluğu</th>
                <th style={{ padding: "10px 16px" }}>Sonuç Durumu</th>
                <th style={{ padding: "10px 16px", textAlign: "right" }}>Öneri Havuzu</th>
              </tr>
            </thead>
            <tbody>
              {EVALUATION_RESULTS.map((row) => (
                <tr key={row.name} style={{ borderBottom: `1px solid ${THEME.lineSubtle}` }}>
                  <td style={{ padding: "10px 16px", fontWeight: 650 }}>{row.name}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ color: THEME.green, fontWeight: 600 }}>✓ PASS (1.0)</span>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ color: row.conflictF1 >= 0.90 ? THEME.green : THEME.red, fontWeight: 700, fontFamily: "monospace" }}>
                      {row.conflictF1.toFixed(2)} {row.conflictF1 >= 0.90 ? "✓" : "✗"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", fontFamily: "monospace" }}>
                    %{row.heldOutAccuracy.toFixed(1)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 4,
                        backgroundColor: row.overallStatus === "QUALIFIED" ? "rgba(82, 216, 164, 0.15)" : "rgba(239, 134, 148, 0.15)",
                        color: row.overallStatus === "QUALIFIED" ? THEME.green : THEME.red,
                        border: `1px solid ${row.overallStatus === "QUALIFIED" ? THEME.green : THEME.red}`,
                      }}
                    >
                      {row.overallStatus}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    <span style={{ color: row.overallStatus === "QUALIFIED" ? THEME.cyan : THEME.muted, fontSize: 11 }}>
                      {row.overallStatus === "QUALIFIED" ? "Uygun (Eligible)" : "Elendi"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 9. COMPARISON LAB TAB (Weights, 2D Pareto Plot, Podium, Ranking - NO SPARKS)
// ============================================================================
interface RankedItem {
  name: string;
  v: [number, number, number, number];
  score: number;
}

function ComparisonLabTab() {
  const [weights, setWeights] = useState([40, 25, 20, 15]);
  const [minQuality, setMinQuality] = useState(80);

  const resetWeights = () => {
    setWeights([40, 25, 20, 15]);
    setMinQuality(80);
  };

  const totalW = weights.reduce((a, b) => a + b, 0);
  const eligiblePool = FRAMEWORKS_DATA.filter((fw) => fw.v[0] >= minQuality);

  const ranked: RankedItem[] = totalW
    ? eligiblePool
      .map((fw) => {
        const w0 = weights[0] ?? 0;
        const w1 = weights[1] ?? 0;
        const w2 = weights[2] ?? 0;
        const w3 = weights[3] ?? 0;
        const score = (fw.v[0] * w0 + fw.v[1] * w1 + fw.v[2] * w2 + fw.v[3] * w3) / totalW;
        return {
          name: fw.name,
          v: fw.v,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
    : [];

  const top = ranked[0] ?? null;

  // 2D Pareto frontier for Speed vs Quality
  const paretoPoints = eligiblePool
    .filter(
      (a) =>
        !eligiblePool.some(
          (b) => b.v[0] >= a.v[0] && b.v[1] >= a.v[1] && (b.v[0] > a.v[0] || b.v[1] > a.v[1])
        )
    )
    .sort((a, b) => a.v[1] - b.v[1]);

  const scaleX = (speed: number) => 48 + (speed - 60) * 8.1;
  const scaleY = (quality: number) => 220 - (quality - 70) * 6.2;

  return (
    <div>
      {/* Header with Compact Inline Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            DECISION ENGINE & PARETO FRONTIER
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700 }}>Comparison Lab & Recommendation</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Öncelik ağırlıklarını belirleyin, 2D Pareto dengesini inceleyin ve kazanan adayı seçin.
          </p>
        </div>

        {/* Inline Decision Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: THEME.panel,
            border: `1px solid ${THEME.line}`,
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <span>Aday Havuzu: <strong style={{ color: THEME.text }}>10</strong></span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.green }}>{eligiblePool.length} Uygun</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.cyan }}>Lider: <strong>{top ? top.name : "—"}</strong> ({top ? top.score.toFixed(1) : "—"})</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(230px, 1fr) minmax(0, 1.3fr) minmax(0, 1.35fr)", gap: 14 }}>
        {/* Left: Optimization Weights */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Optimizasyon Ağırlıkları</h2>
          </div>
          <div style={{ padding: 16 }}>
            {["Kalite", "Hız", "Token Verimliliği", "Güvenilirlik"].map((label, idx) => {
              const currentWeight = weights[idx] ?? 0;
              return (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: THEME.muted }}>{label}</span>
                    <b style={{ color: THEME.text }}>{totalW ? ((currentWeight / totalW) * 100).toFixed(0) : 0}%</b>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentWeight}
                    onChange={(e) => {
                      const next = [...weights];
                      next[idx] = Number(e.target.value);
                      setWeights(next);
                    }}
                    style={{ width: "100%", accentColor: THEME.cyan }}
                  />
                </div>
              );
            })}

            <div style={{ marginBottom: 14, borderTop: `1px solid ${THEME.line}`, paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: THEME.muted }}>Asgari Kalite Barajı</span>
                <b style={{ color: THEME.amber }}>{minQuality} / 100</b>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={minQuality}
                onChange={(e) => setMinQuality(Number(e.target.value))}
                style={{ width: "100%", accentColor: THEME.amber }}
              />
            </div>

            <button
              onClick={resetWeights}
              style={{
                width: "100%",
                padding: "7px 12px",
                background: "#141e2b",
                border: `1px solid ${THEME.line}`,
                borderRadius: 5,
                color: THEME.text,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Ağırlıkları Sıfırla
            </button>
          </div>
        </section>

        {/* Center: Quality vs Speed Pareto Scatter Plot */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Kalite & Hız Pareto Eğrisi</h2>
          </div>
          <div style={{ padding: 16 }}>
            <svg viewBox="0 0 400 265" style={{ width: "100%", display: "block" }}>
              {/* Axes lines & labels */}
              {[60, 70, 80, 90, 100].map((v) => (
                <g key={`x-${v}`}>
                  <line x1={scaleX(v)} y1="34" x2={scaleX(v)} y2="220" stroke="#212c38" />
                  <text x={scaleX(v)} y="237" textAnchor="middle" fill="#91a0b4" fontSize="10">{v}</text>
                </g>
              ))}
              {[70, 80, 90, 100].map((v) => (
                <g key={`y-${v}`}>
                  <line x1="48" y1={scaleY(v)} x2="372" y2={scaleY(v)} stroke="#212c38" />
                  <text x="38" y={scaleY(v) + 3} textAnchor="end" fill="#91a0b4" fontSize="10">{v}</text>
                </g>
              ))}

              <text x="210" y="259" textAnchor="middle" fill="#91a0b4" fontSize={11}>Hız Skoru →</text>
              <text x="10" y="20" fill="#91a0b4" fontSize={11}>Kalite ↑</text>

              {/* Dashed Pareto Polyline */}
              {paretoPoints.length > 1 && (
                <polyline
                  points={paretoPoints.map((p) => `${scaleX(p.v[1])},${scaleY(p.v[0])}`).join(" ")}
                  stroke={THEME.purple}
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  fill="none"
                />
              )}

              {/* Framework dots */}
              {FRAMEWORKS_DATA.map((item) => {
                const isWinner = top && item.name === top.name;
                const isEligible = item.v[0] >= minQuality;
                const cx = scaleX(item.v[1]);
                const cy = scaleY(item.v[0]);
                const dotColor = isWinner ? THEME.cyan : isEligible ? THEME.blue : "#49576b";

                return (
                  <g key={item.name}>
                    <circle cx={cx} cy={cy} r={isWinner ? 6 : 4} fill={dotColor}>
                      <title>{`${item.name} · Kalite ${item.v[0]} · Hız ${item.v[1]}`}</title>
                    </circle>
                    {isWinner && (
                      <text x={cx} y={cy - 10} textAnchor="middle" fill={THEME.cyan} fontSize="11" fontWeight={700}>
                        {item.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            <p style={{ fontSize: 11, color: THEME.muted, margin: "10px 0 0" }}>
              Kesikli mor çizgi: Bu iki eksende baskılanmamış (non-dominated) Pareto adaylarıdır.
            </p>
          </div>
        </section>

        {/* Right: Recommendation Podium */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Öneri Kürsüsü</h2>
          </div>
          <div style={{ padding: 16 }}>
            {top ? (
              <div>
                <div style={{ color: THEME.cyan, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3, fontWeight: 700 }}>
                  En Yüksek Ağırlıklı Eşleşme
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, margin: "2px 0" }}>{top.name}</div>
                <div style={{ fontSize: 36, fontWeight: 750, letterSpacing: "-0.05em", color: THEME.cyan }}>
                  {top.score.toFixed(1)}
                  <span style={{ fontSize: 15, color: THEME.muted, fontWeight: 400 }}> / 100</span>
                </div>
                <p style={{ fontSize: 11, color: THEME.muted, margin: "4px 0 14px", lineHeight: 1.4 }}>
                  Mevcut öncelik parametrelerinize göre asgari kalite barajını geçen en yüksek puanlı aday.
                </p>

                <KVRow label="Kalite" value={`${top.v[0]} / 100`} />
                <KVRow label="Hız" value={`${top.v[1]} / 100`} />
                <KVRow label="Token Verimliliği" value={`${top.v[2]} / 100`} />
                <KVRow label="Güvenilirlik" value={`${top.v[3]} / 100`} />

                <Link
                  to="/library-exporter"
                  style={{
                    display: "block",
                    textAlign: "center",
                    backgroundColor: "#164558",
                    color: "#d0f6ff",
                    border: "1px solid #3785a3",
                    padding: "9px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                    marginTop: 16,
                  }}
                >
                  Kazananı Bağımsız Proje Olarak Dışa Aktar →
                </Link>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: THEME.muted }}>Belirtilen asgari kalite eşiğini karşılayan framework bulunamadı.</p>
            )}
          </div>
        </section>
      </div>

      {/* Weighted Ranking Table */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 8, marginTop: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${THEME.line}` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Ağırlıklı Sıralama Tablosu</h2>
          <span style={{ fontSize: 11, color: THEME.muted }}>Normalleştirilmiş Kompozit Skor</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.line}`, textAlign: "left", color: THEME.muted, fontSize: 11, backgroundColor: THEME.panelAlt }}>
                <th style={{ padding: "9px 14px", width: 35 }}>Sıra</th>
                <th style={{ padding: "9px 14px" }}>Framework</th>
                <th style={{ padding: "9px 14px" }}>Kompozit Skor</th>
                <th style={{ padding: "9px 14px" }}>Kalite</th>
                <th style={{ padding: "9px 14px" }}>Hız</th>
                <th style={{ padding: "9px 14px" }}>Token</th>
                <th style={{ padding: "9px 14px" }}>Güvenilirlik</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((fw, idx) => {
                const isHighlight = idx === 0;
                return (
                  <tr key={fw.name} style={{ borderBottom: `1px solid ${THEME.lineSubtle}`, backgroundColor: isHighlight ? "#132834" : "transparent" }}>
                    <td style={{ padding: "9px 14px", color: isHighlight ? THEME.cyan : THEME.muted, fontWeight: 700 }}>#{idx + 1}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 600 }}>{fw.name}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 700, color: isHighlight ? THEME.cyan : THEME.text }}>{fw.score.toFixed(1)}</td>
                    {fw.v.map((val, vi) => (
                      <td key={vi} style={{ padding: "9px 14px" }}>
                        {val}
                        <div style={{ height: 3, background: "#202a38", borderRadius: 3, overflow: "hidden", marginTop: 3 }}>
                          <div style={{ width: `${val}%`, height: "100%", background: THEME.cyan }} />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 10. PROJECT & EXPORTER TAB (Secret-Free Export, History, Format Selectors)
// ============================================================================
function LibraryExporterTab() {
  const [downloaded, setDownloaded] = useState(false);
  const [exportFormat, setExportFormat] = useState<"zip" | "docker" | "poetry">("zip");

  return (
    <div>
      {/* Header with Compact Inline Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
            ADR-0009 & ADR-0010 SECRET-FREE EXPORT
          </div>
          <h1 style={{ fontSize: 26, margin: "0 0 4px", fontWeight: 700 }}>Project Export & Artifacts</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Kazanan pipeline'ın platform bağımlılığı ve gizli anahtar içermeyen taşınabilir bağımsız paketi.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: THEME.panel,
            border: `1px solid ${THEME.line}`,
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <span style={{ color: THEME.green }}>✓ Secret-Free Denetlendi</span>
          <span style={{ color: THEME.line }}>|</span>
          <span style={{ color: THEME.cyan }}>Zero-Vendor Dependency</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        {/* Main Export Card */}
        <div style={{ backgroundColor: THEME.panel, borderRadius: 8, border: `1px solid ${THEME.line}`, padding: 22 }}>
          {/* Format Selector Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: `1px solid ${THEME.line}`, paddingBottom: 12 }}>
            <button
              onClick={() => setExportFormat("zip")}
              style={{
                backgroundColor: exportFormat === "zip" ? "#192f3f" : "transparent",
                color: exportFormat === "zip" ? THEME.cyan : THEME.muted,
                border: `1px solid ${exportFormat === "zip" ? "#31657c" : "transparent"}`,
                padding: "6px 12px",
                borderRadius: 5,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              📦 Standalone Zip
            </button>
            <button
              onClick={() => setExportFormat("docker")}
              style={{
                backgroundColor: exportFormat === "docker" ? "#192f3f" : "transparent",
                color: exportFormat === "docker" ? THEME.cyan : THEME.muted,
                border: `1px solid ${exportFormat === "docker" ? "#31657c" : "transparent"}`,
                padding: "6px 12px",
                borderRadius: 5,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🐳 Docker Paketi
            </button>
            <button
              onClick={() => setExportFormat("poetry")}
              style={{
                backgroundColor: exportFormat === "poetry" ? "#192f3f" : "transparent",
                color: exportFormat === "poetry" ? THEME.cyan : THEME.muted,
                border: `1px solid ${exportFormat === "poetry" ? "#31657c" : "transparent"}`,
                padding: "6px 12px",
                borderRadius: 5,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🐍 Python Paketi
            </button>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.cyan, margin: "0 0 8px" }}>
            arena-export-langgraph.zip (Kazanan Aday Paketi)
          </h3>
          <p style={{ fontSize: 12, color: THEME.muted, lineHeight: 1.6, margin: "0 0 16px" }}>
            Bu paket hiçbir Arena kütüphanesine veya platform gizli anahtarına bağımlı değildir. Bağımsız Docker ortamında veya temiz bir Python sanal ortamında doğrudan çalıştırılabilir.
          </p>

          <div
            style={{
              backgroundColor: THEME.panelAlt,
              borderRadius: 6,
              padding: 14,
              fontSize: 12,
              fontFamily: "ui-monospace, monospace",
              color: THEME.text,
              marginBottom: 20,
              border: `1px solid ${THEME.line}`,
              lineHeight: 1.9,
            }}
          >
            <div>📄 README.md (Bağımsız çalıştırma talimatı & ortam değişkenleri)</div>
            <div>🐳 Dockerfile (Minimal bağımsız container tanımı)</div>
            <div>📦 pyproject.toml (Yalnızca LangGraph ve resmi bağımlılıkları)</div>
            <div>🐍 main.py (Dondurulmuş native pipeline kodu)</div>
            <div>🔒 .env.example (Model sağlayıcısı için boş şablon - API key içermez)</div>
          </div>

          <button
            onClick={() => setDownloaded(true)}
            style={{
              backgroundColor: "#164558",
              color: "#d0f6ff",
              border: "1px solid #3785a3",
              padding: "10px 22px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {downloaded ? "✓ Paket İndirildi (Zip Hazır)" : "Bağımsız Projeyi İndir (Secret-Free Export)"}
          </button>
        </div>

        {/* Export History & Security Audit Panel */}
        <div style={{ backgroundColor: THEME.panel, borderRadius: 8, border: `1px solid ${THEME.line}`, padding: 20 }}>
          <h4 style={{ fontSize: 13, color: THEME.muted, margin: "0 0 12px", textTransform: "uppercase" }}>
            Dışa Aktarım Geçmişi & Doğrulama
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
            <div style={{ backgroundColor: THEME.panelAlt, padding: 10, borderRadius: 5, border: `1px solid ${THEME.lineSubtle}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <b style={{ color: THEME.text }}>arena-export-langgraph.zip</b>
                <span style={{ color: THEME.green }}>✓ SHA256 OK</span>
              </div>
              <div style={{ fontSize: 10, color: THEME.muted, fontFamily: "monospace" }}>
                2026-11-24 10:25 · 48.2 KB · 0 secrets found
              </div>
            </div>

            <div style={{ backgroundColor: THEME.panelAlt, padding: 10, borderRadius: 5, border: `1px solid ${THEME.lineSubtle}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <b style={{ color: THEME.text }}>arena-export-agno.zip</b>
                <span style={{ color: THEME.green }}>✓ SHA256 OK</span>
              </div>
              <div style={{ fontSize: 10, color: THEME.muted, fontFamily: "monospace" }}>
                2026-11-23 16:50 · 42.1 KB · 0 secrets found
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: 12, borderRadius: 6, backgroundColor: "rgba(82, 216, 164, 0.08)", border: `1px solid rgba(82, 216, 164, 0.2)` }}>
            <div style={{ color: THEME.green, fontWeight: 650, fontSize: 11, marginBottom: 4 }}>
              ✓ ADR-0009 İzolasyon Garantisi
            </div>
            <div style={{ color: THEME.muted, fontSize: 11, lineHeight: 1.5 }}>
              Platform dışa aktarılan paketleri AST düzeyinde tarar. Hiçbir hardcoded API anahtarı, dahili paket referansı veya özel log içermez.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
function KVRow({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: `1px solid ${THEME.lineSubtle}`, fontSize: 12 }}>
      <span style={{ color: THEME.muted }}>{label}</span>
      <strong style={{ fontWeight: 600, color: color || THEME.text }}>{value}</strong>
    </div>
  );
}

function MetricSpark({ title, value, subtitle, color }: { title: string; value: string; subtitle?: string; color: string }) {
  return (
    <div
      style={{
        backgroundColor: THEME.panel,
        border: `1px solid ${THEME.line}`,
        borderRadius: 8,
        padding: "16px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <small style={{ display: "block", color: THEME.muted, fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </small>
        <strong style={{ fontSize: 24, letterSpacing: "-0.04em", fontWeight: 700, color: THEME.text }}>
          {value}
        </strong>
        {subtitle && (
          <div style={{ fontSize: 11, color: THEME.muted, marginTop: 4 }}>{subtitle}</div>
        )}
      </div>
      <svg style={{ width: 68, height: 28, flexShrink: 0 }} viewBox="0 0 72 30" aria-hidden="true">
        <path
          d="M1 25 L10 19 L19 22 L29 11 L39 15 L49 8 L59 12 L71 3"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SvgNode({ x, y, w, h, icon, title, sub, status, selected, onClick }: any) {
  const isSelected = selected;
  const isComplete = status === "complete";
  const isRunning = status === "running";
  const strokeColor = isSelected ? THEME.cyan : isRunning ? THEME.cyan : isComplete ? "#3d826e" : "#3c5064";
  const fillColor = isSelected ? "#172d39" : "#121b26";

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <rect x={x} y={y} width={w} height={h} rx={7} fill={fillColor} stroke={strokeColor} strokeWidth={isSelected || isRunning ? 2 : 1.2} />
      <text x={x + 14} y={y + 34} fill={THEME.cyan} fontSize={17}>{icon}</text>
      <text x={x + 35} y={y + 25} fill="#e7edf6" fontSize={13} fontWeight={600}>{title}</text>
      <text x={x + 35} y={y + 42} fill="#99aabc" fontSize={10}>{sub}</text>
    </g>
  );
}
