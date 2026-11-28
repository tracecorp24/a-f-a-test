// Bu dosya alt ajanlar tarafından doldurulur.
export const DICT_EXECUTION_ARENA: Record<string, string> = {
  // PageHeader
  "AŞAMA 3 · ÇALIŞTIRMA ARENASI VE TELEMETRİ": "STAGE 3 · EXECUTION ARENA & TELEMETRY",
  "Çalıştırma Arenası": "Execution Arena",
  "Framework çalışmalarını ve ajan iletişim telemetrisini canlı izleyin.": "Watch framework runs and agent communication telemetry live.",
  "Her framework'ün yerel işçisi API üzerinden çalıştırılır. İlerleme, usage ledger'dan alınan kesin token kullanımı ve ajan telemetrisi gerçek çalıştırma olaylarından üretilir.": "Each framework runs in its own local worker via the API. Progress, exact token usage from the usage ledger, and agent telemetry are generated from real run events.",

  // Actions & status bar
  "İşlem tamamlanamadı.": "The operation could not be completed.",
  "Oluşturuldu": "Created",
  "Hazır": "Ready",
  "Çalışıyor": "Running",
  "Duraklatıldı": "Paused",
  "İptal edildi": "Cancelled",
  "Toplam:": "Total:",
  "sn": "s",
  "❚❚ Duraklat": "❚❚ Pause",
  "▶ Sürdür": "▶ Resume",
  "■ İptal Et": "■ Cancel",
  "▶ Çalıştır": "▶ Run",
  "↻ Yeniden Çalıştır": "↻ Re-run",

  // Alerts
  "Deney hatası: ": "Experiment error: ",
  "Benchmark fixture bütünlük doğrulaması başarısız.": "Benchmark fixture integrity verification failed.",

  // Task & success criteria
  "Görev ve Başarı Kriterleri": "Task & Success Criteria",
  "Veri seti: ": "Dataset: ",
  " (etiketli çelişki: ": " (labeled conflicts: ",
  ") · ": ") · ",
  "Kabul eşiği: F1 ≥ ": "Acceptance threshold: F1 ≥ ",
  " · Tekrar: ": " · Repetitions: ",

  // Framework list
  "Framework'ler": "Frameworks",
  "sırada": "queued",

  // Selected framework detail
  "· Yerel Akış": "· Local Flow",
  "İptal": "Cancelled",
  "İşleniyor": "Running",
  "Sırada": "Queued",
  "çalışma akışı": "run flow",
  "Ajan / Düğüm": "Agent / Node",
  "Bu framework adlandırılmış ajan/düğüm olayı üretmedi.": "This framework did not produce named agent/node events.",
  "Bu çalışma için henüz akış olayı yok.": "No flow events yet for this run.",
  "İlerleme": "Progress",
  "Token (ledger)": "Tokens (ledger)",
  "Süre (ort.)": "Duration (avg)",
  "Hata: ": "Error: ",

  // Telemetry
  "⌁ Telemetri": "⌁ Telemetry",
  "Ajan İletişim Analizi": "Agent Communication Analysis",
  "Mesaj": "Messages",
  "Mesaj Akışı": "Message Flow",
  "Çizgi kalınlığı = mesaj hacmi": "Line thickness = message volume",
  "ajan iletişimi. Ayrıntılar aşağıdaki tabloda.": "agent communication. Details in the table below.",
  "mesaj": "messages",
  "No": "#",
  "Kaynak": "Source",
  "Hedef": "Target",
  "Bu framework ajanlar arası mesaj üretmedi (tek ajan/düğüm).": "This framework produced no inter-agent messages (single agent/node).",
  "Telemetri çalışma tamamlandığında oluşur.": "Telemetry is generated once the run completes.",

  // Live events
  "Canlı Olaylar": "Live Events",
  "● CANLI": "● LIVE",
  "KAYIT": "RECORD",
  "Henüz olay yok.": "No events yet.",

  // Network summary
  "Ağ Özeti": "Network Summary",
  "Toplam Mesaj": "Total Messages",
  "Toplam Handoff": "Total Handoffs",
  "İletişim Tokenı": "Communication Tokens",
  "Prompt / Yanıt (ledger)": "Prompt / Response (ledger)",
  "Aktif Ajan Sayısı": "Active Agents",
  "Ortalama Mesaj Boyutu": "Avg. Message Size",
  "Ajanlar": "Agents",
  "Gönderilen Mesaj": "Messages Sent",
  "Alınan Mesaj": "Messages Received",
  "Giden Token": "Outgoing Tokens",
  "Gelen Token": "Incoming Tokens",
  "Aktarılan Handoff": "Relayed Handoffs",
};
