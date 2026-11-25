export const THEME = {
  bg: "#0b1018",
  panel: "#121926",
  panelAlt: "#0d131d",
  line: "#1e293b",
  lineSubtle: "#161f2e",
  muted: "#94a3b8",
  subtle: "#64748b",
  text: "#f1f5f9",
  cyan: "#38bdf8",
  blue: "#60a5fa",
  green: "#34d399",
  purple: "#a78bfa",
  amber: "#fbbf24",
  red: "#fb7185",
};

export interface FrameworkRecord {
  name: string;
  caps: number[]; // 2 = native, 1 = adapter, 0 = unverified
  v: [number, number, number, number]; // [Kalite, Hız, Token Verimliliği, Güvenilirlik]
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
  "Paralel",
  "Handoff",
  "Hafıza",
  "Araçlar",
  "Streaming",
  "Retry",
  "İnsan Onayı",
  "Telemetri",
  "Tip Güvenliği",
];
