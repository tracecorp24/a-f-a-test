import { getPalette } from "../theme";

// Tema-duyarlı renk paleti: getter'lar aktif temadan okur, böylece
// bileşenlerdeki inline stiller de açık/koyu temaya uyum sağlar.
export const THEME = {
  get bg() { return getPalette().bg; },
  get panel() { return getPalette().panel; },
  get panelAlt() { return getPalette().panelAlt; },
  get line() { return getPalette().line; },
  get lineSubtle() { return getPalette().lineSubtle; },
  get muted() { return getPalette().muted; },
  get subtle() { return getPalette().subtle; },
  get text() { return getPalette().text; },
  get cyan() { return getPalette().cyan; },
  get blue() { return getPalette().blue; },
  get green() { return getPalette().green; },
  get purple() { return getPalette().purple; },
  get amber() { return getPalette().amber; },
  get red() { return getPalette().red; },
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
