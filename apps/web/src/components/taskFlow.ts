export const BLOCK_TYPES = {
  input: "Girdi / Tetikleyici",
  output: "Çıktı",
  prompt: "Prompt şablonu",
  llm: "LLM isteği",
  agent: "Ajan",
  handoff: "Ajan devri",
  tool: "Araç çağrısı",
  api: "API / HTTP isteği",
  retrieve: "Bilgi getirme / RAG",
  memory: "Bellek",
  transform: "Veri dönüştürme",
  condition: "Koşul / Yönlendirme",
  parallel: "Paralel başlat",
  merge: "Birleştir",
  loop: "Döngü / Yeniden dene",
  approval: "İnsan onayı",
  validate: "Çıktı doğrulama",
  evaluate: "Değerlendirme",
  wait: "Bekleme",
  error: "Hata yakalama",
  custom: "Özel işlem",
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;

export type FlowBlock = {
  id: string;
  type: BlockType;
  label: string;
  settings: string;
  x: number;
  y: number;
};

export type FlowEdge = { from: string; to: string; kind: "normal" | "yes" | "no" | "feedback" | "error" };
export type TaskFlow = { blocks: FlowBlock[]; edges: FlowEdge[] };

export const EDGE_LABELS = { normal: "Normal", yes: "Evet", no: "Hayır", feedback: "Geri besleme", error: "Hata" } as const;
export const BLOCK_LIMIT = 16;
export const EDGE_LIMIT = 80;

export function makeBlock(type: BlockType, index: number, label: string = BLOCK_TYPES[type]): FlowBlock {
  return {
    id: crypto.randomUUID(),
    type,
    label,
    settings: "",
    x: 32 + (index % 3) * 245,
    y: 32 + Math.floor(index / 3) * 156,
  };
}

export function makeTaskFlow(labels: string[]): TaskFlow {
  const blocks = labels.map((name, index) => {
    const [prefix, ...parts] = name.split(":");
    const typed = prefix !== undefined && Object.prototype.hasOwnProperty.call(BLOCK_TYPES, prefix) && parts.length > 0;
    const type = typed ? prefix as BlockType : index === 0 ? "input" : index === labels.length - 1 ? "output" : "custom";
    return makeBlock(type, index, typed ? parts.join(":").trim() || BLOCK_TYPES[type] : name);
  });
  return {
    blocks,
    edges: blocks.slice(1).map((block, index) => ({ from: blocks[index]!.id, to: block.id, kind: "normal" })),
  };
}

export function flowContext(flow: TaskFlow) {
  return { blocks: flow.blocks.map(({ x: _x, y: _y, ...block }) => block), edges: flow.edges };
}
