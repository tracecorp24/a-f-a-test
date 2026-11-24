import React, { useState, useMemo } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

// 10 Official Frameworks from Framework Catalog (GP §2, §6.2)
interface Framework {
  id: string;
  name: string;
  runtime: string;
  paradigm: string;
  status: "ready_cold" | "running" | "passed" | "queued";
  quality: number;
  speed: number;
  token: number;
  reliability: number;
  capabilities: {
    graph: "Native" | "Adapter" | "Unknown";
    multiAgent: "Native" | "Adapter" | "Unknown";
    tools: "Native" | "Adapter" | "Unknown";
    state: "Native" | "Adapter" | "Unknown";
    memory: "Native" | "Adapter" | "Unknown";
    handoff: "Native" | "Adapter" | "Unknown";
    streaming: "Native" | "Adapter" | "Unknown";
    retry: "Native" | "Adapter" | "Unknown";
  };
}

const INITIAL_FRAMEWORKS: Framework[] = [
  {
    id: "langgraph",
    name: "LangGraph",
    runtime: "Python",
    paradigm: "State / graph",
    status: "passed",
    quality: 94,
    speed: 76,
    token: 78,
    reliability: 96,
    capabilities: {
      graph: "Native",
      multiAgent: "Native",
      tools: "Native",
      state: "Native",
      memory: "Native",
      handoff: "Adapter",
      streaming: "Native",
      retry: "Native",
    },
  },
  {
    id: "google-adk",
    name: "Google ADK",
    runtime: "Python",
    paradigm: "Hierarchical / workflow",
    status: "running",
    quality: 90,
    speed: 85,
    token: 86,
    reliability: 93,
    capabilities: {
      graph: "Adapter",
      multiAgent: "Native",
      tools: "Native",
      state: "Native",
      memory: "Native",
      handoff: "Native",
      streaming: "Native",
      retry: "Adapter",
    },
  },
  {
    id: "microsoft-af",
    name: "Microsoft Agent Framework",
    runtime: "Python",
    paradigm: "Agent / executor / workflow",
    status: "queued",
    quality: 91,
    speed: 80,
    token: 76,
    reliability: 95,
    capabilities: {
      graph: "Native",
      multiAgent: "Native",
      tools: "Native",
      state: "Native",
      memory: "Adapter",
      handoff: "Native",
      streaming: "Native",
      retry: "Adapter",
    },
  },
  {
    id: "openai-agents",
    name: "OpenAI Agents SDK",
    runtime: "Python",
    paradigm: "Agent loop / handoff",
    status: "passed",
    quality: 87,
    speed: 91,
    token: 85,
    reliability: 89,
    capabilities: {
      graph: "Adapter",
      multiAgent: "Native",
      tools: "Native",
      state: "Adapter",
      memory: "Adapter",
      handoff: "Native",
      streaming: "Native",
      retry: "Adapter",
    },
  },
  {
    id: "crewai",
    name: "CrewAI",
    runtime: "Python",
    paradigm: "Crew / role / task / flow",
    status: "running",
    quality: 92,
    speed: 62,
    token: 61,
    reliability: 86,
    capabilities: {
      graph: "Adapter",
      multiAgent: "Native",
      tools: "Native",
      state: "Native",
      memory: "Native",
      handoff: "Adapter",
      streaming: "Native",
      retry: "Adapter",
    },
  },
  {
    id: "agno",
    name: "Agno",
    runtime: "Python",
    paradigm: "Agent / Team / Workflow",
    status: "passed",
    quality: 85,
    speed: 97,
    token: 95,
    reliability: 84,
    capabilities: {
      graph: "Native",
      multiAgent: "Native",
      tools: "Native",
      state: "Native",
      memory: "Native",
      handoff: "Adapter",
      streaming: "Native",
      retry: "Adapter",
    },
  },
  {
    id: "pydantic-ai",
    name: "Pydantic AI",
    runtime: "Python",
    paradigm: "Typed agent / dependency",
    status: "running",
    quality: 89,
    speed: 87,
    token: 92,
    reliability: 94,
    capabilities: {
      graph: "Native",
      multiAgent: "Adapter",
      tools: "Native",
      state: "Native",
      memory: "Adapter",
      handoff: "Adapter",
      streaming: "Native",
      retry: "Adapter",
    },
  },
  {
    id: "llama-agents",
    name: "LlamaAgents",
    runtime: "Python",
    paradigm: "Event-driven async workflow",
    status: "queued",
    quality: 86,
    speed: 83,
    token: 82,
    reliability: 88,
    capabilities: {
      graph: "Native",
      multiAgent: "Native",
      tools: "Native",
      state: "Native",
      memory: "Adapter",
      handoff: "Adapter",
      streaming: "Native",
      retry: "Adapter",
    },
  },
  {
    id: "smolagents",
    name: "Smolagents",
    runtime: "Python",
    paradigm: "Code / tool-calling agent",
    status: "passed",
    quality: 78,
    speed: 92,
    token: 87,
    reliability: 82,
    capabilities: {
      graph: "Adapter",
      multiAgent: "Adapter",
      tools: "Native",
      state: "Adapter",
      memory: "Adapter",
      handoff: "Unknown",
      streaming: "Native",
      retry: "Adapter",
    },
  },
  {
    id: "mastra",
    name: "Mastra",
    runtime: "TypeScript",
    paradigm: "Agent / workflow",
    status: "running",
    quality: 88,
    speed: 89,
    token: 87,
    reliability: 87,
    capabilities: {
      graph: "Native",
      multiAgent: "Native",
      tools: "Native",
      state: "Native",
      memory: "Native",
      handoff: "Adapter",
      streaming: "Native",
      retry: "Native",
    },
  },
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
        backgroundColor: "#090d12",
        color: "#e6edf3",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Sleek Minimalist Sidebar */}
      <aside
        style={{
          width: 250,
          borderRight: "1px solid #30363d",
          backgroundColor: "#0d1117",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #30363d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "linear-gradient(135deg, #1f6feb, #58a6ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#fff",
                fontSize: 14,
              }}
            >
              A
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: "#f0f6fc" }}>
                AGENTIC ARENA
              </div>
              <div style={{ fontSize: 11, color: "#8b949e", fontFamily: "ui-monospace, monospace" }}>
                v1.0.0 · Dual-Plane
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#8b949e",
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
                  color: isActive ? "#58a6ff" : "#8b949e",
                  backgroundColor: isActive ? "rgba(88, 166, 255, 0.12)" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  marginBottom: 3,
                  border: isActive ? "1px solid rgba(88, 166, 255, 0.3)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 13, color: isActive ? "#58a6ff" : "#8b949e" }}>{sec.icon}</span>
                <span>{sec.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #30363d", fontSize: 11, color: "#8b949e" }}>
          <div>One task. One model.</div>
          <div style={{ color: "#58a6ff", fontWeight: 600, marginTop: 2 }}>Ten Native Frameworks.</div>
        </div>
      </aside>

      {/* Main View Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Control Bar */}
        <header
          style={{
            height: 54,
            borderBottom: "1px solid #30363d",
            backgroundColor: "#0d1117",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#8b949e" }}>Project:</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3" }}>doc-review (#042)</span>
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: "#30363d" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#8b949e" }}>Model Lock:</span>
              <span
                style={{
                  fontSize: 11,
                  background: "rgba(88, 166, 255, 0.15)",
                  color: "#58a6ff",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 600,
                  fontFamily: "ui-monospace, monospace",
                  border: "1px solid rgba(88, 166, 255, 0.3)",
                }}
              >
                gemini-1.5-pro (Locked)
              </span>
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: "#30363d" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#8b949e" }}>Canonical Ledger:</span>
              <span style={{ fontSize: 12, color: "#3fb950", fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>
                48.2K tokens ($0.096)
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8b949e" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#3fb950" }} />
              10 / 10 Frameworks Ready
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

/* 1. OVERVIEW / DASHBOARD (§13.2) */
function OverviewTab() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          AGENTIC ARENA · PLATFORM OVERVIEW
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>
          Live Experiment Control Center
        </h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          On agent framework'ünü aynı görev ve tek dondurulmuş model üzerinde adil ve tarafsız biçimde yarıştırın.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard title="Frameworks" value="10" detail="candidates" mono />
        <StatCard title="Running" value="5" detail="2 queued" color="#58a6ff" mono />
        <StatCard title="Completed" value="3" detail="3 passed" color="#3fb950" mono />
        <StatCard title="Total Tokens" value="48.2K" detail="canonical usage" mono />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 650, margin: "0 0 14px", color: "#f0f6fc" }}>
            10 Framework Yarışma Kataloğu
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {INITIAL_FRAMEWORKS.map((f) => (
              <div
                key={f.id}
                style={{
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  padding: 12,
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#8b949e", marginTop: 2 }}>{f.paradigm}</div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: 10,
                    backgroundColor: f.status === "passed" ? "rgba(63, 185, 80, 0.15)" : f.status === "running" ? "rgba(88, 166, 255, 0.15)" : "#21262d",
                    color: f.status === "passed" ? "#3fb950" : f.status === "running" ? "#58a6ff" : "#8b949e",
                    border: `1px solid ${f.status === "passed" ? "rgba(63, 185, 80, 0.4)" : f.status === "running" ? "rgba(88, 166, 255, 0.4)" : "#30363d"}`,
                    textTransform: "capitalize",
                  }}
                >
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 650, margin: "0 0 14px", color: "#f0f6fc" }}>
            Tarafsızlık Güvenceleri (ADR)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 12, backgroundColor: "#0d1117", borderRadius: 6, border: "1px solid #30363d" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#58a6ff" }}>ADR-0003: Model Lock</div>
              <div style={{ fontSize: 11, color: "#8b949e", marginTop: 3 }}>
                Tüm adaylar tek bir dondurulmuş modele bağlanır. Framework seviyesinde model override yasaktır (HTTP 403).
              </div>
            </div>
            <div style={{ padding: 12, backgroundColor: "#0d1117", borderRadius: 6, border: "1px solid #30363d" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#3fb950" }}>ADR-0007: İki Aşamalı Eleme</div>
              <div style={{ fontSize: 11, color: "#8b949e", marginTop: 3 }}>
                Önce hard kriterler (şema, F1) test edilir. Geçemeyen elenir; yumuşak kullanıcı ağırlıkları elenmişi kurtaramaz.
              </div>
            </div>
            <div style={{ padding: 12, backgroundColor: "#0d1117", borderRadius: 6, border: "1px solid #30363d" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#bc8cff" }}>ADR-0012: Kanonik Ledger</div>
              <div style={{ fontSize: 11, color: "#8b949e", marginTop: 3 }}>
                Reasoning ve cache tokenları provider_reported olarak ayrı kaydedilir; çift sayım yapılamaz.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. TASK STUDIO (§13.3) */
function TaskStudioTab() {
  const [objective, setObjective] = useState("Sözleşmeleri analiz et, teslim tarihi ve bütçe çelişkilerini bul ve kanıtlı rapor üret.");
  const [isApproved, setIsApproved] = useState(false);
  const specHash = "4d933042f4d12823a3717b23dde4dfde8e76238870ff528aa1357777b6d2ffee";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          TASK SPECIFICATION & HARNESS LOCK
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>Task Studio</h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          Gereksinim netleştirme, serbest alanlar ve Kanonik RFC 8785 TaskSpec onay ekranı (GP §5, §13.3).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", display: "block", marginBottom: 8 }}>
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
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              color: "#f0f6fc",
              fontSize: 13,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 13, color: "#58a6ff", margin: "0 0 8px" }}>Hard Kriterler (Zorunlu Geçiş Kapıları)</h4>
            <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.8 }}>
              • <code style={{ color: "#3fb950" }}>valid_schema</code>: JSON Schema uyumluluğu == 1.0 (Zorunlu)<br />
              • <code style={{ color: "#3fb950" }}>conflict_f1</code>: Etiketli çelişki F1 skoru ≥ 0.90 (Zorunlu)
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontSize: 13, color: "#bc8cff", margin: "0 0 8px" }}>İzin Verilen Serbest Alanlar</h4>
            <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>
              Ajan sayısı, topoloji, prompt ve bellek stratejisi her framework'ün kendi native mimarisine serbest bırakılmıştır.
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            {!isApproved ? (
              <button
                onClick={() => setIsApproved(true)}
                style={{
                  backgroundColor: "#1f6feb",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 6,
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
                  padding: "12px 16px",
                  borderRadius: 6,
                  backgroundColor: "rgba(63, 185, 80, 0.12)",
                  border: "1px solid #3fb950",
                  color: "#3fb950",
                  fontSize: 13,
                }}
              >
                ✓ Spec Onaylandı! Kanonik RFC 8785 Hash: <code>{specHash.slice(0, 16)}...</code>
              </div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <h4 style={{ fontSize: 13, color: "#8b949e", margin: "0 0 12px" }}>Kanonik TaskSpec YAML Önizlemesi</h4>
          <pre
            style={{
              margin: 0,
              padding: 16,
              backgroundColor: "#0d1117",
              borderRadius: 6,
              fontSize: 11,
              color: "#e6edf3",
              overflowX: "auto",
              border: "1px solid #30363d",
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

/* 3. PIPELINE DESIGNER (§13.4) */
function PipelineDesignerTab() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          WORKFLOW GRAPH & CONTRACTS
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>Pipeline Designer</h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          Görsel akış tuvali, zorunlu ve serbest iş adımları ile araç sözleşmeleri (GP §13.4).
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#161b22",
          borderRadius: 10,
          border: "1px solid #30363d",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ fontSize: 13, color: "#8b949e" }}>
          Doc Review Görev Hattı: Adaylar bu veri akışını kendi native orkestrasyonuyla çözer.
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, padding: "30px 0" }}>
          <FlowBlock label="Input Fixtures" type="input" note="Doc A, Doc B, Doc C" />
          <span style={{ color: "#58a6ff", fontSize: 22 }}>➔</span>
          <FlowBlock label="Tool Broker" type="action" note="read_document" />
          <span style={{ color: "#58a6ff", fontSize: 22 }}>➔</span>
          <FlowBlock label="Conflict Analyzer" type="action" note="find_evidence" />
          <span style={{ color: "#58a6ff", fontSize: 22 }}>➔</span>
          <FlowBlock label="JSON Validator" type="validation" note="valid_schema == 1.0" />
          <span style={{ color: "#58a6ff", fontSize: 22 }}>➔</span>
          <FlowBlock label="Output Report" type="output" note="report.json" />
        </div>
      </div>
    </div>
  );
}

