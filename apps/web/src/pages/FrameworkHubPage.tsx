import { useEffect, useRef, useState } from "react";
import { CAPABILITIES, FRAMEWORKS_DATA, THEME } from "../data/mockData";
import { FRAMEWORK_EXTRA, FRAMEWORK_REPOS } from "../data/frameworkInfo";
import { useGitHubStars, type RepoInfo } from "../api/useGitHubStars";
import { PageHeader } from "../components/UI";
import { useI18n } from "../i18n";

// Extended framework info
const FRAMEWORK_DETAILS: Record<string, {
  description: string;
  website: string;
  github: string;
  useCases: string[];
  architecture: string;
  schema: string; // ASCII diagram
}> = {
  "LangGraph": {
    description: "LangGraph, LangChain ekibi tarafından geliştirilen graph-state tabanlı ajan çerçevesidir. DAG (Yönlü Döngüsüz Graf) yerine siklik graflara izin verir; bu sayede geri-besleme döngüleri ve dinamik yeniden yönlendirme doğal olarak desteklenir.",
    website: "https://langchain-ai.github.io/langgraph",
    github: "https://github.com/langchain-ai/langgraph",
    useCases: ["Karmaşık çok adımlı iş akışları", "İnsan onaylı döngüler", "Durum makinesi gerektiren uygulamalar"],
    architecture: "Graph-State (Siklik DAG)",
    schema: `Girdi → [Planlayıcı] → [Araştırmacı] ⇄ [Analizci]
                              ↓
                        [Doğrulayıcı] → Çıktı
                              ↑
                        (Retry Döngüsü)`,
  },
  "Google ADK": {
    description: "Google Agent Development Kit, Google Cloud üzerinde çok ajanlı sistemler kurmak için tasarlanmış resmi Google çerçevesidir. Merkezi orkestratör etrafında hiyerarşik ajan ağları oluşturulur.",
    website: "https://google.github.io/adk-docs",
    github: "https://github.com/google/adk-python",
    useCases: ["Google Cloud entegrasyonları", "Çok ajanlı iş akışları", "Vertex AI ile entegrasyon"],
    architecture: "Multi-Agent Hub",
    schema: `Kullanıcı → [Orkestratör]
                   ↙      ↓      ↘
         [Ajan A] [Ajan B] [Ajan C]
                   ↘      ↓      ↙
                   [Birleştirici] → Yanıt`,
  },
  "OpenAI Agents": {
    description: "OpenAI'ın resmi Python SDK'sı ile ajan tanımı ve handoff mekanizması sağlanır. Bir ajan, görevi başka bir uzmana devredebilir; bağlam otomatik aktarılır.",
    website: "https://openai.github.io/openai-agents-python",
    github: "https://github.com/openai/openai-agents-python",
    useCases: ["Müşteri desteği botları", "Uzmanlaşmış ajan zincirleri", "GPT-4 tabanlı iş akışları"],
    architecture: "Handoff SDK",
    schema: `[Triaj Ajanı]
     ↓ handoff()
[Uzman Ajan] → Araç Çağrısı → Yanıt
     ↓ (başarısız)
[Fallback Ajan]`,
  },
  "CrewAI": {
    description: "Rol tabanlı ekip çalışması modeli. Her ajan belirli bir meslek rolünü üstlenir; Crew Manager görevleri planlar ve dağıtır. İnsan takımlarına benzer yapı.",
    website: "https://docs.crewai.com",
    github: "https://github.com/crewAIInc/crewAI",
    useCases: ["İçerik üretimi ekipleri", "Araştırma süreçleri", "Çok roller gerektiren otomasyon"],
    architecture: "Role-Playing Crew",
    schema: `[Crew Manager]
  ↙         ↘
[Araştırmacı] [Yazar]
       ↘        ↙
      [Editör] → Çıktı`,
  },
  "Pydantic AI": {
    description: "Pydantic topluluğu tarafından geliştirilen tip güvenli ajan çerçevesi. Girdi ve çıktılar Pydantic şemalarıyla doğrulanır; hata durumunda otomatik retry uygulanır.",
    website: "https://ai.pydantic.dev",
    github: "https://github.com/pydantic/pydantic-ai",
    useCases: ["Veri doğrulama kritik sistemler", "Yapısal çıktı gerektiren görevler", "Tip güvenliği öncelikli projeler"],
    architecture: "Type-Safe Agent",
    schema: `Girdi → [Pydantic Şema Doğrula]
              ↓
        [LLM Çağrısı]
              ↓
    [Çıktı Şema Doğrula]
     ↙              ↘
  Hata?            Başarı
  Retry            Teslim`,
  },
  "Agno": {
    description: "Yüksek hızlı async ajan motoru. Minimal bellek ayak izi ve maksimum verim için sıfırdan tasarlanmıştır. Paralel akışlar doğal desteklenir.",
    website: "https://docs.agno.com",
    github: "https://github.com/agno-agi/agno",
    useCases: ["Yüksek trafikli ajan servisleri", "Real-time yanıt gerektiren sistemler", "Paralel veri işleme"],
    architecture: "High-Speed Async",
    schema: `Girdi → [Hızlı Plan]
         ↙    ↓    ↘
    [İş A] [İş B] [İş C]  ← Paralel
         ↘    ↓    ↙
         [Topla] → Çıktı`,
  },
  "LlamaAgents": {
    description: "LlamaIndex ekosistemi üzerine kurulu servis veri yolu mimarisi. Ajanlar mesaj kuyruğu üzerinden haberleşen bağımsız mikro-servisler olarak çalışır; proje günümüzde llama_deploy olarak geliştirilmektedir.",
    website: "https://run-llama.github.io/llama_deploy",
    github: "https://github.com/run-llama/llama_deploy",
    useCases: ["Dağıtık ajan sistemleri", "LlamaIndex entegrasyonu", "Mikro-servis tabanlı yapılar"],
    architecture: "Service-Bus Micro",
    schema: `[Kuyruk Girdi]
      ↓
[Yönlendirici Servisi]
   ↙          ↘
[Servis A]  [Servis B]
   ↘          ↙
[Toplayıcı] → Çıktı`,
  },
  "Smolagents": {
    description: "HuggingFace tarafından geliştirilen minimal kod-eylem çerçevesi. Ajan, Python kodu üretir ve bu kodu güvenli sandbox ortamında doğrudan yürütür.",
    website: "https://huggingface.co/docs/smolagents",
    github: "https://github.com/huggingface/smolagents",
    useCases: ["Veri analizi otomasyonu", "Kod üretimi görevleri", "Hafif ajan uygulamaları"],
    architecture: "Code-Action Minimal",
    schema: `Görev Al → [LLM Kod Yaz]
                ↓
         [Sandbox Çalıştır]
                ↓
         Hata? → Yeniden Yaz
                ↓
         Sonuç → Teslim`,
  },
  "Mastra": {
    description: "TypeScript ile yazılmış iş akışı ve senkronizasyon odaklı ajan çerçevesi. Adım bazlı pipeline tanımı ve Vercel/Next.js entegrasyonları desteklenir.",
    website: "https://mastra.ai",
    github: "https://github.com/mastra-ai/mastra",
    useCases: ["TypeScript/Node.js projeleri", "Web uygulama entegrasyonları", "Adım bazlı iş akışları"],
    architecture: "Workflow & Sync",
    schema: `createWorkflow([
  step("Al", fn),
  step("İşle", fn),
  branch(koşul, [
    step("A Yolu"),
    step("B Yolu"),
  ]),
  step("Birleştir"),
])`,
  },
  "Microsoft AF": {
    description: "Microsoft AutoGen ve Semantic Kernel üzerine kurulu kurumsal ölçekli ajan çerçevesi. Azure entegrasyonu, güvenlik katmanları ve RBAC erişim kontrolü dahili olarak gelir.",
    website: "https://microsoft.github.io/autogen",
    github: "https://github.com/microsoft/autogen",
    useCases: ["Kurumsal Azure ortamları", "Güvenlik kritik uygulamalar", "Microsoft 365 entegrasyonları"],
    architecture: "Enterprise Agent",
    schema: `[Auth/RBAC Katmanı]
        ↓
  [Orkestratör]
  ↙         ↘
[Ajan A]  [Ajan B]
        ↓
[Güvenlik Denetim]
        ↓
   [Onaylayıcı] → Çıktı`,
  },
};

