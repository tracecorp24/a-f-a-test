import { useEffect, useState } from "react";
import { FRAMEWORKS_DATA, THEME } from "../data/mockData";
import { api, ApiError, FRAMEWORK_IDS, post, type RuntimeInfo, type Verification } from "../api/client";
import { resolveExperimentId, useExperiment, useExperimentList } from "../api/useExperiment";
import { EvaluationMetrics } from "../components/EvaluationMetrics";
import { PageHeader } from "../components/UI";

type Tab = "code" | "manifest" | "docker";

export function DevelopmentStudioPage() {
  const [selectedFw, setSelectedFw] = useState("LangGraph");
  const [activeTab, setActiveTab] = useState<Tab>("code");
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [runtimeError, setRuntimeError] = useState("");
  const [verifications, setVerifications] = useState<Record<string, Verification>>({});
  const [verifying, setVerifying] = useState(false);

  const { list } = useExperimentList();
  const { experiment } = useExperiment(resolveExperimentId(null, list));

  const fwId = FRAMEWORK_IDS[selectedFw]!;
  const verification = verifications[fwId];

  useEffect(() => {
    let alive = true;
    setRuntime(null);
    setRuntimeError("");
    api<RuntimeInfo>(`/v1/frameworks/${fwId}/runtime`)
      .then((r) => alive && setRuntime(r))
      .catch((e) => alive && setRuntimeError(e instanceof ApiError ? e.message : "Runtime bilgisi alınamadı."));
    return () => {
      alive = false;
    };
  }, [fwId]);

  async function verify(ids: string[]) {
    setVerifying(true);
    setRuntimeError("");
    try {
      for (const id of ids) {
        const result = await post<Verification>(`/v1/frameworks/${id}/verify`);
        setVerifications((prev) => ({ ...prev, [id]: result }));
      }
    } catch (e) {
      setRuntimeError(e instanceof ApiError ? e.message : "Doğrulama başarısız.");
    } finally {
      setVerifying(false);
    }
  }

  const all = Object.values(verifications);
  const verifiedCount = all.filter((v) => v.verification_status === "verified").length;
  const ver = (ok: boolean | undefined, label: string) =>
    ok === undefined ? <span style={{ color: THEME.muted }}>— {label}</span> : ok ? <span style={{ color: THEME.green }}>✓ {label}</span> : <span style={{ color: THEME.red }}>✗ {label}</span>;
  const content = activeTab === "code" ? runtime?.source : activeTab === "manifest" ? runtime?.manifest : runtime?.dockerfile;
  const fileName = { code: "skeleton/main.py", manifest: "manifest.yaml", docker: "Dockerfile (dışa aktarım)" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader
        eyebrow="ADAPTÖR KODU VE UYUMLULUK DENETİMİ"
        title="Geliştirme Stüdyosu"
        description="Framework işçilerinin gerçek kodu, manifesti ve uyumluluk testleri. Doğrulama işçiyi sunucuda çalıştırır."
        right={
          <>
            <div className="arena-status-bar">
              <span style={{ color: all.length ? (verifiedCount === all.length ? THEME.green : THEME.red) : THEME.muted }}>
                {all.length ? `${verifiedCount}/${all.length} Doğrulandı` : "Henüz doğrulanmadı"}
              </span>
            </div>
            <button className="arena-btn" disabled={verifying} onClick={() => void verify([fwId])}>{verifying ? "Doğrulanıyor…" : "Seçiliyi Doğrula"}</button>
            <button className="arena-btn arena-btn-primary" disabled={verifying} onClick={() => void verify(Object.values(FRAMEWORK_IDS))}>Tümünü Doğrula</button>
          </>
        }
      />
      {runtimeError && <p role="alert" style={{ color: THEME.red }}>{runtimeError}</p>}

      <div className="arena-framework-detail-grid">
        <div className="arena-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.subtle, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 10px 10px" }}>Aday Framework'ler</div>
          {FRAMEWORKS_DATA.map((item) => {
            const isActive = selectedFw === item.name;
            const v = verifications[FRAMEWORK_IDS[item.name]!];
            return (
              <button
                key={item.name}
                aria-pressed={isActive}
                onClick={() => setSelectedFw(item.name)}
                style={{ width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 7, border: isActive ? "1px solid #2c5270" : "1px solid transparent", backgroundColor: isActive ? "#15283d" : "transparent", color: isActive ? THEME.cyan : THEME.muted, fontWeight: isActive ? 600 : 500, fontSize: 12.5, cursor: "pointer", marginBottom: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>{item.name}</span>
                <span title={v ? v.verification_status : "doğrulanmadı"} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: v ? (v.verification_status === "verified" ? THEME.green : THEME.red) : THEME.subtle }} />
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="arena-card arena-grid-4" style={{ padding: "14px 18px" }}>
            {[
              { label: "Manifest Doğrulama", node: ver(verification?.manifest_valid ?? (runtime ? runtime.manifest_errors.length === 0 : undefined), verification ? "PASS (schema v1)" : runtime ? (runtime.manifest_errors.length ? "HATA" : "PASS (schema v1)") : "bekleniyor") },
              { label: "Worker Yaşam Döngüsü", node: ver(verification?.smoke_test.passed, verification ? (verification.smoke_test.passed ? `PASS (${verification.smoke_test.duration_ms} ms)` : "FAIL") : "Doğrulanmadı") },
              { label: "JSONL İletişim Protokolü", node: ver(verification ? verification.smoke_test.events > 0 : undefined, verification ? `${verification.smoke_test.events} olay` : "Doğrulanmadı") },
              { label: "Sürüm", node: <span style={{ color: THEME.cyan }}>{runtime?.version ?? "—"}</span> },
            ].map(({ label, node }) => (
              <div key={label}>
                <div style={{ fontSize: 10.5, color: THEME.subtle, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 3 }}>{node}</div>
              </div>
            ))}
          </div>
          {verification && !verification.manifest_valid && <p role="alert" style={{ color: THEME.red }}>Manifest hataları: {verification.manifest_errors.join(", ")}</p>}
          {verification?.smoke_test.error && <p role="alert" style={{ color: THEME.red }}>Smoke test hatası: {verification.smoke_test.error}</p>}

          <div className="arena-card">
            <div className="arena-card-header" style={{ backgroundColor: THEME.panelAlt }}>
              <div style={{ display: "flex", gap: 8 }}>
                {(["code", "manifest", "docker"] as const).map((id) => (
                  <button key={id} onClick={() => setActiveTab(id)} className={`arena-btn ${activeTab === id ? "arena-btn-primary" : ""}`} style={{ padding: "5px 11px", fontSize: 11.5 }}>
                    {fileName[id]}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 11, color: THEME.green, background: "rgba(52, 211, 153, 0.12)", padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(52, 211, 153, 0.35)", fontWeight: 600 }}>
                Depodaki Gerçek Dosya
              </span>
            </div>
            <pre className="arena-mono" style={{ margin: 0, padding: 18, backgroundColor: "#090d14", fontSize: 12, color: THEME.text, overflowX: "auto", lineHeight: 1.6 }}>
              {content ?? "Yükleniyor…"}
            </pre>
          </div>
        </div>
      </div>

      <EvaluationMetrics
        candidates={experiment?.candidate_details ?? []}
        selectedFramework={selectedFw}
        threshold={experiment?.threshold}
        fixtureLabeled={experiment?.fixture?.labeled_conflicts}
      />
    </div>
  );
}