function FlowBlock({ label, type, note }: { label: string; type: string; note: string }) {
  const isVal = type === "validation";
  return (
    <div
      style={{
        width: 160,
        padding: 16,
        borderRadius: 8,
        backgroundColor: "#0d1117",
        border: `1px solid ${isVal ? "#e3b341" : "#30363d"}`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          color: isVal ? "#e3b341" : "#58a6ff",
          fontWeight: 700,
          fontFamily: "ui-monospace, monospace",
        }}
      >
        {type}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f6fc", margin: "6px 0 2px" }}>{label}</div>
      <div style={{ fontSize: 10, color: "#8b949e" }}>{note}</div>
    </div>
  );
}

/* 4. FRAMEWORK HUB (§13.5 & Visual 03-capability-matrix) */
function FrameworkHubTab() {
  const [activeView, setActiveView] = useState<"matrix" | "status">("matrix");

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
            03 / DESIGN PREVIEW & CAPABILITY MATRIX
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>
            Framework Capability Matrix
          </h1>
          <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
            Compare native primitives and integration requirements across ten frameworks.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setActiveView("matrix")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #30363d",
              background: activeView === "matrix" ? "rgba(88, 166, 255, 0.15)" : "#161b22",
              color: activeView === "matrix" ? "#58a6ff" : "#8b949e",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Capability Matrix
          </button>
          <button
            onClick={() => setActiveView("status")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #30363d",
              background: activeView === "status" ? "rgba(88, 166, 255, 0.15)" : "#161b22",
              color: activeView === "status" ? "#58a6ff" : "#8b949e",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            OCI Runtimes
          </button>
        </div>
      </div>

      {activeView === "matrix" ? (
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#e6edf3" }}>Capability coverage</div>
            <div style={{ fontSize: 11, color: "#8b949e" }}>
              Native built-ins vs adapter requirements across all 10 frameworks
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #30363d", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px", fontSize: 11, color: "#8b949e", fontFamily: "ui-monospace, monospace" }}>
                    FRAMEWORK
                  </th>
                  <th style={{ padding: 10, fontSize: 12, color: "#8b949e", textAlign: "center" }}>Graph</th>
                  <th style={{ padding: 10, fontSize: 12, color: "#8b949e", textAlign: "center" }}>Multi-agent</th>
                  <th style={{ padding: 10, fontSize: 12, color: "#8b949e", textAlign: "center" }}>Tools</th>
                  <th style={{ padding: 10, fontSize: 12, color: "#8b949e", textAlign: "center" }}>State</th>
                  <th style={{ padding: 10, fontSize: 12, color: "#8b949e", textAlign: "center" }}>Memory</th>
                  <th style={{ padding: 10, fontSize: 12, color: "#8b949e", textAlign: "center" }}>Handoff</th>
                  <th style={{ padding: 10, fontSize: 12, color: "#8b949e", textAlign: "center" }}>Streaming</th>
                  <th style={{ padding: 10, fontSize: 12, color: "#8b949e", textAlign: "center" }}>Retry</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_FRAMEWORKS.map((fw, idx) => (
                  <tr
                    key={fw.id}
                    style={{
                      borderBottom: "1px solid #21262d",
                      backgroundColor: idx % 2 === 0 ? "rgba(13, 17, 23, 0.4)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{fw.name}</td>
                    <td style={{ textAlign: "center" }}><CapBadge type={fw.capabilities.graph} /></td>
                    <td style={{ textAlign: "center" }}><CapBadge type={fw.capabilities.multiAgent} /></td>
                    <td style={{ textAlign: "center" }}><CapBadge type={fw.capabilities.tools} /></td>
                    <td style={{ textAlign: "center" }}><CapBadge type={fw.capabilities.state} /></td>
                    <td style={{ textAlign: "center" }}><CapBadge type={fw.capabilities.memory} /></td>
                    <td style={{ textAlign: "center" }}><CapBadge type={fw.capabilities.handoff} /></td>
                    <td style={{ textAlign: "center" }}><CapBadge type={fw.capabilities.streaming} /></td>
                    <td style={{ textAlign: "center" }}><CapBadge type={fw.capabilities.retry} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #30363d",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              color: "#8b949e",
            }}
          >
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3fb950" }} />
                <span>Native: Built-in primitive</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#58a6ff" }} />
                <span>Adapter: Integration needed</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#8b949e" }} />
                <span>Unknown: Not verified</span>
              </div>
            </div>
            <div style={{ fontFamily: "ui-monospace, monospace" }}>DEMO DATA / NOT BENCHMARK RESULTS</div>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: "#e6edf3", margin: "0 0 16px" }}>
            OCI İzolasyon ve Worker Uyumluluk
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {INITIAL_FRAMEWORKS.map((f) => (
              <div key={f.id} style={{ backgroundColor: "#0d1117", border: "1px solid #30363d", padding: 14, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: "#3fb950", fontFamily: "ui-monospace, monospace" }}>status: ready_cold</span>
                </div>
                <div style={{ fontSize: 11, color: "#8b949e", marginTop: 4 }}>
                  Runtime: {f.runtime} | Protocol: stdio JSONL events | Manifest: verified
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CapBadge({ type }: { type: "Native" | "Adapter" | "Unknown" }) {
  const isNative = type === "Native";
  const isAdapter = type === "Adapter";
  const color = isNative ? "#3fb950" : isAdapter ? "#58a6ff" : "#8b949e";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 12,
        backgroundColor: "#0d1117",
        border: `1px solid ${color}`,
        color,
        fontSize: 11,
        fontWeight: 550,
      }}
    >
      {type}
    </span>
  );
}

/* 5. DEVELOPMENT STUDIO (§13.6) */
function DevelopmentStudioTab() {
  const [selectedFw, setSelectedFw] = useState("langgraph");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          HARNESS CODE INSPECTION & TEST-AND-REPAIR
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>Development Studio</h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          Uzman harness kod üretimi, test-and-repair döngüsü ve dondurulmuş native worker kod denetimi (GP §13.6).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", padding: "4px 8px 10px" }}>
            Frameworkler
          </div>
          {INITIAL_FRAMEWORKS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFw(f.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                borderRadius: 6,
                border: selectedFw === f.id ? "1px solid rgba(88, 166, 255, 0.4)" : "1px solid transparent",
                background: selectedFw === f.id ? "rgba(88, 166, 255, 0.12)" : "transparent",
                color: selectedFw === f.id ? "#58a6ff" : "#8b949e",
                fontWeight: selectedFw === f.id ? 600 : 400,
                fontSize: 12,
                cursor: "pointer",
                marginBottom: 2,
              }}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#f0f6fc" }}>
              {selectedFw.toUpperCase()} · runtimes/{selectedFw}/skeleton/main.py
            </h3>
            <span
              style={{
                fontSize: 11,
                color: "#3fb950",
                background: "rgba(63, 185, 80, 0.12)",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid rgba(63, 185, 80, 0.3)",
              }}
            >
              Donduruldu (Frozen Candidate)
            </span>
          </div>
          <pre
            style={{
              margin: 0,
              padding: 16,
              backgroundColor: "#0d1117",
              borderRadius: 6,
              fontSize: 12,
              color: "#e6edf3",
              overflowX: "auto",
              border: "1px solid #30363d",
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

/* 6. EXECUTION ARENA (§13.7 & Visual 01-live-pipeline) */
function ExecutionArenaTab() {
  const [selectedFw, setSelectedFw] = useState("LangGraph");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          01 / DESIGN PREVIEW & LIVE EXECUTION
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>
          Live experiment · #042
        </h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          Native pipelines running under a shared model and evaluation protocol.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard title="Frameworks" value="10" detail="candidates" mono />
        <StatCard title="Running" value="5" detail="2 queued" color="#58a6ff" mono />
        <StatCard title="Completed" value="3" detail="3 passed" color="#3fb950" mono />
        <StatCard title="Total tokens" value="48.2K" detail="demo usage" mono />
      </div>

      {/* Visual Split Screen */}
      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 20 }}>
        {/* Left Column: Live Status List */}
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#e6edf3" }}>Frameworks</div>
            <div style={{ fontSize: 11, color: "#8b949e" }}>Live execution status</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {INITIAL_FRAMEWORKS.map((fw) => {
              const isSelected = selectedFw.toLowerCase() === fw.name.toLowerCase();
              return (
                <div
                  key={fw.id}
                  onClick={() => setSelectedFw(fw.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 6,
                    backgroundColor: isSelected ? "rgba(88, 166, 255, 0.12)" : "transparent",
                    border: isSelected ? "1px solid rgba(88, 166, 255, 0.4)" : "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        backgroundColor: fw.status === "passed" ? "#3fb950" : fw.status === "running" ? "#58a6ff" : "#8b949e",
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 550, color: "#e6edf3" }}>{fw.name}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: fw.status === "passed" ? "#3fb950" : fw.status === "running" ? "#58a6ff" : "#8b949e",
                    }}
                  >
                    {fw.status === "passed" ? "Passed" : fw.status === "running" ? "Running" : "Queued"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Graph & Waterfall */}
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 20, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#e6edf3" }}>Native workflow · {selectedFw}</div>
            <div style={{ fontSize: 11, color: "#8b949e" }}>Observed execution graph · example</div>
          </div>

          {/* SVG Graph Canvas */}
          <div
            style={{
              backgroundColor: "#0d1117",
              borderRadius: 8,
              border: "1px solid #30363d",
              padding: 24,
              flex: 1,
              minHeight: 250,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Workflow Nodes */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, position: "relative" }}>
              <GraphNode label="Task" subtitle="Input" status="passed" />
              <GraphArrow color="#58a6ff" />
              <GraphNode label="Planner" subtitle="1.2K tokens" status="passed" />
              <GraphArrow color="#58a6ff" />
              <GraphNode label="Research" subtitle="Running" status="running" />
              <GraphArrow color="#58a6ff" />
              <GraphNode label="Tool call" subtitle="Web search" status="running" />
              <GraphArrow color="#58a6ff" />
              <GraphNode label="Validator" subtitle="Pending" status="queued" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32 }}>
              <GraphNode label="Evaluate" subtitle="Quality gate" status="passed" />
              <GraphArrow color="#3fb950" />
              <GraphNode label="Output" subtitle="Result" status="passed" />
              <span
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 12,
                  border: "1px solid #bc8cff",
                  color: "#bc8cff",
                  backgroundColor: "#0d1117",
                }}
              >
                Retry / refine
              </span>
            </div>

            {/* Status Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 24, fontSize: 10, color: "#8b949e" }}>
              <span style={{ color: "#3fb950" }}>● Completed</span>
              <span style={{ color: "#58a6ff" }}>● Active</span>
              <span style={{ color: "#8b949e" }}>● Pending</span>
            </div>
          </div>

          {/* Latest Event Banner */}
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid #30363d",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              fontFamily: "ui-monospace, monospace",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#8b949e", fontSize: 11 }}>Latest event:</span>
              <span style={{ color: "#e6edf3" }}>research_agent · tool call started</span>
            </div>
            <span style={{ color: "#58a6ff", fontWeight: 600 }}>00:42.8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphNode({ label, subtitle, status }: { label: string; subtitle: string; status: "passed" | "running" | "queued" }) {
  const color = status === "passed" ? "#3fb950" : status === "running" ? "#58a6ff" : "#8b949e";
  return (
    <div
      style={{
        width: 105,
        padding: "10px 8px",
        borderRadius: 8,
        backgroundColor: "#0d1117",
        border: `1.2px solid ${color}`,
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3" }}>{label}</span>
      </div>
      <div style={{ fontSize: 10, color: "#8b949e" }}>{subtitle}</div>
    </div>
  );
}

function GraphArrow({ color }: { color: string }) {
  return <span style={{ color, fontSize: 16 }}>➔</span>;
}

/* 7. TELEMETRY CENTER (§13.8 & Visual 02-agent-communication) */
function TelemetryCenterTab() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          02 / DESIGN PREVIEW & TELEMETRY
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>
          Agent communication network
        </h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          Inspect observed messages, handoffs and token flow between agents.
        </p>
      </div>

      {/* 3 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard title="Messages" value="24" detail="observed" mono />
        <StatCard title="Handoffs" value="8" detail="agent transfers" color="#bc8cff" mono />
        <StatCard title="Comm. tokens" value="5.9K" detail="message tokens" color="#58a6ff" mono />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Visual Communication Graph */}
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#e6edf3" }}>Communication graph</div>
            <div style={{ fontSize: 11, color: "#8b949e" }}>Edge width = message count</div>
          </div>

          <div
            style={{
              backgroundColor: "#0d1117",
              borderRadius: 8,
              border: "1px solid #30363d",
              padding: "40px 24px",
              minHeight: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <AgentNode name="Planner" role="Orchestration" color="#58a6ff" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#58a6ff", fontFamily: "ui-monospace, monospace" }}>4 msgs / 1.0K toks ➔</span>
              <AgentNode name="Researcher" role="Evidence" color="#58a6ff" />
              <span style={{ fontSize: 10, color: "#bc8cff", fontFamily: "ui-monospace, monospace" }}>3 msgs / 0.8K toks ➔</span>
              <AgentNode name="Critic" role="Review" color="#bc8cff" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#3fb950", fontFamily: "ui-monospace, monospace" }}>5 msgs / 1.2K toks ➔</span>
              <AgentNode name="Validator" role="Acceptance" color="#3fb950" />
            </div>
          </div>
        </div>

        {/* Communication Insights */}
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#e6edf3" }}>Communication insights</div>
            <div style={{ fontSize: 11, color: "#8b949e" }}>Aggregated demo events</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <AgentBar label="Planner" count={7} max={8} color="#58a6ff" />
            <AgentBar label="Researcher" count={8} max={8} color="#58a6ff" />
            <AgentBar label="Critic" count={4} max={8} color="#58a6ff" />
            <AgentBar label="Validator" count={5} max={8} color="#58a6ff" />

            <div style={{ borderTop: "1px solid #30363d", paddingTop: 14, marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: "#8b949e" }}>Average message size</span>
                <span style={{ color: "#e6edf3", fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>246 tokens</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#8b949e" }}>Handoff events</span>
                <span style={{ color: "#bc8cff", fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentNode({ name, role, color }: { name: string; role: string; color: string }) {
  return (
    <div
      style={{
        width: 130,
        padding: "12px 14px",
        borderRadius: 8,
        backgroundColor: "#0d1117",
        border: `1.2px solid ${color}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{name}</span>
      </div>
      <div style={{ fontSize: 10, color: "#8b949e" }}>{role}</div>
    </div>
  );
}

function AgentBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = (count / max) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: "#8b949e" }}>{label}</span>
        <span style={{ color: "#e6edf3", fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{count}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, backgroundColor: "#30363d", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

/* 8. EVALUATION CENTER (§13.9) */
function EvaluationCenterTab() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          ADR-0007 DUAL-GATE EVALUATION ENGINE
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>Evaluation Center</h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          Kabul kriterleri matrisi, hard gate denetimleri ve held-out gizli veri seti doğrulaması (GP §11, §13.9).
        </p>
      </div>

      <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#0d1117", textAlign: "left", borderBottom: "1px solid #30363d" }}>
              <th style={{ padding: 12, fontSize: 11, color: "#8b949e", fontFamily: "ui-monospace, monospace" }}>KRİTER</th>
              <th style={{ padding: 12, fontSize: 11, color: "#8b949e", fontFamily: "ui-monospace, monospace" }}>POLİTİKA</th>
              <th style={{ padding: 12, fontSize: 11, color: "#8b949e", fontFamily: "ui-monospace, monospace" }}>EVALUATOR</th>
              <th style={{ padding: 12, fontSize: 11, color: "#8b949e", fontFamily: "ui-monospace, monospace" }}>EŞİK</th>
              <th style={{ padding: 12, fontSize: 11, color: "#8b949e", fontFamily: "ui-monospace, monospace" }}>10 FRAMEWORK SONUCU</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #21262d" }}>
              <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>valid_schema</td>
              <td style={{ padding: 12 }}>
                <span style={{ color: "#e3b341", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: "rgba(227, 179, 65, 0.12)" }}>
                  required (Hard Gate)
                </span>
              </td>
              <td style={{ padding: 12, fontSize: 12, color: "#8b949e" }}>json_schema</td>
              <td style={{ padding: 12, fontSize: 12, fontFamily: "ui-monospace, monospace" }}>1.0</td>
              <td style={{ padding: 12, fontSize: 12, color: "#3fb950", fontWeight: 600 }}>10 / 10 Geçti</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #21262d" }}>
              <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>conflict_f1</td>
              <td style={{ padding: 12 }}>
                <span style={{ color: "#e3b341", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: "rgba(227, 179, 65, 0.12)" }}>
                  required (Hard Gate)
                </span>
              </td>
              <td style={{ padding: 12, fontSize: 12, color: "#8b949e" }}>labeled_f1</td>
              <td style={{ padding: 12, fontSize: 12, fontFamily: "ui-monospace, monospace" }}>≥ 0.90</td>
              <td style={{ padding: 12, fontSize: 12, color: "#3fb950", fontWeight: 600 }}>10 / 10 Geçti (F1: 0.92–0.96)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 9. COMPARISON LAB (§13.10 & Visual 04-recommendation-arena) */
function ComparisonLabTab() {
  const [weights, setWeights] = useState({ quality: 40, speed: 25, token: 20, reliability: 15 });
  const [minQuality, setMinQuality] = useState(80);

  // Dynamic ranking based on user weights
  const rankedFrameworks = useMemo(() => {
    const totalW = weights.quality + weights.speed + weights.token + weights.reliability || 1;
    const wQ = weights.quality / totalW;
    const wS = weights.speed / totalW;
    const wT = weights.token / totalW;
    const wR = weights.reliability / totalW;

    return INITIAL_FRAMEWORKS.map((fw) => {
      const calculatedScore = fw.quality * wQ + fw.speed * wS + fw.token * wT + fw.reliability * wR;
      const isEligible = fw.quality >= minQuality;
      return {
        ...fw,
        calculatedScore: parseFloat(calculatedScore.toFixed(2)),
        isEligible,
      };
    }).sort((a, b) => {
      if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
      return b.calculatedScore - a.calculatedScore;
    });
  }, [weights, minQuality]);

  const winner = rankedFrameworks.find((f) => f.isEligible);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          04 / DESIGN PREVIEW & RECOMMENDATION ARENA
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>
          Recommendation Arena
        </h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          Rank eligible frameworks according to your experiment priorities.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "330px 1fr", gap: 20 }}>
        {/* Left Column: Interactive Weights */}
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#e6edf3" }}>Optimization weights</div>
            <div style={{ fontSize: 11, color: "#8b949e" }}>Interactive preferences · normalized to 100%</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <WeightSlider
              label="Quality"
              value={weights.quality}
              color="#58a6ff"
              onChange={(v) => setWeights({ ...weights, quality: v })}
            />
            <WeightSlider
              label="Speed"
              value={weights.speed}
              color="#bc8cff"
              onChange={(v) => setWeights({ ...weights, speed: v })}
            />
            <WeightSlider
              label="Token efficiency"
              value={weights.token}
              color="#58a6ff"
              onChange={(v) => setWeights({ ...weights, token: v })}
            />
            <WeightSlider
              label="Reliability"
              value={weights.reliability}
              color="#3fb950"
              onChange={(v) => setWeights({ ...weights, reliability: v })}
            />

            <div style={{ borderTop: "1px solid #30363d", paddingTop: 16, marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 550, color: "#e6edf3" }}>Minimum quality</span>
                <span style={{ fontSize: 13, fontWeight: 650, color: "#e6edf3", fontFamily: "ui-monospace, monospace" }}>
                  {minQuality} / 100
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={minQuality}
                onChange={(e) => setMinQuality(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#58a6ff" }}
              />
            </div>

            <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.5, marginTop: 8 }}>
              Hard criteria remain mandatory.<br />Weights do not re-run experiments.
            </div>
          </div>
        </div>

        {/* Right Column: Framework Ranking Table */}
        <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 22, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: "#e6edf3" }}>Framework ranking</div>
            <div style={{ fontSize: 11, color: "#8b949e" }}>
              Quality, speed, token efficiency and reliability scores
            </div>
          </div>

          <div style={{ flex: 1, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #30363d", textAlign: "left" }}>
                  <th style={{ padding: "8px 10px", fontSize: 11, color: "#8b949e", width: 28 }}>#</th>
                  <th style={{ padding: "8px 10px", fontSize: 11, color: "#8b949e" }}>Framework</th>
                  <th style={{ padding: "8px 10px", fontSize: 11, color: "#8b949e", textAlign: "right" }}>Score</th>
                  <th style={{ padding: "8px 10px", fontSize: 11, color: "#8b949e", textAlign: "right" }}>Quality</th>
                  <th style={{ padding: "8px 10px", fontSize: 11, color: "#8b949e", textAlign: "right" }}>Speed</th>
                  <th style={{ padding: "8px 10px", fontSize: 11, color: "#8b949e", textAlign: "right" }}>Tokens</th>
                  <th style={{ padding: "8px 10px", fontSize: 11, color: "#8b949e", textAlign: "right" }}>Reliability</th>
                </tr>
              </thead>
              <tbody>
                {rankedFrameworks.map((fw, idx) => {
                  const isTop = idx === 0 && fw.isEligible;
                  return (
                    <tr
                      key={fw.id}
                      style={{
                        borderBottom: "1px solid #21262d",
                        backgroundColor: isTop ? "rgba(63, 185, 80, 0.1)" : "transparent",
                        opacity: fw.isEligible ? 1 : 0.45,
                      }}
                    >
                      <td style={{ padding: "10px 10px", fontSize: 12, fontWeight: 650, color: isTop ? "#3fb950" : "#8b949e" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "10px 10px", fontSize: 12, fontWeight: isTop ? 650 : 500, color: "#e6edf3" }}>
                        {fw.name}
                        {!fw.isEligible && (
                          <span style={{ fontSize: 10, color: "#f85149", marginLeft: 6 }}>[Below threshold]</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 650, color: isTop ? "#3fb950" : "#e6edf3", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
                        {fw.calculatedScore}
                      </td>
                      <td style={{ padding: "10px 10px", fontSize: 12, color: "#8b949e", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
                        {fw.quality}
                      </td>
                      <td style={{ padding: "10px 10px", fontSize: 12, color: "#8b949e", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
                        {fw.speed}
                      </td>
                      <td style={{ padding: "10px 10px", fontSize: 12, color: "#8b949e", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
                        {fw.token}
                      </td>
                      <td style={{ padding: "10px 10px", fontSize: 12, color: "#8b949e", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
                        {fw.reliability}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Winner Banner */}
          {winner && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 18px",
                borderRadius: 8,
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3fb950" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>
                  {winner.name} leads this ranking
                </span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 650, color: "#3fb950", fontFamily: "ui-monospace, monospace" }}>
                {winner.calculatedScore} / 100
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WeightSlider({ label, value, color, onChange }: { label: string; value: number; color: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 550, color: "#e6edf3" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 650, color, fontFamily: "ui-monospace, monospace" }}>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }}
      />
    </div>
  );
}

/* 10. PROJECT LIBRARY & EXPORTER (§13.11) */
function LibraryExporterTab() {
  const [downloaded, setDownloaded] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#58a6ff", fontWeight: 700, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>
          ADR-0009 & ADR-0010 SECRET-FREE EXPORT
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#f0f6fc" }}>
          Project Library & Standalone Exporter
        </h1>
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>
          Kazanan pipeline'ın platformdan bağımsız, secret-free export paketi (ADR-009, GP §13.11).
        </p>
      </div>

      <div style={{ backgroundColor: "#161b22", borderRadius: 10, border: "1px solid #30363d", padding: 24, maxWidth: 640 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#58a6ff", margin: "0 0 10px" }}>
          arena-export-agno.zip (Winner Candidate)
        </h3>
        <p style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6, margin: "0 0 16px" }}>
          Bu paket hiçbir Agentic Arena kütüphanesine veya platform gizli anahtarına bağımlı değildir. Bağımsız Docker veya pip ortamında doğrudan çalışır.
        </p>

        <div
          style={{
            backgroundColor: "#0d1117",
            borderRadius: 6,
            padding: 14,
            fontSize: 12,
            fontFamily: "ui-monospace, monospace",
            color: "#e6edf3",
            marginBottom: 20,
            border: "1px solid #30363d",
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
            backgroundColor: "#1f6feb",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
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

function StatCard({ title, value, detail, color, mono }: { title: string; value: string; detail: string; color?: string; mono?: boolean }) {
  return (
    <div style={{ backgroundColor: "#161b22", padding: "18px 20px", borderRadius: 10, border: "1px solid #30363d" }}>
      <div style={{ fontSize: 12, color: "#8b949e", fontWeight: 500 }}>{title}</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 650,
          color: color || "#e6edf3",
          margin: "4px 0 2px",
          fontFamily: mono ? "ui-monospace, monospace" : "inherit",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#8b949e" }}>{detail}</div>
    </div>
  );
}
