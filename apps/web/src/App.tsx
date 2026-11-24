import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

// Shared color palette & CSS variables
const THEME = {
  bg: "#0b1017",
  panel: "#101720",
  line: "#253141",
  muted: "#91a0b4",
  text: "#e7edf6",
  cyan: "#53cbe8",
  blue: "#719dff",
  green: "#52d8a4",
  purple: "#ae92f5",
  amber: "#e7b971",
  red: "#ef8694",
};

interface FrameworkRecord {
  name: string;
  caps: number[]; // 10 capability values: 2=native, 1=adapter, 0=unverified
  v: [number, number, number, number]; // [Quality, Speed, Token efficiency, Reliability]
}

const FRAMEWORKS_DATA: FrameworkRecord[] = [
  { name: "LangGraph", caps: [2, 2, 2, 2, 2, 2, 2, 2, 1, 2], v: [94, 76, 78, 96] },
  { name: "Google ADK", caps: [2, 2, 2, 2, 2, 2, 1, 2, 2, 1], v: [90, 85, 86, 93] },
  { name: "OpenAI Agents", caps: [1, 1, 2, 2, 2, 2, 1, 2, 2, 2], v: [87, 91, 85, 89] },
  { name: "CrewAI", caps: [1, 2, 1, 2, 2, 1, 2, 2, 1, 0], v: [92, 62, 61, 86] },
  { name: "Pydantic AI", caps: [2, 1, 1, 1, 2, 2, 2, 2, 2, 2], v: [89, 87, 92, 95] },
  { name: "Agno", caps: [2, 2, 1, 2, 2, 2, 1, 1, 1, 2], v: [85, 97, 95, 84] },
  { name: "LlamaAgents", caps: [2, 2, 1, 1, 2, 2, 2, 1, 1, 2], v: [86, 83, 82, 88] },
  { name: "Smolagents", caps: [1, 1, 1, 1, 2, 2, 1, 0, 0, 1], v: [78, 94, 96, 81] },
  { name: "Mastra", caps: [2, 2, 2, 2, 2, 2, 1, 2, 1, 2], v: [88, 89, 87, 87] },
  { name: "Microsoft AF", caps: [2, 2, 2, 2, 2, 1, 2, 2, 2, 2], v: [91, 80, 76, 95] },
];

const CAPABILITIES = [
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

const NAVIGATION_SECTIONS = [
  { path: "/", label: "Overview", icon: "✦" },
  { path: "/task-studio", label: "Task Studio", icon: "✎" },
  { path: "/pipeline-designer", label: "Pipeline Designer", icon: "⎇" },
  { path: "/framework-hub", label: "Framework Hub", icon: "▦" },
  { path: "/development-studio", label: "Development Studio", icon: "⚙" },
  { path: "/execution-arena", label: "Execution Arena", icon: "▶" },
  { path: "/telemetry-center", label: "Telemetry Center", icon: "⌁" },
  { path: "/evaluation-center", label: "Evaluation Center", icon: "⚖" },
  { path: "/comparison-lab", label: "Comparison Lab", icon: "◈" },
  { path: "/library-exporter", label: "Project & Exporter", icon: "⤓" },
];

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
      {/* Sleek Sidebar */}
      <aside
        style={{
          width: 250,
          borderRight: `1px solid ${THEME.line}`,
          backgroundColor: THEME.panel,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px 18px", borderBottom: `1px solid ${THEME.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                display: "inline-grid",
                placeItems: "center",
                color: THEME.cyan,
                border: "1px solid #407688",
                borderRadius: 7,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              △
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 750, letterSpacing: "0.1em", color: THEME.text }}>
                AGENTIC ARENA
              </div>
              <div style={{ fontSize: 11, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>
                Research Suite · DEMO #042
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
              padding: "4px 10px 8px",
            }}
          >
            Arena Workspaces
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
                  backgroundColor: isActive ? "#172532" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  marginBottom: 3,
                  border: isActive ? "1px solid #234354" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 13 }}>{sec.icon}</span>
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
              padding: "16px 10px 8px",
            }}
          >
            Standalone Prototypes
          </div>
          <a
            href="/prototypes/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: 6,
              color: THEME.muted,
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            <span>↗</span>
            <span>Raw HTML Suite</span>
          </a>
        </nav>

        <div style={{ padding: "14px 18px", borderTop: `1px solid ${THEME.line}`, fontSize: 11, color: THEME.muted }}>
          <div>One task. One model.</div>
          <div style={{ color: THEME.cyan, fontWeight: 600, marginTop: 2 }}>Ten Native Frameworks.</div>
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: THEME.muted }}>Project:</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>doc-review (#042)</span>
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: THEME.line }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: THEME.muted }}>Model Lock:</span>
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
              <span style={{ fontSize: 12, color: THEME.muted }}>Canonical Ledger:</span>
              <span style={{ fontSize: 12, color: THEME.green, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>
                57.2K tokens ($0.114)
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: THEME.muted }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: THEME.green }} />
              10 / 10 Frameworks Verified
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: "26px 32px", overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<OverviewTab />} />
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

