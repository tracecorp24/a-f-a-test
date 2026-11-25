export const SAMPLE_RUN_MODEL = "gemini-1.5-pro";

export const FRAMEWORK_PIPELINES: Record<string, { nodes: string[]; desc: string }> = {
  "LangGraph": {
    desc: "Graph tabanlı durum makinesi. Her düğüm bir ajan veya araç çağrısıdır; kenarlar koşullara göre yönlendirir.",
    nodes: ["Girdi Düğümü", "Planlayıcı", "Araştırmacı", "Analizci", "Doğrulayıcı", "Çıktı"],
  },
  "Google ADK": {
    desc: "Merkezi orkestratör etrafında çok ajanlı hub mimarisi. Alt ajanlar görev parçalarını paralel yürütür.",
    nodes: ["Kullanıcı İsteği", "Orkestratör", "Alt Ajan A", "Alt Ajan B", "Birleştirici", "Yanıt"],
  },
  "OpenAI Agents": {
    desc: "Handoff (devretme) tabanlı SDK. Bir ajan görevi başka ajana devreder, aralarında bağlam aktarılır.",
    nodes: ["Triaj Ajanı", "Handoff →", "Uzman Ajan", "Araç Çağrısı", "Doğrulama", "Son Çıktı"],
  },
  "CrewAI": {
    desc: "Rol tabanlı ekip yapısı. Her ajan bir meslek rolü üstlenir; Crew Manager görevleri dağıtır.",
    nodes: ["Yönetici", "Araştırmacı Rol", "Yazar Rol", "Kalite Kontrol", "Editör", "Rapor"],
  },
  "Pydantic AI": {
    desc: "Tip güvenli ajan çerçevesi. Girdi/çıktı Pydantic şemalarıyla doğrulanır, retry otomatiktir.",
    nodes: ["Şema Doğrula", "Ajan Çağrısı", "Araç Yürüt", "Çıktı Doğrula", "Retry?", "Teslim"],
  },
  "Agno": {
    desc: "Yüksek hızlı async ajan motoru. Minimal bellek ayak izi ile paralel akışlar yürütür.",
    nodes: ["Async Girdi", "Hızlı Plan", "Paralel İşler", "Topla", "Hızlı Doğrula", "Çıktı"],
  },
  "LlamaAgents": {
    desc: "Servis veri yolu mimarisi. Ajanlar mesaj kuyruğu üzerinden haberleşen mikro-servislerdir.",
    nodes: ["Kuyruk Girdi", "Yönlendirici", "Servis A", "Servis B", "Toplayıcı", "Çıktı"],
  },
  "Smolagents": {
    desc: "Minimal kod-eylem çerçevesi. Ajan Python kodu üretir ve doğrudan yürütür.",
    nodes: ["Görev Al", "Kod Yaz", "Kod Çalıştır", "Sonucu Oku", "Hata?", "Teslim Et"],
  },
  "Mastra": {
    desc: "İş akışı ve senkronizasyon odaklı TypeScript framework. Adım bazlı pipeline tanımı.",
    nodes: ["Workflow Başlat", "Adım 1", "Adım 2", "Koşul Dalı", "Birleştir", "Bitir"],
  },
  "Microsoft AF": {
    desc: "Kurumsal ölçekli ajan mimarisi. Azure entegrasyonu, güvenlik katmanları ve RBAC dahili.",
    nodes: ["Auth Katmanı", "Orkestratör", "Uzman Ajan", "Güvenlik Denetim", "Onaylayıcı", "Çıktı"],
  },
};

export interface LiveRun {
  name: string;
  pct: number;
  time: string;
  tokens: number;
}

export const INITIAL_RUNS: LiveRun[] = [
  { name: "LangGraph", pct: 100, time: "12.4 sn", tokens: 8200 },
  { name: "Google ADK", pct: 82, time: "—", tokens: 7400 },
  { name: "OpenAI Agents", pct: 100, time: "14.1 sn", tokens: 9400 },
  { name: "CrewAI", pct: 56, time: "—", tokens: 5800 },
  { name: "Pydantic AI", pct: 75, time: "—", tokens: 4200 },
  { name: "Agno", pct: 100, time: "11.8 sn", tokens: 7900 },
  { name: "LlamaAgents", pct: 41, time: "—", tokens: 3900 },
  { name: "Smolagents", pct: 29, time: "—", tokens: 2700 },
  { name: "Mastra", pct: 12, time: "—", tokens: 1600 },
  { name: "Microsoft AF", pct: 68, time: "—", tokens: 6100 },
];

