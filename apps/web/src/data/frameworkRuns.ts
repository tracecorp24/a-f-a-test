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