/* ========================================================================= */
/* 1. OVERVIEW TAB (Integrated with index.html Prototype Cards)              */
/* ========================================================================= */
function OverviewTab() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontWeight: 650 }}>
          DESIGN PROTOTYPE & PLATFORM OVERVIEW
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 6px", fontWeight: 650, letterSpacing: "-0.035em" }}>
          Agentic Arena · UI Collection
        </h1>
        <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
          Five standalone research interfaces. No backend or external dependencies. Same task. Same model. Ten frameworks.
        </p>
      </div>

      {/* Top Metrics with Sparklines */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <MetricSpark title="Frameworks" value="10" color={THEME.cyan} />
        <MetricSpark title="Completed" value="3 / 10" color={THEME.green} />
        <MetricSpark title="Total tokens" value="57.2K" color={THEME.purple} />
        <MetricSpark title="Elapsed" value="42.8 s" color={THEME.amber} />
      </div>

      {/* 5 Prototype View Cards from index.html */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 24 }}>
        <PrototypeCard
          num="01 / VIEW"
          title="Pipeline designer"
          desc="Explore dynamic workflow nodes, parallel branches and retry paths with node inspector."
          link="/pipeline-designer"
        />
        <PrototypeCard
          num="02 / VIEW"
          title="Live arena"
          desc="Compare ten simulated framework runs with live progress, agent graph and event logs."
          link="/execution-arena"
        />
        <PrototypeCard
          num="03 / VIEW"
          title="Communication"
          desc="Inspect messages, handoffs and token flow between agents with interactive network analysis."
          link="/telemetry-center"
        />
        <PrototypeCard
          num="04 / VIEW"
          title="Capability matrix"
          desc="Explore an illustrative framework capability matrix with search, filters and cell inspector."
          link="/framework-hub"
        />
        <PrototypeCard
          num="05 / VIEW"
          title="Recommendation"
          desc="Adjust metric weights and compare weighted rankings and 2D Pareto trade-offs."
          link="/comparison-lab"
        />
        <div style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, padding: 22 }}>
          <div style={{ color: THEME.cyan, fontFamily: "monospace", fontSize: 12, marginBottom: 6 }}>
            ADR IMPARTIALITY
          </div>
          <h2 style={{ fontSize: 18, margin: "0 0 8px", fontWeight: 650 }}>Single Model Lock & Hard Gates</h2>
          <p style={{ color: THEME.muted, fontSize: 12, margin: "0 0 12px", lineHeight: 1.5 }}>
            No framework-level model overrides (ADR-0003), canonical provider_reported token accounting without double counting (ADR-0012), and secret-free exports (ADR-0009).
          </p>
          <span style={{ fontSize: 11, color: THEME.green, fontWeight: 600 }}>✓ All 10 Frameworks Conformance Verified</span>
        </div>
      </div>
    </div>
  );
}

function PrototypeCard({ num, title, desc, link }: { num: string; title: string; desc: string; link: string }) {
  return (
    <Link
      to={link}
      style={{
        display: "block",
        padding: 22,
        backgroundColor: THEME.panel,
        border: `1px solid ${THEME.line}`,
        borderRadius: 10,
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s ease",
      }}
    >
      <span style={{ color: THEME.cyan, fontFamily: "monospace", fontSize: 12 }}>{num}</span>
      <h2 style={{ fontSize: 18, margin: "8px 0 6px", fontWeight: 650 }}>{title}</h2>
      <p style={{ color: THEME.muted, fontSize: 12, margin: "0 0 12px", lineHeight: 1.5 }}>{desc}</p>
      <span style={{ color: THEME.cyan, fontSize: 13, fontWeight: 600 }}>Open interface →</span>
    </Link>
  );
}

/* ========================================================================= */
/* 2. TASK STUDIO TAB                                                        */
/* ========================================================================= */
function TaskStudioTab() {
  const [objective, setObjective] = useState("Sözleşmeleri analiz et, teslim tarihi ve bütçe çelişkilerini bul ve kanıtlı rapor üret.");
  const [isApproved, setIsApproved] = useState(false);
  const specHash = "4d933042f4d12823a3717b23dde4dfde8e76238870ff528aa1357777b6d2ffee";

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontWeight: 650 }}>
          TASK SPECIFICATION & RFC 8785 HASH
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 6px", fontWeight: 650 }}>Task Studio</h1>
        <p style={{ color: THEME.muted, fontSize: 13, margin: 0 }}>
          Gereksinim netleştirme, serbest alanlar ve Kanonik TaskSpec onay ekranı (GP §5, §13.3).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        <div style={{ backgroundColor: THEME.panel, borderRadius: 10, border: `1px solid ${THEME.line}`, padding: 22 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: THEME.text, display: "block", marginBottom: 8 }}>
            Görev Hedefi (Objective)
          </label>
          <textarea
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 6,
              backgroundColor: "#0d141d",
              border: `1px solid ${THEME.line}`,
              color: THEME.text,
              fontSize: 13,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />

          <div style={{ marginTop: 18 }}>
            <h4 style={{ fontSize: 13, color: THEME.cyan, margin: "0 0 8px" }}>Hard Kriterler (Zorunlu Geçiş Kapıları)</h4>
            <div style={{ fontSize: 12, color: THEME.muted, lineHeight: 1.8 }}>
              • <code style={{ color: THEME.green }}>valid_schema</code>: JSON Schema uyumluluğu == 1.0 (Zorunlu)<br />
              • <code style={{ color: THEME.green }}>conflict_f1</code>: Etiketli çelişki F1 skoru ≥ 0.90 (Zorunlu)
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h4 style={{ fontSize: 13, color: THEME.purple, margin: "0 0 8px" }}>İzin Verilen Serbest Alanlar</h4>
            <div style={{ fontSize: 12, color: THEME.muted, lineHeight: 1.6 }}>
              Ajan sayısı, topoloji, prompt ve bellek stratejisi her framework'ün kendi native mimarisine serbest bırakılmıştır.
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            {!isApproved ? (
              <button
                onClick={() => setIsApproved(true)}
                style={{
                  backgroundColor: "#153849",
                  color: "#b6f2ff",
                  border: "1px solid #377b91",
                  padding: "9px 18px",
                  borderRadius: 7,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Approve & Build (Kanonik Hash ile Kilitle)
              </button>
            ) : (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  backgroundColor: "rgba(82, 216, 164, 0.12)",
                  border: `1px solid ${THEME.green}`,
                  color: THEME.green,
                  fontSize: 12,
                }}
              >
                ✓ Spec Onaylandı! Kanonik RFC 8785 Hash: <code>{specHash.slice(0, 16)}...</code>
              </div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: THEME.panel, borderRadius: 10, border: `1px solid ${THEME.line}`, padding: 22 }}>
          <h4 style={{ fontSize: 13, color: THEME.muted, margin: "0 0 12px" }}>Kanonik TaskSpec YAML Önizlemesi</h4>
          <pre
            style={{
              margin: 0,
              padding: 14,
              backgroundColor: "#0d141d",
              borderRadius: 6,
              fontSize: 11,
              color: THEME.text,
              overflowX: "auto",
              border: `1px solid ${THEME.line}`,
              fontFamily: "ui-monospace, monospace",
            }}
          >
{`schema_version: 1
project_id: doc-review
input_mode: natural_language
comparison_mode: native
frameworks: [10 frameworks]
model:
  model_id: gemini-1.5-pro
  fallback: disabled
criteria:
  - id: valid_schema (required, == 1.0)
  - id: conflict_f1 (required, >= 0.90)`}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 3. PIPELINE DESIGNER TAB (Full implementation of pipeline.html)           */