// Telemetri: her framework için ajan iletişim verileri
export const TELEMETRY: Record<string, {
  agents: { name: string; icon: string }[];
  links: [string, string, number, number, number][];   // from, to, msgs, tokens, handoffs
  events: { label: string; detail: string; time: string }[];
}> = {
  "LangGraph": {
    agents: [
      { name: "Planlayıcı", icon: "◇" },
      { name: "Araştırmacı", icon: "⌕" },
      { name: "Analizci", icon: "≋" },
      { name: "Doğrulayıcı", icon: "✓" },
    ],
    links: [
      ["Planlayıcı", "Araştırmacı", 5, 1200, 2],
      ["Araştırmacı", "Analizci", 7, 2400, 2],
      ["Analizci", "Doğrulayıcı", 4, 980, 1],
      ["Planlayıcı", "Doğrulayıcı", 2, 100, 1],
    ],
    events: [
      { label: "Doğrulama Tamamlandı", detail: "F1: 0.96 — Hard Gate geçti", time: "10:24:34" },
      { label: "Graph Döngüsü", detail: "Retry → Araştırmacı'ya dönüş", time: "10:24:31" },
      { label: "Paralel Dal", detail: "Araştırmacı + Analizci eşzamanlı", time: "10:24:28" },
    ],
  },
  "Google ADK": {
    agents: [
      { name: "Orkestratör", icon: "◇" },
      { name: "Alt Ajan A", icon: "⌕" },
      { name: "Alt Ajan B", icon: "≋" },
      { name: "Birleştirici", icon: "✓" },
    ],
    links: [
      ["Orkestratör", "Alt Ajan A", 3, 800, 1],
      ["Orkestratör", "Alt Ajan B", 3, 800, 1],
      ["Alt Ajan A", "Birleştirici", 2, 500, 1],
      ["Alt Ajan B", "Birleştirici", 2, 500, 1],
    ],
    events: [
      { label: "Paralel Başlatma", detail: "Alt Ajan A ve B eş zamanlı", time: "10:24:33" },
      { label: "Hub Yönlendirme", detail: "Orkestratör görev dağıttı", time: "10:24:30" },
    ],
  },
  "CrewAI": {
    agents: [
      { name: "Yönetici", icon: "◇" },
      { name: "Araştırmacı Rol", icon: "⌕" },
      { name: "Yazar Rol", icon: "≋" },
      { name: "Editör", icon: "✓" },
    ],
    links: [
      ["Yönetici", "Araştırmacı Rol", 4, 900, 1],
      ["Araştırmacı Rol", "Yazar Rol", 5, 1400, 2],
      ["Yazar Rol", "Editör", 3, 700, 1],
    ],
    events: [
      { label: "Rol Atama", detail: "Araştırmacı ve Yazar rolleri atandı", time: "10:24:32" },
      { label: "Crew Toplantı", detail: "Yönetici özet aldı", time: "10:24:29" },
    ],
  },
};

// Diğer frameworkler için varsayılan telemetri
export const DEFAULT_TELEMETRY = {
  agents: [
    { name: "Planlayıcı", icon: "◇" },
    { name: "İşleyici", icon: "⌕" },
    { name: "Doğrulayıcı", icon: "✓" },
  ],
  links: [
    ["Planlayıcı", "İşleyici", 4, 900, 1],
    ["İşleyici", "Doğrulayıcı", 3, 600, 1],
  ] as [string, string, number, number, number][],
  events: [
    { label: "Çalıştırma Başladı", detail: "Framework başlatıldı", time: "10:24:30" },
    { label: "Araç Çağrısı", detail: "Harici araç kullanıldı", time: "10:24:31" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