export function FrameworkHubPage() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedFw, setSelectedFw] = useState<string | null>(null);
  const [matrixDetail, setMatrixDetail] = useState<{ fw: string; cap: string; val: number } | null>(null);
  const stars = useGitHubStars();

  const fmtCompact = (n: number) =>
    new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);

  const sourceInfo = (info: RepoInfo | undefined): { label: string; color: string; title: string } => {
    if (!info) return { label: t("yaklaşık (yedek) değer"), color: THEME.subtle, title: t("Yaklaşık (yedek) değer") };
    if (info.source === "live") {
      return {
        label: t("Canlı GitHub verisi"),
        color: THEME.green,
        title: t("Canlı GitHub verisi · {time}").replace(
          "{time}",
          new Date(info.fetchedAt).toLocaleString(locale)
        ),
      };
    }
    if (info.source === "cache") {
      return {
        label: t("Önbellekten alındı"),
        color: THEME.amber,
        title: t("Önbellekten alındı · {time}").replace(
          "{time}",
          new Date(info.fetchedAt).toLocaleString(locale)
        ),
      };
    }
    return { label: t("yaklaşık (yedek) değer"), color: THEME.subtle, title: t("Yaklaşık (yedek) değer") };
  };

  const capStates = [
    { icon: "?", label: t("Doğrulanmamış"), color: THEME.subtle, bg: "var(--bg-hover)" },
    { icon: "~", label: t("Adaptör ile"), color: THEME.blue, bg: "rgba(96, 165, 250, 0.12)" },
    { icon: "✓", label: t("Yerel (Native)"), color: THEME.green, bg: "rgba(52, 211, 153, 0.12)" },
  ];

  const filteredFws = FRAMEWORKS_DATA.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedFwData = selectedFw ? FRAMEWORKS_DATA.find((f) => f.name === selectedFw) : null;
  const selectedFwDetail = selectedFw ? FRAMEWORK_DETAILS[selectedFw] : null;
  const selectedFwExtra = selectedFw ? FRAMEWORK_EXTRA[selectedFw] : null;
  const selectedFwRepo = selectedFw ? FRAMEWORK_REPOS[selectedFw] : null;
  const selectedStars = selectedFw ? stars[selectedFw] : undefined;
  const selectedSource = sourceInfo(selectedStars);
  const detailHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    detailHeading.current?.scrollIntoView({ block: "nearest" });
  }, [selectedFw, matrixDetail]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        eyebrow={t("AŞAMA 1 · FRAMEWORK MATRİSİ")}
        title={t("10 Framework Yetenek ve Profil Merkezi")}
        description={t("Tüm kayıtlı framework'lerin yerel ve adaptör yeteneklerini karşılaştırın. Bir framework'e tıklayarak detaylı mimari, bağlantılar ve puanları görün.")}
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 18 }}>
        {/* Matrix */}
        <section className="arena-card">
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              borderBottom: `1px solid ${THEME.line}`,
              backgroundColor: THEME.panelAlt,
            }}
          >
            <input
              type="text"
              className="arena-input"
              placeholder={t("Framework ara…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 200, padding: "6px 10px", fontSize: 12 }}
            />
            <select
              className="arena-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: "6px 10px", fontSize: 12 }}
            >
              <option value="all">{t("Tüm Seviyeler")}</option>
              <option value="2">{t("Yalnız Yerel (Native)")}</option>
              <option value="1">{t("Yalnız Adaptör")}</option>
              <option value="0">{t("Doğrulanmamış")}</option>
            </select>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginLeft: "auto", fontSize: 11.5, color: THEME.muted }}>
              <span><span style={{ color: THEME.green }}>■</span> {t("Yerel")}</span>
              <span><span style={{ color: THEME.blue }}>■</span> {t("Adaptör")}</span>
              <span><span style={{ color: THEME.subtle }}>■</span> {t("Belirsiz")}</span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="arena-table" style={{ whiteSpace: "nowrap" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 130 }}>Framework</th>
                  <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 10.5 }} title={t("GitHub yıldız sayısı (canlı)")}>
                    ⭐ {t("Yıldız")}
                  </th>
                  {CAPABILITIES.map((cap) => (
                    <th key={cap} style={{ textAlign: "center", padding: "10px 5px", fontSize: 10.5 }}>
                      {t(cap)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFws.map((fw) => {
                  const isSelected = fw.name === selectedFw;
                  return (
                    <tr
                      key={fw.name}
                      style={{
                        backgroundColor: isSelected ? "rgba(56, 189, 248, 0.07)" : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setMatrixDetail(null);
                        setSelectedFw(isSelected ? null : fw.name);
                      }}
                    >
                      <td style={{ fontWeight: 600, color: isSelected ? THEME.cyan : THEME.text }}>
                        <button
                          type="button"
                          aria-expanded={isSelected}
                          aria-controls={isSelected ? "framework-profile" : undefined}
                          style={{ background: "none", border: 0, padding: 0, font: "inherit", color: "inherit", cursor: "pointer" }}
                        >
                          {fw.name}
                        </button>
                        <div style={{ fontSize: 10, color: THEME.muted, fontWeight: 400 }}>{fw.architecture}</div>
                      </td>
                      <td style={{ textAlign: "center", padding: "8px 8px" }}>
                        {(() => {
                          const info = stars[fw.name];
                          const si = sourceInfo(info);
                          return (
                            <span
                              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                              title={`${t("GitHub yıldız sayısı (canlı)")} · ${si.title}${info?.repo ? ` · ${info.repo}` : ""}`}
                            >
                              <span className="arena-mono" style={{ fontSize: 12, fontWeight: 700, color: THEME.text }}>
                                ⭐ {info ? fmtCompact(info.stars) : "…"}
                              </span>
                              <span
                                aria-hidden="true"
                                style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: si.color, flexShrink: 0 }}
                              />
                            </span>
                          );
                        })()}
                      </td>
                      {fw.caps.map((val, j) => {
                        const st = capStates[val] ?? capStates[0]!;
                        const capName = CAPABILITIES[j] ?? "";
                        const isHidden = filter !== "all" && Number(filter) !== val;
                        return (
                          <td key={j} style={{ textAlign: "center", padding: "5px 3px" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFw(fw.name);
                                setMatrixDetail({ fw: fw.name, cap: capName, val });
                              }}
                              style={{
                                display: isHidden ? "none" : "inline-grid",
                                placeItems: "center",
                                width: 36,
                                height: 23,
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: st.bg,
                                border: `1px solid ${st.color}`,
                                color: st.color,
                                cursor: "pointer",
                                padding: 0,
                              }}
                              title={`${fw.name} / ${t(capName)}: ${t(st.label)}`}
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
        </section>

        {/* Detail panel */}
        {selectedFw && selectedFwData && selectedFwDetail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section className="arena-card" id="framework-profile" aria-labelledby="framework-profile-heading">
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: `1px solid ${THEME.line}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h2 ref={detailHeading} id="framework-profile-heading" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: THEME.text }}>
                    {selectedFw}
                  </h2>
                  <div style={{ fontSize: 11.5, color: THEME.muted, marginTop: 2 }}>
                    {t(selectedFwDetail.architecture)} · v{selectedFwData.version}
                  </div>
                </div>
                <button
                  aria-label={t("Framework ayrıntılarını kapat")}
                  onClick={() => {
                    setMatrixDetail(null);
                    setSelectedFw(null);
                  }}
                  className="arena-btn"
                  style={{ padding: "4px 10px", fontSize: 11 }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Description */}
                <p style={{ fontSize: 13, color: THEME.muted, margin: 0, lineHeight: 1.6 }}>
                  {t(selectedFwDetail.description)}
                </p>

                {/* GitHub profile (live) */}
                {selectedStars && (
                  <div
                    style={{
                      backgroundColor: THEME.panelAlt,
                      border: `1px solid ${THEME.line}`,
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        {t("GitHub Profili")} {selectedFwRepo ? <span className="arena-mono" style={{ textTransform: "none", letterSpacing: 0 }}>{selectedFwRepo.repo}</span> : null}
                      </div>
                      <span
                        title={selectedSource.title}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          color: selectedSource.color,
                        }}
                      >
                        <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: selectedSource.color }} />
                        {selectedSource.label}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                      {[
                        { label: t("Yıldız"), val: selectedStars.stars.toLocaleString(locale), color: THEME.amber },
                        { label: t("Fork"), val: selectedStars.forks != null ? selectedStars.forks.toLocaleString(locale) : "—", color: THEME.blue },
                        { label: t("Açık Issue"), val: selectedStars.openIssues != null ? selectedStars.openIssues.toLocaleString(locale) : "—", color: THEME.red },
                        { label: t("Ana Dil"), val: selectedStars.language ?? selectedFwExtra?.language ?? "—", color: THEME.cyan },
                        { label: t("Lisans"), val: selectedStars.license ?? selectedFwExtra?.license ?? "—", color: THEME.green },
                        {
                          label: t("Son Güncelleme"),
                          val: selectedStars.pushedAt
                            ? new Date(selectedStars.pushedAt).toLocaleDateString(locale)
                            : "—",
                          color: THEME.purple,
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          style={{
                            backgroundColor: THEME.panel,
                            border: `1px solid ${THEME.lineSubtle}`,
                            borderRadius: 6,
                            padding: "8px 10px",
                            minWidth: 0,
                          }}
                        >
                          <div style={{ fontSize: 10, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                            {s.label}
                          </div>
                          <div className="arena-mono" style={{ fontSize: 13, fontWeight: 700, color: s.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href={selectedFwDetail.website}
                    target="_blank"
                    rel="noreferrer"
                    className="arena-btn arena-btn-primary"
                    style={{ fontSize: 12, padding: "6px 12px" }}
                  >
                    🌐 {t("Web Sitesi")}
                  </a>
                  <a
                    href={selectedFwDetail.github}
                    target="_blank"
                    rel="noreferrer"
                    className="arena-btn"
                    style={{ fontSize: 12, padding: "6px 12px" }}
                  >
                    ⌥ GitHub
                  </a>
                </div>

                {/* Project info */}
                {selectedFwExtra && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>
                      {t("Proje Bilgileri")}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                      {[
                        { label: t("Geliştirici"), val: t(selectedFwExtra.maker) },
                        { label: t("İlk Sürüm"), val: selectedFwExtra.firstRelease },
                        { label: t("Ana Dil"), val: selectedStars?.language ?? selectedFwExtra.language },
                      ].map((s) => (
                        <div
                          key={s.label}
                          style={{
                            backgroundColor: THEME.panelAlt,
                            border: `1px solid ${THEME.lineSubtle}`,
                            borderRadius: 6,
                            padding: "8px 10px",
                            minWidth: 0,
                          }}
                        >
                          <div style={{ fontSize: 10, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                            {s.label}
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.val}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className="arena-mono"
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "8px 12px",
                        backgroundColor: THEME.panelAlt,
                        border: `1px solid ${THEME.lineSubtle}`,
                        borderRadius: 6,
                        fontSize: 12,
                        color: THEME.green,
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>$ {selectedFwExtra.install}</span>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            navigator.clipboard?.writeText(selectedFwExtra.install);
                          } catch {
                            /* pano erişilemezse yoksay */
                          }
                        }}
                        style={{ background: "none", border: 0, color: THEME.cyan, cursor: "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0 }}
                        title={t("Kopyala")}
                      >
                        {t("Kopyala")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Use cases */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>
                    {t("Öne Çıkan Kullanım Alanları")}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {selectedFwDetail.useCases.map((u, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: THEME.text }}>
                        <span style={{ color: THEME.cyan, fontSize: 10 }}>◆</span>
                        {t(u)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths / limitations / integrations */}
                {selectedFwExtra && (
                  <div className="arena-grid-2-asym">
                    <div
                      style={{
                        backgroundColor: "rgba(52, 211, 153, 0.06)",
                        border: "1px solid rgba(52, 211, 153, 0.25)",
                        borderRadius: 8,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: THEME.green, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                        {t("Güçlü Yönler")}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {selectedFwExtra.strengths.map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: 7, fontSize: 12.5, color: THEME.text, lineHeight: 1.5 }}>
                            <span style={{ color: THEME.green, flexShrink: 0 }}>+</span>
                            {t(s)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: "rgba(251, 113, 133, 0.06)",
                        border: "1px solid rgba(251, 113, 133, 0.25)",
                        borderRadius: 8,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: THEME.red, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                        {t("Dikkat Edilmesi Gerekenler")}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {selectedFwExtra.limitations.map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: 7, fontSize: 12.5, color: THEME.text, lineHeight: 1.5 }}>
                            <span style={{ color: THEME.red, flexShrink: 0 }}>−</span>
                            {t(s)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedFwExtra && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      {t("Entegrasyonlar")}
                    </span>
                    {selectedFwExtra.integrations.split("·").map((part, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          backgroundColor: THEME.panelAlt,
                          border: `1px solid ${THEME.line}`,
                          borderRadius: 999,
                          padding: "3px 10px",
                          color: THEME.muted,
                        }}
                      >
                        {part.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Architecture schema */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>
                    {t("Mimari Şema")}
                  </div>
                  <pre
                    className="arena-mono"
                    style={{
                      margin: 0,
                      padding: 14,
                      backgroundColor: "var(--bg-card-alt)",
                      borderRadius: 8,
                      fontSize: 11.5,
                      color: THEME.green,
                      border: `1px solid ${THEME.line}`,
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {t(selectedFwDetail.schema)}
                  </pre>
                </div>

                {/* Score bars */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                    {t("Performans Profili")}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {[
                      { label: t("Kalite"), val: selectedFwData.v[0], color: THEME.cyan },
                      { label: t("Hız"), val: selectedFwData.v[1], color: THEME.blue },
                      { label: t("Token Verimliliği"), val: selectedFwData.v[2], color: THEME.green },
                      { label: t("Güvenilirlik"), val: selectedFwData.v[3], color: THEME.purple },
                    ].map((m) => (
                      <div key={m.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: THEME.muted }}>{m.label}</span>
                          <span className="arena-mono" style={{ color: m.color, fontWeight: 700 }}>
                            {m.val} / 100
                          </span>
                        </div>
                        <div style={{ height: 5, background: THEME.lineSubtle, borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${m.val}%`, height: "100%", background: m.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matrix cell detail */}
                {matrixDetail && matrixDetail.fw === selectedFw && (
                  <div
                    style={{
                      backgroundColor: THEME.panelAlt,
                      border: `1px solid ${THEME.line}`,
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div className="arena-eyebrow" style={{ marginBottom: 4 }}>{t("Seçilen Yetenek")}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{t(matrixDetail.cap)}</div>
                    <div style={{ marginTop: 5, color: capStates[matrixDetail.val]!.color, fontWeight: 600, fontSize: 13 }}>
                      ● {capStates[matrixDetail.val]!.label}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