/* ========================================================================= */
const NODE_INFO: Record<string, [string, string, string, string, string]> = {
  "User task": ["Receive task input.", "Done", "145", "0.18 s", "None"],
  Planner: ["Create a task-specific plan.", "Done", "1,326", "0.91 s", "None"],
  Researcher: ["Gather evidence using external tools.", "Running", "4,218", "2.14 s", "Search, Read"],
  Analyzer: ["Analyze gathered information.", "Queued", "—", "—", "Calculator"],
  Validator: ["Check the output against acceptance criteria.", "Queued", "—", "—", "None"],
  "Final output": ["Package the validated result.", "Queued", "—", "—", "None"],
};

function PipelineDesignerTab() {
  const [selectedNode, setSelectedNode] = useState("Researcher");
  const [isPaused, setIsPaused] = useState(false);

  const fallbackData: [string, string, string, string, string] = [
    "Gather evidence using external tools.",
    "Running",
    "4,218",
    "2.14 s",
    "Search, Read",
  ];
  const nodeData = NODE_INFO[selectedNode] ?? fallbackData;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
            RESEARCH WORKSPACE
          </div>
          <h1 style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 650 }}>Pipeline designer</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Native workflow · Dynamic routing and agent execution
          </p>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            backgroundColor: "#153849",
            borderColor: "#377b91",
            color: "#b6f2ff",
            border: "1px solid",
            padding: "8px 14px",
            borderRadius: 7,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* 4 Sparkline Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <MetricSpark title="Nodes" value="6" color={THEME.cyan} />
        <MetricSpark title="Active agents" value="1" color={THEME.green} />
        <MetricSpark title="Tokens" value="12,846" color={THEME.purple} />
        <MetricSpark title="Retries" value="1 / 3" color={THEME.amber} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.4fr) minmax(260px, 1fr)", gap: 14 }}>
        {/* Canvas Section */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Native workflow</h2>
            <span style={{ fontSize: 11, fontWeight: 600, color: isPaused ? THEME.amber : THEME.cyan, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: isPaused ? THEME.amber : THEME.cyan }} />
              {isPaused ? "Paused" : "Running"}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#0d141d",
              backgroundImage: "radial-gradient(#304154 0.65px, transparent .65px)",
              backgroundSize: "18px 18px",
              padding: 10,
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
              <text x="570" y="23" fill="#9eb0c3" fontSize="11">Retry if validation fails</text>

              {/* Interactive Nodes */}
              <SvgNode
                x={30}
                y={150}
                w={135}
                h={60}
                icon="↳"
                title="User task"
                sub="Input"
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
                sub="Agent"
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
                sub="Agent"
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
                sub="Agent"
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
                sub="Review"
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
                sub="Artifact"
                status="queued"
                selected={selectedNode === "Final output"}
                onClick={() => setSelectedNode("Final output")}
              />
            </svg>
          </div>

          <div style={{ display: "flex", gap: 15, alignItems: "center", color: THEME.muted, fontSize: 11, padding: "11px 16px", borderTop: `1px solid ${THEME.line}` }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.green, marginRight: 5 }} />Completed</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.cyan, marginRight: 5 }} />Active</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.muted, marginRight: 5 }} />Pending</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.purple, marginRight: 5 }} />Retry path</span>
          </div>
        </section>

        {/* Node Inspector Section */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Node inspector</h2>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
              Selected node
            </div>
            <div style={{ fontSize: 19, fontWeight: 650, margin: "4px 0" }}>{selectedNode}</div>
            <p style={{ fontSize: 12, color: THEME.muted, margin: "0 0 12px" }}>{nodeData[0]}</p>

            <KVRow label="Status" value={nodeData[1]} color={nodeData[1] === "Done" ? THEME.green : nodeData[1] === "Running" ? THEME.cyan : THEME.muted} />
            <KVRow label="Model" value="Shared LLM" />
            <KVRow label="Tokens" value={nodeData[2]} />
            <KVRow label="Elapsed" value={nodeData[3]} />
            <KVRow label="Tools" value={nodeData[4]} />

            <div style={{ color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontSize: 10, margin: "16px 0 7px" }}>
              Runtime context
            </div>
            <div style={{ fontSize: 10, border: "1px solid #33465a", borderRadius: 4, padding: "3px 8px", color: "#aebed0", display: "inline-block" }}>
              Same model · Shared budget
            </div>
          </div>
        </section>
      </div>

      {/* Execution Trace Table */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, marginTop: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Execution trace</h2>
          <span style={{ fontSize: 11, color: THEME.muted }}>Run #042</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.line}`, textAlign: "left", color: THEME.muted, fontSize: 11 }}>
                <th style={{ padding: "10px 14px" }}>Time</th>
                <th style={{ padding: "10px 14px" }}>Node</th>
                <th style={{ padding: "10px 14px" }}>Event</th>
                <th style={{ padding: "10px 14px" }}>Tokens</th>
                <th style={{ padding: "10px 14px" }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #212c39" }}>
                <td style={{ padding: "10px 14px" }}>10:24:31</td>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>User task</td>
                <td style={{ padding: "10px 14px", color: THEME.green }}>● Done</td>
                <td style={{ padding: "10px 14px" }}>145</td>
                <td style={{ padding: "10px 14px" }}>0.18 s</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #212c39" }}>
                <td style={{ padding: "10px 14px" }}>10:24:32</td>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>Planner</td>
                <td style={{ padding: "10px 14px", color: THEME.green }}>● Done</td>
                <td style={{ padding: "10px 14px" }}>1,326</td>
                <td style={{ padding: "10px 14px" }}>0.91 s</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #212c39" }}>
                <td style={{ padding: "10px 14px" }}>10:24:33</td>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>Researcher</td>
                <td style={{ padding: "10px 14px", color: THEME.cyan }}>● Running</td>
                <td style={{ padding: "10px 14px" }}>4,218</td>
                <td style={{ padding: "10px 14px" }}>2.14 s</td>
              </tr>
              <tr>
                <td style={{ padding: "10px 14px" }}>—</td>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>Analyzer</td>
                <td style={{ padding: "10px 14px", color: THEME.muted }}>● Queued</td>
                <td style={{ padding: "10px 14px" }}>—</td>
                <td style={{ padding: "10px 14px" }}>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SvgNode({ x, y, w, h, icon, title, sub, status, selected, onClick }: any) {
  const isSelected = selected;
  const isComplete = status === "complete";
  const isRunning = status === "running";
  const strokeColor = isSelected ? THEME.cyan : isRunning ? THEME.cyan : isComplete ? "#3d826e" : "#486078";
  const fillColor = isSelected ? "#172d39" : "#14202d";

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={fillColor} stroke={strokeColor} strokeWidth={isSelected || isRunning ? 2 : 1.2} />
      <text x={x + 14} y={y + 34} fill={THEME.cyan} fontSize={17}>{icon}</text>
      <text x={x + 35} y={y + 25} fill="#e7edf6" fontSize={13} fontWeight={600}>{title}</text>
      <text x={x + 35} y={y + 42} fill="#99aabc" fontSize={10}>{sub}</text>
    </g>
  );
}

/* ========================================================================= */
/* 4. FRAMEWORK HUB TAB (Full implementation of matrix.html)                 */
/* ========================================================================= */
function FrameworkHubTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<{ fw: string; cap: string; val: number } | null>(null);

  const states = [
    { cls: "unknown", icon: "?", label: "Unverified", color: THEME.muted, bg: "#202a37" },
    { cls: "adapter", icon: "~", label: "Adapter", color: THEME.blue, bg: "#23354d" },
    { cls: "native", icon: "✓", label: "Native", color: THEME.green, bg: "#15392f" },
  ];

  const filteredFws = FRAMEWORKS_DATA.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
          FRAMEWORK RESEARCH
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 650 }}>Framework capability matrix</h1>
        <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
          Compare native primitives, adapters and capability gaps.
        </p>
      </div>

      {/* 3 Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <MetricSpark title="Frameworks" value="10" color={THEME.cyan} />
        <MetricSpark title="Capabilities" value="10" color={THEME.purple} />
        <MetricSpark title="Demo cells" value="100" color={THEME.green} />
      </div>

      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Capability coverage</h2>
          <span style={{ fontSize: 11, color: THEME.muted }}>Illustrative classifications</span>
        </div>

        <div style={{ padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", borderBottom: `1px solid ${THEME.line}` }}>
          <input
            type="text"
            placeholder="Search frameworks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              backgroundColor: "#0d141d",
              border: `1px solid ${THEME.line}`,
              borderRadius: 6,
              color: THEME.text,
              padding: "7px 11px",
              width: 220,
              fontSize: 12,
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              backgroundColor: "#141e2b",
              border: `1px solid ${THEME.line}`,
              borderRadius: 6,
              color: THEME.text,
              padding: "7px 12px",
              fontSize: 12,
            }}
          >
            <option value="all">All capabilities</option>
            <option value="2">Native</option>
            <option value="1">Adapter</option>
            <option value="0">Unverified</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.line}`, textAlign: "center", color: THEME.muted, fontSize: 11 }}>
                <th style={{ textAlign: "left", padding: "10px 16px" }}>Framework</th>
                {CAPABILITIES.map((cap) => (
                  <th key={cap} style={{ padding: "10px 8px" }}>{cap}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFws.map((fw) => (
                <tr key={fw.name} style={{ borderBottom: "1px solid #212c39" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 600 }}>{fw.name}</td>
                  {fw.caps.map((val, j) => {
                    const st = states[val] ?? states[0]!;
                    const capName = CAPABILITIES[j] ?? "";
                    const isHidden = filter !== "all" && Number(filter) !== val;
                    return (
                      <td key={j} style={{ textAlign: "center", padding: "6px 4px" }}>
                        <button
                          onClick={() => setDetail({ fw: fw.name, cap: capName, val })}
                          style={{
                            display: isHidden ? "none" : "inline-grid",
                            placeItems: "center",
                            width: 44,
                            height: 26,
                            borderRadius: 5,
                            fontSize: 13,
                            fontWeight: 650,
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
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", gap: 15, alignItems: "center", color: THEME.muted, fontSize: 11, padding: "11px 16px", borderTop: `1px solid ${THEME.line}` }}>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.green, marginRight: 5 }} />Native (demo)</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.blue, marginRight: 5 }} />Adapter (demo)</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.muted, marginRight: 5 }} />Unverified</span>
        </div>
      </section>

      {/* Capability Inspector */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, marginTop: 14, padding: 18 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 650 }}>Capability inspector</h2>
        {detail ? (
          <div>
            <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3, fontWeight: 650 }}>
              Demo classification
            </div>
            <b style={{ fontSize: 15 }}>{detail.fw} / {detail.cap}</b>
            <p style={{ fontSize: 12, color: THEME.muted, margin: "4px 0 0" }}>
              {(states[detail.val] ?? states[0]!).label} · Illustrative only. Confirm with official documentation and reproducible tests before using as evidence.
            </p>
          </div>
        ) : (
          <div>
            <b>Select any cell</b>
            <p style={{ fontSize: 12, color: THEME.muted, margin: "4px 0 0" }}>
              Click any cell in the table above to view the capability and its classification details.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ========================================================================= */
/* 5. DEVELOPMENT STUDIO TAB                                                 */
/* ========================================================================= */
function DevelopmentStudioTab() {
  const [selectedFw, setSelectedFw] = useState("LangGraph");

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
          HARNESS CODE INSPECTION
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 650 }}>Development Studio</h1>
        <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
          Uzman harness kod üretimi, test-and-repair döngüsü ve dondurulmuş native worker kod denetimi.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
        <div style={{ backgroundColor: THEME.panel, borderRadius: 10, border: `1px solid ${THEME.line}`, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: THEME.muted, textTransform: "uppercase", padding: "4px 8px 10px" }}>
            Frameworkler
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
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: THEME.panel, borderRadius: 10, border: `1px solid ${THEME.line}`, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 650, margin: 0 }}>
              {selectedFw} · runtimes/{selectedFw.toLowerCase().replace(" ", "-")}/skeleton/main.py
            </h3>
            <span style={{ fontSize: 11, color: THEME.green, background: "rgba(82, 216, 164, 0.12)", padding: "2px 8px", borderRadius: 4, border: `1px solid ${THEME.green}` }}>
              Donduruldu (Frozen Candidate)
            </span>
          </div>
          <pre
            style={{
              margin: 0,
              padding: 16,
              backgroundColor: "#0d141d",
              borderRadius: 6,
              fontSize: 12,
              color: THEME.text,
              overflowX: "auto",
              border: `1px solid ${THEME.line}`,
              fontFamily: "ui-monospace, monospace",
              lineHeight: 1.5,
            }}
          >
{`"""Native pipeline worker for ${selectedFw}."""
import json
import sys

def main():
    # Read contract input from stdin
    line = sys.stdin.readline()
    if not line:
        return
    data = json.loads(line)
    
    # Emit pipeline lifecycle events via stdio JSONL
    print(json.dumps({"event": "pipeline.start", "framework": "${selectedFw}"}), flush=True)
    
    # Execute native agent workflow with tool broker
    # ...
    
    print(json.dumps({"event": "pipeline.finish", "status": "completed", "conflicts_found": 2}), flush=True)

if __name__ == "__main__":
    main()`}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 6. EXECUTION ARENA TAB (Full implementation of live.html)                 */
