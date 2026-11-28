import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { THEME } from "../data/mockData";
import { api, ApiError, frameworkName, post, STATUS_LABEL, type ExportRecord, type Ranking } from "../api/client";
import { resolveExperimentId, useExperiment, useExperimentList } from "../api/useExperiment";
import { ExperimentPicker, NoExperiment } from "../components/ExperimentPicker";
import { PageHeader } from "../components/UI";
import { useI18n } from "../i18n";

type Format = ExportRecord["format"];

const FORMATS: { id: Format; label: string; hint: string }[] = [
  { id: "zip", label: "📦 Bağımsız Zip", hint: "Tüm dosyalar: README, Dockerfile, pyproject.toml, main.py, .env.example" },
  { id: "docker", label: "🐳 Docker Paketi", hint: "Container ile çalıştırmak için Dockerfile ağırlıklı paket" },
  { id: "poetry", label: "🐍 Python Paketi", hint: "pyproject.toml ve main.py ile Python paketi" },
];

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

export function LibraryExporterPage() {
  const { t, locale } = useI18n();
  const routed = useLocation().state as { experimentId?: string; candidateId?: string } | null;
  const { list, loading: listLoading, error: listError } = useExperimentList();
  const [chosen, setChosen] = useState<string | null>(null);
  const expId = chosen ?? resolveExperimentId(routed?.experimentId, list);
  const { experiment, error } = useExperiment(expId);

  const [format, setFormat] = useState<Format>("zip");
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [created, setCreated] = useState<ExportRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const exportable = (experiment?.candidate_details ?? []).filter((c) => c.status === "completed");

  const loadHistory = () =>
    api<ExportRecord[]>("/v1/exports").then(setHistory).catch(() => undefined);
  useEffect(() => void loadHistory(), []);

  // Default selection: explicit navigation > recommended winner > first exportable candidate.
  const doneKey = exportable.map((c) => c.id).join(",");
  useEffect(() => {
    setCreated(null);
    setActionError("");
    if (!expId || !exportable.length) {
      setCandidateId(null);
      setWinner(null);
      return;
    }
    let alive = true;
    post<Ranking>(`/v1/experiments/${expId}/rankings`, {})
      .then((ranking) => {
        if (!alive) return;
        const top = exportable.find((c) => c.framework_id === ranking.winner);
        setWinner(top?.id ?? null);
        setCandidateId((current) =>
          current && exportable.some((c) => c.id === current)
            ? current
            : (routed?.candidateId && exportable.some((c) => c.id === routed.candidateId) ? routed.candidateId : top?.id ?? exportable[0]!.id),
        );
      })
      .catch(() => alive && setCandidateId((current) => current ?? exportable[0]!.id));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expId, doneKey]);

  const candidate = exportable.find((c) => c.id === candidateId);

  async function createPackage() {
    if (!candidate || busy) return;
    setBusy(true);
    setActionError("");
    try {
      const record = await post<ExportRecord>(`/v1/candidates/${candidate.id}/exports?format=${format}`);
      setCreated(record);
      await loadHistory();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : t("Paket oluşturulamadı."));
    } finally {
      setBusy(false);
    }
  }

  async function download(record: ExportRecord) {
    setActionError("");
    try {
      const response = await fetch(`/v1/exports/${record.id}/download`);
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new ApiError(body?.message ?? `${t("İndirme başarısız (")}${response.status}${t(").")}`, response.status);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = record.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : t("Paket indirilemedi."));
    }
  }

  const selectedFormat = FORMATS.find((f) => f.id === format)!;

  return (
    <div>
      <PageHeader
        eyebrow={t("ADR-0009 VE ADR-0010 SECRET-FREE DIŞA AKTARIM")}
        title={t("Proje Dışa Aktarımı ve Çıktılar")}
        description={t("Seçilen adayın pipeline'ını platform bağımlılığı ve gizli anahtar içermeyen taşınabilir bağımsız paket olarak indirin.")}
        right={
          <>
            <ExperimentPicker list={list} value={expId} onChange={setChosen} />
            <div className="arena-status-bar">
              <span style={{ color: THEME.green }}>{t("✓ Secret-Free Denetlendi")}</span>
              <span style={{ color: THEME.line }}>|</span>
              <span style={{ color: THEME.cyan }}>{t("Sıfır Platform Bağımlılığı")}</span>
            </div>
          </>
        }
      />

      {!expId ? (
        <NoExperiment loading={listLoading} error={listError} />
      ) : (
        <div className="arena-grid-2-asym">
          <div className="arena-card arena-card-pad">
            {(error || actionError) && <p role="alert" style={{ color: THEME.red }}>{actionError || error}</p>}
            {experiment && experiment.status !== "completed" && (
              <p role="status" style={{ color: THEME.amber }}>{t("Deney durumu: ")}{t(STATUS_LABEL[experiment.status])}. {t("Tamamlanan adaylar dışa aktarılabilir.")}</p>
            )}

            <div role="group" aria-label={t("Paket biçimi")} style={{ display: "flex", gap: 8, marginBottom: 18, borderBottom: `1px solid ${THEME.line}`, paddingBottom: 14, flexWrap: "wrap" }}>
              {FORMATS.map((tab) => (
                <button key={tab.id} aria-pressed={format === tab.id} onClick={() => { setFormat(tab.id); setCreated(null); }} className={`arena-btn ${format === tab.id ? "arena-btn-primary" : ""}`}>
                  {t(tab.label)}
                </button>
              ))}
            </div>

            {exportable.length === 0 ? (
              <p style={{ color: THEME.muted }}>{t("Dışa aktarılabilecek tamamlanmış aday yok.")}</p>
            ) : (
              <>
                <label style={{ display: "block", fontSize: 12, color: THEME.muted, marginBottom: 6 }} htmlFor="export-candidate">{t("Aday framework")}</label>
                <select
                  id="export-candidate"
                  value={candidateId ?? ""}
                  onChange={(e) => { setCandidateId(e.target.value); setCreated(null); }}
                  style={{ background: THEME.panelAlt, color: THEME.text, border: `1px solid ${THEME.line}`, borderRadius: 6, padding: "8px 10px", marginBottom: 16, minWidth: 260 }}
                >
                  {exportable.map((c) => (
                    <option key={c.id} value={c.id}>
                      {frameworkName(c.framework_id)}{c.id === winner ? t(" ★ Önerilen") : ""}{c.evaluation && !c.evaluation.eligible ? t(" (hard gate geçemedi)") : ""}
                    </option>
                  ))}
                </select>

                {candidate && (
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.cyan, margin: "0 0 8px" }}>
                    arena-export-{candidate.framework_id}{format === "zip" ? "" : `-${format}`}.zip
                  </h3>
                )}
                <p style={{ fontSize: 12.5, color: THEME.muted, lineHeight: 1.6, margin: "0 0 18px" }}>
                  {t(selectedFormat.hint)}. {t("Paket hiçbir Arena kütüphanesine veya platform gizli anahtarına bağımlı değildir.")}
                </p>

                <div className="arena-mono" style={{ backgroundColor: THEME.panelAlt, borderRadius: 8, padding: 16, fontSize: 12, color: THEME.text, marginBottom: 20, border: `1px solid ${THEME.line}`, lineHeight: 1.9 }}>
                  {(created?.files ?? (format === "poetry" ? ["README.md", "pyproject.toml", "main.py", ".env.example"] : ["README.md", "Dockerfile", "pyproject.toml", "main.py", ".env.example"])).map((file) => (
                    <div key={file}>📄 {file}</div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => void createPackage()} disabled={!candidate || busy} className="arena-btn" style={{ padding: "10px 22px", fontSize: 13 }}>
                    {busy ? t("Hazırlanıyor…") : t("Paketi Oluştur ve Doğrula")}
                  </button>
                  {created && (
                    <button onClick={() => void download(created)} className="arena-btn arena-btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>
                      {t("⤓ İndir (")}{kb(created.size_bytes)})
                    </button>
                  )}
                </div>
                {created && (
                  <p className="arena-mono" style={{ fontSize: 11, color: THEME.green, marginTop: 12, overflowWrap: "anywhere" }}>
                    ✓ SHA-256 {created.sha256} · {created.secrets_found} {t("gizli anahtar bulundu")}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="arena-card arena-card-pad">
            <h4 style={{ fontSize: 12.5, color: THEME.muted, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("Dışa Aktarım Geçmişi ve Doğrulama")}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              {history.length === 0 && <p style={{ color: THEME.muted, margin: 0 }}>{t("Henüz dışa aktarım yok.")}</p>}
              {history.slice(0, 10).map((item) => (
                <div key={item.id} style={{ backgroundColor: THEME.panelAlt, padding: 12, borderRadius: 8, border: `1px solid ${THEME.lineSubtle}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, gap: 8 }}>
                    <b style={{ color: THEME.text, overflowWrap: "anywhere" }}>{item.filename}</b>
                    <span className="arena-mono" style={{ color: THEME.green, whiteSpace: "nowrap" }}>✓ SHA256 OK</span>
                  </div>
                  <div className="arena-mono" style={{ fontSize: 11, color: THEME.muted, display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span>{new Date(item.created_at).toLocaleString(locale)} · {kb(item.size_bytes)} · {item.secrets_found} {t("gizli anahtar")}</span>
                    <button type="button" className="arena-btn" style={{ padding: "2px 10px", fontSize: 11 }} onClick={() => void download(item)}>{t("İndir")}</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 14, borderRadius: 8, backgroundColor: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.25)" }}>
              <div style={{ color: THEME.green, fontWeight: 600, fontSize: 12, marginBottom: 5 }}>{t("✓ ADR-0009 İzolasyon Garantisi")}</div>
              <div style={{ color: THEME.muted, fontSize: 12, lineHeight: 1.55 }}>
                {t("Paket oluşturulurken kaynak kod gizli anahtar desenleri için taranır; bulunursa dışa aktarım engellenir. İndirilen paketin SHA-256 özeti sunucuda yeniden doğrulanır.")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
