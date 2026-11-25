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
    title: "Sözleşme Çelişki ve Bütçe Analizi",
    description: "PDF/Word sözleşmelerini incele, teslim tarihi ve bütçe tutarsızlıklarını kanıtlı raporla.",
    criteriaCount: 2,
    estimatedTime: "45 sn",
    category: "Hukuk ve Tedarik",
    sampleObjective: "Sözleşmeleri analiz et, teslim tarihi ve bütçe çelişkilerini bul ve kanıtlı rapor üret.",
  },
  {
    id: "sec-audit",
    title: "Kaynak Kod Güvenlik ve Zafiyet Taraması",
    description: "Kod deposunda CVE, SQLi, gizli anahtar sızıntısı ve OWASP Top 10 açıklarını tespit et.",
    criteriaCount: 3,
    estimatedTime: "60 sn",
    category: "Siber Güvenlik",
    sampleObjective: "Kaynak kod deposunu incele, gizli anahtar ve SQL enjeksiyon açıklarını CVE referanslarıyla raporla.",
  },
  {
    id: "fin-synth",
    title: "Çok Kaynaklı Finansal Rapor Sentezi",
    description: "SEC 10-K raporları ile piyasa haberlerini birleştirerek çeyreklik risk ve büyüme matrisi üret.",
    criteriaCount: 2,
    estimatedTime: "75 sn",
    category: "Finans ve Risk",
    sampleObjective: "Finansal tabloları ve son 30 günlük bültenleri karşılaştır, likidite risklerini modelle.",
  },
  {
    id: "api-valid",
    title: "OpenAPI Şema ve Regresyon Test Üretimi",
    description: "OpenAPI spesifikasyonunu oku, sınır koşullarını içeren örnek veriler ve test senaryoları türet.",
    criteriaCount: 2,
    estimatedTime: "35 sn",
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
  { id: "#042", date: "2026-11-24 10:24", task: "Sözleşme Çelişki ve Bütçe Analizi", model: "gemini-1.5-pro", winner: "LangGraph", f1: 0.96, tokens: "57.2K", status: "completed" },
  { id: "#041", date: "2026-11-23 16:45", task: "Kaynak Kod Güvenlik Taraması", model: "gemini-1.5-pro", winner: "Microsoft AF", f1: 0.95, tokens: "68.4K", status: "completed" },
  { id: "#040", date: "2026-11-23 11:12", task: "Çok Kaynaklı Finansal Sentez", model: "gemini-1.5-pro", winner: "Agno", f1: 0.93, tokens: "51.0K", status: "completed" },
  { id: "#039", date: "2026-11-22 18:30", task: "OpenAPI Şema Test Üretimi", model: "gemini-1.5-pro", winner: "Pydantic AI", f1: 0.97, tokens: "42.8K", status: "completed" },
  { id: "#038", date: "2026-11-22 14:05", task: "Müşteri Geri Bildirim Sınıflandırma", model: "gemini-1.5-pro", winner: "Google ADK", f1: 0.94, tokens: "49.6K", status: "completed" },
  { id: "#037", date: "2026-11-21 09:18", task: "Dağıtık Log Hata Kök Neden Analizi", model: "gemini-1.5-pro", winner: "OpenAI Agents", f1: 0.91, tokens: "63.1K", status: "completed" },
];

export interface FrameworkEval {
  name: string;
  schemaPass: boolean;
  conflictF1: number;
  heldOutAccuracy: number;
  overallStatus: "UYGUN" | "ELENDİ";
}

export const EVALUATION_RESULTS: FrameworkEval[] = [
  { name: "LangGraph", schemaPass: true, conflictF1: 0.96, heldOutAccuracy: 95.2, overallStatus: "UYGUN" },
  { name: "Microsoft AF", schemaPass: true, conflictF1: 0.95, heldOutAccuracy: 94.8, overallStatus: "UYGUN" },
  { name: "Google ADK", schemaPass: true, conflictF1: 0.94, heldOutAccuracy: 93.6, overallStatus: "UYGUN" },
  { name: "Pydantic AI", schemaPass: true, conflictF1: 0.94, heldOutAccuracy: 93.1, overallStatus: "UYGUN" },
  { name: "CrewAI", schemaPass: true, conflictF1: 0.93, heldOutAccuracy: 91.5, overallStatus: "UYGUN" },
  { name: "Agno", schemaPass: true, conflictF1: 0.93, heldOutAccuracy: 92.0, overallStatus: "UYGUN" },
  { name: "Mastra", schemaPass: true, conflictF1: 0.92, heldOutAccuracy: 90.8, overallStatus: "UYGUN" },
  { name: "OpenAI Agents", schemaPass: true, conflictF1: 0.92, heldOutAccuracy: 91.2, overallStatus: "UYGUN" },
  { name: "LlamaAgents", schemaPass: true, conflictF1: 0.91, heldOutAccuracy: 90.1, overallStatus: "UYGUN" },
  { name: "Smolagents", schemaPass: true, conflictF1: 0.88, heldOutAccuracy: 86.4, overallStatus: "ELENDİ" },
];