/* ========================================================================= */
interface LiveRun {
  name: string;
  pct: number;
  time: string;
  tokens: number;
}

const INITIAL_RUNS: LiveRun[] = [
  { name: "LangGraph", pct: 100, time: "12.4", tokens: 8200 },
  { name: "Google ADK", pct: 82, time: "—", tokens: 7400 },
  { name: "OpenAI Agents", pct: 100, time: "14.1", tokens: 9400 },
  { name: "CrewAI", pct: 56, time: "—", tokens: 5800 },
  { name: "Pydantic AI", pct: 75, time: "—", tokens: 4200 },
  { name: "Agno", pct: 100, time: "11.8", tokens: 7900 },
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
  const [events, setEvents] = useState([
    { name: "LangGraph", detail: "Validation completed", time: "10:24:34" },
    { name: "Google ADK", detail: "Tool invocation started", time: "10:24:33" },
    { name: "CrewAI", detail: "Research agent active", time: "10:24:32" },
    { name: "Agno", detail: "Run completed", time: "10:24:30" },
  ]);

  // Simulated live event ticker
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
            EXECUTION ARENA
          </div>
          <h1 style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 650 }}>Live experiment · #042</h1>
          <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
            Same task. Same model. Ten independent framework runs.
          </p>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            backgroundColor: "#153849",
            borderColor: "#377b91",
            color: "#b6f2ff",
            border: "1px solid",
            padding: "8px 14px",
            borderRadius: 7,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {isPaused ? "Resume demo" : "Pause demo"}
        </button>
      </div>

      {/* 4 Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <MetricSpark title="Frameworks" value="10" color={THEME.cyan} />
        <MetricSpark title="Completed" value={`${completedCount} / 10`} color={THEME.green} />
        <MetricSpark title="Total tokens" value={totalTokens} color={THEME.purple} />
        <MetricSpark title="Elapsed" value={`${elapsed} s`} color={THEME.amber} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.8fr) minmax(230px, 0.9fr)", gap: 14 }}>
        {/* Left Column: Frameworks List */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Frameworks (10)</h2>
          </div>
          <div style={{ padding: "5px 10px" }}>
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
                    gap: 6,
                    textAlign: "left",
                    margin: "5px 0",
                    padding: "10px 9px",
                    background: isSel ? "#142733" : "transparent",
                    border: `1px solid ${isSel ? "#41788c" : "transparent"}`,
                    borderRadius: 6,
                    cursor: "pointer",
                    color: THEME.text,
                  }}
                >
                  <b style={{ fontSize: 12 }}>{r.name}</b>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? THEME.green : THEME.cyan }}>
                    {isDone ? "Done" : "Running"}
                  </span>
                  <small style={{ color: THEME.muted, fontSize: 10 }}>{r.tokens.toLocaleString()} tokens</small>
                  <small style={{ color: THEME.muted, fontSize: 10, textAlign: "right" }}>{r.pct}%</small>
                  <div style={{ gridColumn: "1/-1", height: 5, background: "#243141", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${r.pct}%`, height: "100%", background: isDone ? THEME.green : THEME.cyan, transition: "width .3s" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Center Column: Selected Framework Canvas */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>{selectedRun.name}</h2>
            <span style={{ fontSize: 11, fontWeight: 600, color: selectedRun.pct === 100 ? THEME.green : THEME.cyan }}>
              {selectedRun.pct === 100 ? "Done" : "Running"}
            </span>
          </div>

          <div style={{ backgroundColor: "#0d141d", backgroundImage: "radial-gradient(#304154 0.65px, transparent .65px)", backgroundSize: "18px 18px", padding: 10 }}>
            <svg viewBox="0 0 620 310" style={{ display: "block", width: "100%", height: "auto" }}>
              <defs>
                <marker id="arrowLive" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="#7598ad" />
                </marker>
              </defs>
              <path d="M155 145 H235" fill="none" stroke={THEME.cyan} strokeWidth="2" strokeDasharray={isPaused ? "none" : "7 6"} markerEnd="url(#arrowLive)" />
              <path d="M385 145 H465" fill="none" stroke={THEME.cyan} strokeWidth="2" strokeDasharray={isPaused ? "none" : "7 6"} markerEnd="url(#arrowLive)" />
              <path d="M535 115 V55 H310 V115" fill="none" stroke={THEME.purple} strokeDasharray="5 5" strokeWidth="1.6" markerEnd="url(#arrowLive)" />

              <SvgNode x={20} y={115} w={135} h={60} icon="◇" title="Planner" sub="Agent" status="complete" />
              <SvgNode x={235} y={115} w={150} h={60} icon="⌕" title="Research" sub="Agent" status={selectedRun.pct === 100 ? "complete" : "running"} />
              <SvgNode x={465} y={115} w={135} h={60} icon="✓" title="Evaluator" sub="Review" status={selectedRun.pct === 100 ? "complete" : "queued"} />
              <text x={310} y={45} textAnchor="middle" fill="#9eb0c3" fontSize={11}>Conditional retry</text>
            </svg>
          </div>

          <div style={{ padding: 16 }}>
            <KVRow label="Selected run" value={`${selectedRun.pct}%`} />
            <div style={{ height: 5, background: "#243141", borderRadius: 5, overflow: "hidden", margin: "6px 0 12px" }}>
              <div style={{ width: `${selectedRun.pct}%`, height: "100%", background: THEME.cyan, transition: "width .3s" }} />
            </div>
            <KVRow label="Model" value="Shared LLM" />
            <KVRow label="Tokens" value={selectedRun.tokens.toLocaleString()} />
            <p style={{ fontSize: 11, color: THEME.muted, margin: "10px 0 0" }}>
              Graph is an illustrative workflow, not a recorded framework trace.
            </p>
          </div>
        </section>

        {/* Right Column: Live Event Log */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Live events</h2>
            <span style={{ fontSize: 10, color: THEME.cyan }}>Demo stream</span>
          </div>
          <div style={{ padding: 14 }}>
            {events.map((evt, idx) => (
              <div key={idx} style={{ padding: "9px 0", borderBottom: idx < events.length - 1 ? `1px solid #263140` : "none", display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: THEME.cyan, marginTop: 4 }} />
                <div>
                  <b>{evt.name}</b>
                  <div style={{ color: THEME.muted, fontSize: 11 }}>{evt.detail}</div>
                </div>
                <span style={{ color: THEME.muted, fontSize: 10, marginLeft: "auto" }}>{evt.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 7. TELEMETRY CENTER TAB (Full implementation of communication.html)       */
/* ========================================================================= */
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
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
          COMMUNICATION TELEMETRY
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 650 }}>Agent communication network</h1>
        <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
          Demo · Trace message flow and inter-agent handoffs
        </p>
      </div>

      {/* 3 Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <MetricSpark title="Messages" value="24" color={THEME.cyan} />
        <MetricSpark title="Handoffs" value="8" color={THEME.purple} />
        <MetricSpark title="Comm. tokens" value="5.9K" color={THEME.green} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.4fr) minmax(260px, 1fr)", gap: 14 }}>
        {/* Canvas Graph */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Communication graph</h2>
            <span style={{ fontSize: 11, color: THEME.cyan }}>Demo</span>
          </div>

          <div style={{ backgroundColor: "#0d141d", backgroundImage: "radial-gradient(#304154 0.65px, transparent .65px)", backgroundSize: "18px 18px", padding: 10 }}>
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

              <SvgNode x={380} y={35} w={160} h={60} icon="◇" title="Planner" sub="Agent" selected={selectedAgent === "Planner"} onClick={() => setSelectedAgent("Planner")} />
              <SvgNode x={90} y={165} w={160} h={60} icon="⌕" title="Researcher" sub="Agent" selected={selectedAgent === "Researcher"} onClick={() => setSelectedAgent("Researcher")} />
              <SvgNode x={660} y={165} w={160} h={60} icon="≋" title="Analyzer" sub="Agent" selected={selectedAgent === "Analyzer"} onClick={() => setSelectedAgent("Analyzer")} />
              <SvgNode x={380} y={310} w={160} h={60} icon="✓" title="Validator" sub="Agent" selected={selectedAgent === "Validator"} onClick={() => setSelectedAgent("Validator")} />
            </svg>
          </div>

          <div style={{ display: "flex", gap: 15, alignItems: "center", color: THEME.muted, fontSize: 11, padding: "11px 16px", borderTop: `1px solid ${THEME.line}` }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.cyan, marginRight: 5 }} />Message flow · width = volume</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: THEME.purple, marginRight: 5 }} />Handoffs are included in messages</span>
          </div>
        </section>

        {/* Agent Insights Panel */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Agent insights</h2>
            <button
              onClick={() => setSelectedAgent(null)}
              style={{ padding: "4px 8px", fontSize: 11, background: "#141e2b", border: `1px solid ${THEME.line}`, borderRadius: 4, cursor: "pointer", color: THEME.text }}
            >
              Overview
            </button>
          </div>
          <div style={{ padding: 16 }}>
            {selectedAgent && agentStats ? (
              <div>
                <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
                  Selected agent
                </div>
                <div style={{ fontSize: 19, fontWeight: 650, margin: "4px 0 12px" }}>{selectedAgent}</div>
                <KVRow label="Sent messages" value={agentStats.sent} />
                <KVRow label="Received messages" value={agentStats.recv} />
                <KVRow label="Outgoing tokens" value={agentStats.outTok.toLocaleString()} />
                <KVRow label="Incoming tokens" value={agentStats.inTok.toLocaleString()} />
                <KVRow label="Outgoing handoffs" value={agentStats.handoffs} />
              </div>
            ) : (
              <div>
                <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
                  Network overview
                </div>
                <div style={{ fontSize: 19, fontWeight: 650, margin: "4px 0" }}>4 agents</div>
                <p style={{ fontSize: 12, color: THEME.muted, margin: "0 0 12px" }}>
                  Select any agent in the graph to inspect communication totals.
                </p>
                <KVRow label="Messages" value="24" />
                <KVRow label="Handoffs" value="8" />
                <KVRow label="Tokens" value="5,900" />
                <KVRow label="Avg. message" value="246 tokens" />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Communication Events Table */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, marginTop: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Communication events</h2>
          <span style={{ fontSize: 11, color: THEME.muted }}>Aggregated demo events</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.line}`, textAlign: "left", color: THEME.muted, fontSize: 11 }}>
                <th style={{ padding: "10px 14px" }}>Sender</th>
                <th style={{ padding: "10px 14px" }}>Receiver</th>
                <th style={{ padding: "10px 14px" }}>Messages</th>
                <th style={{ padding: "10px 14px" }}>Tokens</th>
                <th style={{ padding: "10px 14px" }}>Handoffs</th>
              </tr>
            </thead>
            <tbody>
              {COMM_LINKS.map((link, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #212c39" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{link[0]}</td>
                  <td style={{ padding: "10px 14px" }}>{link[1]}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: THEME.cyan }}>{link[2]}</td>
                  <td style={{ padding: "10px 14px" }}>{link[3]}</td>
                  <td style={{ padding: "10px 14px", color: THEME.purple, fontWeight: 600 }}>{link[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ========================================================================= */
/* 8. EVALUATION CENTER TAB                                                  */
/* ========================================================================= */
function EvaluationCenterTab() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
          ADR-0007 DUAL-GATE EVALUATION
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 650 }}>Evaluation Center</h1>
        <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
          Kabul kriterleri matrisi, hard gate denetimleri ve held-out gizli veri seti doğrulaması (GP §11, §13.9).
        </p>
      </div>

      <div style={{ backgroundColor: THEME.panel, borderRadius: 10, border: `1px solid ${THEME.line}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: "#0d141d", textAlign: "left", borderBottom: `1px solid ${THEME.line}` }}>
              <th style={{ padding: 12, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>KRİTER</th>
              <th style={{ padding: 12, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>POLİTİKA</th>
              <th style={{ padding: 12, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>EVALUATOR</th>
              <th style={{ padding: 12, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>EŞİK</th>
              <th style={{ padding: 12, color: THEME.muted, fontFamily: "ui-monospace, monospace" }}>10 FRAMEWORK SONUCU</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #212c39" }}>
              <td style={{ padding: 12, fontSize: 13, fontWeight: 600 }}>valid_schema</td>
              <td style={{ padding: 12 }}>
                <span style={{ color: THEME.amber, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: "rgba(231, 185, 113, 0.12)" }}>
                  required (Hard Gate)
                </span>
              </td>
              <td style={{ padding: 12, color: THEME.muted }}>json_schema</td>
              <td style={{ padding: 12, fontFamily: "ui-monospace, monospace" }}>1.0</td>
              <td style={{ padding: 12, color: THEME.green, fontWeight: 600 }}>10 / 10 Geçti</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #212c39" }}>
              <td style={{ padding: 12, fontSize: 13, fontWeight: 600 }}>conflict_f1</td>
              <td style={{ padding: 12 }}>
                <span style={{ color: THEME.amber, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: "rgba(231, 185, 113, 0.12)" }}>
                  required (Hard Gate)
                </span>
              </td>
              <td style={{ padding: 12, color: THEME.muted }}>labeled_f1</td>
              <td style={{ padding: 12, fontFamily: "ui-monospace, monospace" }}>≥ 0.90</td>
              <td style={{ padding: 12, color: THEME.green, fontWeight: 600 }}>10 / 10 Geçti (F1: 0.92–0.96)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 9. COMPARISON LAB TAB (Full recommendation.html with 2D Pareto Plot)      */
/* ========================================================================= */
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

  // Filter eligible frameworks based on min quality
  const eligiblePool = FRAMEWORKS_DATA.filter((fw) => fw.v[0] >= minQuality);

  // Ranked frameworks
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

  // Compute 2D Pareto Frontier for Speed vs Quality
  // Non-dominated on these two axes: no other candidate has BOTH speed and quality >= and at least one strictly >
  const paretoPoints = eligiblePool
    .filter(
      (a) =>
        !eligiblePool.some(
          (b) => b.v[0] >= a.v[0] && b.v[1] >= a.v[1] && (b.v[0] > a.v[0] || b.v[1] > a.v[1])
        )
    )
    .sort((a, b) => a.v[1] - b.v[1]);

  // Coordinate scales for Scatter plot (X: Speed 60-100 -> 48-372, Y: Quality 70-100 -> 220-34)
  const scaleX = (speed: number) => 48 + (speed - 60) * 8.1;
  const scaleY = (quality: number) => 220 - (quality - 70) * 6.2;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
          DECISION LAB
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 650 }}>Recommendation Arena</h1>
        <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
          Explore framework trade-offs using adjustable priorities and 2D Pareto frontier.
        </p>
      </div>

      {/* 3 Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <MetricSpark title="Candidates" value="10" color={THEME.cyan} />
        <MetricSpark title="Eligible" value={eligiblePool.length.toString()} color={THEME.green} />
        <MetricSpark title="Top score" value={top ? top.score.toFixed(1) : "—"} color={THEME.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(230px, 1fr) minmax(0, 1.3fr) minmax(0, 1.35fr)", gap: 14 }}>
        {/* Left: Optimization Weights */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Optimization weights</h2>
          </div>
          <div style={{ padding: 16 }}>
            {["Quality", "Speed", "Token efficiency", "Reliability"].map((label, idx) => {
              const currentWeight = weights[idx] ?? 0;
              return (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span>{label}</span>
                    <b>{totalW ? ((currentWeight / totalW) * 100).toFixed(0) : 0}%</b>
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

            <div style={{ marginBottom: 16, borderTop: `1px solid ${THEME.line}`, paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span>Minimum quality</span>
                <b>{minQuality}</b>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={minQuality}
                onChange={(e) => setMinQuality(Number(e.target.value))}
                style={{ width: "100%", accentColor: THEME.cyan }}
              />
            </div>

            <button
              onClick={resetWeights}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "#141e2b",
                border: `1px solid ${THEME.line}`,
                borderRadius: 6,
                color: THEME.text,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Reset weights
            </button>
          </div>
        </section>

        {/* Center: Quality vs Speed Pareto Scatter Plot */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Quality vs. speed</h2>
          </div>
          <div style={{ padding: 16 }}>
            <svg viewBox="0 0 400 265" style={{ width: "100%", display: "block" }}>
              {/* Axes lines & labels */}
              {[60, 70, 80, 90, 100].map((v) => (
                <g key={`x-${v}`}>
                  <line x1={scaleX(v)} y1="34" x2={scaleX(v)} y2="220" stroke="#263241" />
                  <text x={scaleX(v)} y="237" textAnchor="middle" fill="#91a0b4" fontSize="10">{v}</text>
                </g>
              ))}
              {[70, 80, 90, 100].map((v) => (
                <g key={`y-${v}`}>
                  <line x1="48" y1={scaleY(v)} x2="372" y2={scaleY(v)} stroke="#263241" />
                  <text x="38" y={scaleY(v) + 3} textAnchor="end" fill="#91a0b4" fontSize="10">{v}</text>
                </g>
              ))}

              <text x="210" y="259" textAnchor="middle" fill="#91a0b4" fontSize="11">Speed score →</text>
              <text x="10" y="20" fill="#91a0b4" fontSize="11">Quality ↑</text>

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
                      <title>{`${item.name} · Quality ${item.v[0]} · Speed ${item.v[1]}`}</title>
                    </circle>
                    {isWinner && (
                      <text x={cx} y={cy - 10} textAnchor="middle" fill={THEME.cyan} fontSize="11" fontWeight={600}>
                        {item.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            <p style={{ fontSize: 11, color: THEME.muted, margin: "10px 0 0" }}>
              Dashed line: non-dominated candidates on these two axes only.
            </p>
          </div>
        </section>

        {/* Right: Recommendation Podium */}
        <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Recommendation</h2>
          </div>
          <div style={{ padding: 16 }}>
            {top ? (
              <div>
                <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
                  Top weighted match
                </div>
                <div style={{ fontSize: 20, fontWeight: 650, margin: "4px 0" }}>{top.name}</div>
                <div style={{ fontSize: 34, fontWeight: 650, letterSpacing: "-0.05em", color: THEME.cyan }}>
                  {top.score.toFixed(1)}
                  <span style={{ fontSize: 15, color: THEME.muted }}> / 100</span>
                </div>
                <p style={{ fontSize: 11, color: THEME.muted, margin: "4px 0 12px" }}>
                  Highest weighted demo score among eligible candidates.
                </p>

                <KVRow label="Quality" value={`${top.v[0]} / 100`} />
                <KVRow label="Speed" value={`${top.v[1]} / 100`} />
                <KVRow label="Token efficiency" value={`${top.v[2]} / 100`} />
                <KVRow label="Reliability" value={`${top.v[3]} / 100`} />
              </div>
            ) : (
              <p style={{ fontSize: 12, color: THEME.muted }}>No framework meets the minimum quality threshold.</p>
            )}
          </div>
        </section>
      </div>

      {/* Weighted Ranking Table */}
      <section style={{ backgroundColor: THEME.panel, border: `1px solid ${THEME.line}`, borderRadius: 10, marginTop: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: `1px solid ${THEME.line}` }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Weighted ranking</h2>
          <span style={{ fontSize: 11, color: THEME.muted }}>Demo scores · not measured</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.line}`, textAlign: "left", color: THEME.muted, fontSize: 11 }}>
                <th style={{ padding: "10px 14px", width: 30 }}>#</th>
                <th style={{ padding: "10px 14px" }}>Framework</th>
                <th style={{ padding: "10px 14px" }}>Score / 100</th>
                <th style={{ padding: "10px 14px" }}>Quality</th>
                <th style={{ padding: "10px 14px" }}>Speed</th>
                <th style={{ padding: "10px 14px" }}>Token efficiency</th>
                <th style={{ padding: "10px 14px" }}>Reliability</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((fw, idx) => {
                const isHighlight = idx === 0;
                return (
                  <tr key={fw.name} style={{ borderBottom: "1px solid #212c39", backgroundColor: isHighlight ? "#142a33" : "transparent" }}>
                    <td style={{ padding: "10px 14px", color: isHighlight ? THEME.cyan : THEME.muted, fontWeight: 650 }}>{idx + 1}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{fw.name}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 650, color: isHighlight ? THEME.cyan : THEME.text }}>{fw.score.toFixed(1)}</td>
                    {fw.v.map((val, vi) => (
                      <td key={vi} style={{ padding: "10px 14px" }}>
                        {val}
                        <div style={{ height: 4, background: "#243141", borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
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

/* ========================================================================= */
/* 10. PROJECT & EXPORTER TAB                                                */
/* ========================================================================= */
function LibraryExporterTab() {
  const [downloaded, setDownloaded] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: THEME.cyan, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontWeight: 650 }}>
          ADR-0009 & ADR-0010 SECRET-FREE EXPORT
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 4px", fontWeight: 650 }}>Project Library & Standalone Exporter</h1>
        <p style={{ color: THEME.muted, margin: 0, fontSize: 13 }}>
          Kazanan pipeline'ın platformdan bağımsız, secret-free export paketi (ADR-009, GP §13.11).
        </p>
      </div>

      <div style={{ backgroundColor: THEME.panel, borderRadius: 10, border: `1px solid ${THEME.line}`, padding: 24, maxWidth: 640 }}>
        <h3 style={{ fontSize: 16, fontWeight: 650, color: THEME.cyan, margin: "0 0 10px" }}>
          arena-export-agno.zip (Winner Candidate)
        </h3>
        <p style={{ fontSize: 12, color: THEME.muted, lineHeight: 1.6, margin: "0 0 16px" }}>
          Bu paket hiçbir Agentic Arena kütüphanesine veya platform gizli anahtarına bağımlı değildir. Bağımsız Docker veya pip ortamında doğrudan çalışır.
        </p>

        <div
          style={{
            backgroundColor: "#0d141d",
            borderRadius: 6,
            padding: 14,
            fontSize: 12,
            fontFamily: "ui-monospace, monospace",
            color: THEME.text,
            marginBottom: 20,
            border: `1px solid ${THEME.line}`,
            lineHeight: 1.8,
          }}
        >
          <div>📄 README.md (Bağımsız çalıştırma talimatı)</div>
          <div>🐳 Dockerfile (Minimal bağımsız container)</div>
          <div>📦 pyproject.toml (Yalnızca adayın kendi kütüphane bağımlılığı)</div>
          <div>🐍 main.py (Dondurulmuş native pipeline kodu)</div>
        </div>

        <button
          onClick={() => setDownloaded(true)}
          style={{
            backgroundColor: "#153849",
            color: "#b6f2ff",
            border: "1px solid #377b91",
            padding: "9px 20px",
            borderRadius: 7,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {downloaded ? "✓ Paket İndirildi (Zip Hazır)" : "Bağımsız Projeyi İndir (Secret-Free Export)"}
        </button>
      </div>
    </div>
  );
}

/* Helper Components */
function KVRow({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: "1px solid #202b38", fontSize: 12 }}>
      <span style={{ color: THEME.muted }}>{label}</span>
      <strong style={{ fontWeight: 550, color: color || THEME.text }}>{value}</strong>
    </div>
  );
}

function MetricSpark({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div
      style={{
        backgroundColor: THEME.panel,
        border: `1px solid ${THEME.line}`,
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <small style={{ display: "block", color: THEME.muted, fontSize: 12, marginBottom: 4 }}>{title}</small>
        <strong style={{ fontSize: 26, letterSpacing: "-0.04em", fontWeight: 650, color: THEME.text }}>{value}</strong>
      </div>
      <svg style={{ width: 72, height: 30, flexShrink: 0 }} viewBox="0 0 72 30" aria-hidden="true">
        <path
          d="M1 25 L10 19 L19 22 L29 11 L39 15 L49 8 L59 12 L71 3"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
