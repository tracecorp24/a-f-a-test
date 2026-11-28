import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FRAMEWORKS_DATA, THEME } from "../data/mockData";
import { PageHeader, GenerationProgress, Modal } from "../components/UI";
import { SuccessTestFlow } from "../components/SuccessTestFlow";
import { TaskQuestionnaire, type TaskQuestion } from "../components/TaskQuestionnaire";
import { TaskFlowEditor } from "../components/TaskFlowEditor";
import { flowContext, makeTaskFlow, type TaskFlow } from "../components/taskFlow";
import { FRAMEWORK_PIPELINES } from "../data/frameworkRuns";
import { ApiError, FRAMEWORK_IDS, post, rememberExperiment } from "../api/client";
import {
  clearPipelineSnapshot,
  loadHistory,
  loadPipelineSnapshot,
  pushHistory,
  savePipelineSnapshot,
  type HistoryEntry,
} from "../api/pipelineStorage";
import { BENCHMARK_QUESTIONS, CLARIFICATION_QUESTIONS, METRIC_DEFINITIONS } from "../data/taskQuestions";
import { useI18n } from "../i18n";

const SAMPLE_OBJECTIVES = [
  "Sözleşmeleri analiz et, teslim tarihi ve bütçe çelişkilerini bul ve kanıtlı rapor üret.",
  "Kaynak kod deposunu incele, gizli anahtar ve SQL enjeksiyon açıklarını CVE referanslarıyla raporla.",
  "Finansal tabloları ve son 30 günlük bültenleri karşılaştır, likidite risklerini modelle.",
  "REST API şemasına göre uç nokta sınır değerlerini test eden JSON senaryoları hazırla.",
];

const TASK_STEPS = [
  { key: "prompt", label: "1. Görev Tanımı ve Netleştirme" },
  { key: "pipeline", label: "2. Pipeline Oluştur" },
  { key: "criteria", label: "3. Başarı Kriteri Tasarımı" },
] as const;

type Step = (typeof TASK_STEPS)[number]["key"];

export function TaskPipelinePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const restored = useMemo(() => loadPipelineSnapshot(), []);
  const [step, setStep] = useState<Step>(((restored?.step ?? "prompt") as Step));
  const [objective, setObjective] = useState(restored?.objective ?? "");
  const [flow, setFlow] = useState<TaskFlow>(restored?.flow ?? { blocks: [], edges: [] });
  const [scopeQuestions, setScopeQuestions] = useState<readonly TaskQuestion[]>(restored?.scopeQuestions ?? []);
  const [benchmarkQuestions, setBenchmarkQuestions] = useState<readonly TaskQuestion[]>(restored?.benchmarkQuestions ?? []);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [approvedBenchmark, setApprovedBenchmark] = useState("");
  const [benchmarkContext, setBenchmarkContext] = useState(restored?.benchmarkContext ?? "");
  const [scopeContext, setScopeContext] = useState(restored?.scopeContext ?? "");
  const [selectedFw, setSelectedFw] = useState(restored?.selectedFw ?? FRAMEWORKS_DATA[0]?.name ?? "");
  const [clarification, setClarification] = useState<string[][]>(restored?.clarification ?? []);
  const [benchmark, setBenchmark] = useState<string[][]>(restored?.benchmark ?? []);
  const [scopeInstruction, setScopeInstruction] = useState(restored?.scopeInstruction ?? "");
  const [benchmarkInstruction, setBenchmarkInstruction] = useState(restored?.benchmarkInstruction ?? "");
  const [demoLoaded, setDemoLoaded] = useState(restored?.demoLoaded ?? false);
  const [runNames, setRunNames] = useState<string[]>(() => FRAMEWORKS_DATA.map(({ name }) => name));
  const [builtInNotice, setBuiltInNotice] = useState(restored?.builtInNotice ?? false);
  const [launching, setLaunching] = useState(false);
  const [launchStage, setLaunchStage] = useState("");
  const [launchError, setLaunchError] = useState("");
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  // ---- Dayanıklılık: sayfa yenilense, sekme kapansa, tarayıcı kapanansa bile kaldığın yerden devam ----
  useEffect(() => {
    const timer = window.setTimeout(() => {
      savePipelineSnapshot({
        step, objective, flow,
        scopeQuestions: [...scopeQuestions], clarification,
        benchmarkQuestions: [...benchmarkQuestions], benchmark,
        scopeInstruction, benchmarkInstruction, selectedFw, demoLoaded,
        scopeContext, benchmarkContext, builtInNotice,
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [step, objective, flow, scopeQuestions, clarification, benchmarkQuestions, benchmark,
      scopeInstruction, benchmarkInstruction, selectedFw, demoLoaded, scopeContext, benchmarkContext, builtInNotice]);

  // Yeni bir soru seti üretildiğinde / demo yüklendiğinde geçmişe anlık görüntü kaydet
  const historyKey = useRef("");
  useEffect(() => {
    if (!scopeQuestions.length) return;
    const key = JSON.stringify(scopeQuestions);
    if (historyKey.current === key) return;
    historyKey.current = key;
    pushHistory(
      {
        step, objective, flow,
        scopeQuestions: [...scopeQuestions], clarification,
        benchmarkQuestions: [...benchmarkQuestions], benchmark,
        scopeInstruction, benchmarkInstruction, selectedFw, demoLoaded,
        scopeContext, benchmarkContext, builtInNotice,
      },
      objective.trim().slice(0, 90) || "İsimsiz görev",
    );
    setHistory(loadHistory());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot yalnızca yeni soru setinde alınır
  }, [scopeQuestions]);

  function restoreSnapshot(entry: HistoryEntry) {
    const s = entry.snapshot;
    setStep(s.step as Step);
    setObjective(s.objective);
    setFlow(s.flow);
    setScopeQuestions(s.scopeQuestions);
    setClarification(s.clarification);
    setBenchmarkQuestions(s.benchmarkQuestions);
    setBenchmark(s.benchmark);
    setScopeInstruction(s.scopeInstruction);
    setBenchmarkInstruction(s.benchmarkInstruction);
    setSelectedFw(s.selectedFw);
    setDemoLoaded(s.demoLoaded);
    setScopeContext(s.scopeContext);
    setBenchmarkContext(s.benchmarkContext);
    setBuiltInNotice(s.builtInNotice);
  }

  function resetTask() {
    clearPipelineSnapshot();
    historyKey.current = "";
    setStep("prompt");
    setObjective("");
    setFlow({ blocks: [], edges: [] });
    setScopeQuestions([]);
    setClarification([]);
    setBenchmarkQuestions([]);
    setBenchmark([]);
    setScopeInstruction("");
    setBenchmarkInstruction("");
    setDemoLoaded(false);
    setScopeContext("");
    setBenchmarkContext("");
    setBuiltInNotice(false);
    setApprovedBenchmark("");
    setGenerationError("");
  }


  const activeStep = TASK_STEPS.findIndex(({ key }) => key === step);
  const nodes = flow.blocks.map(({ label }) => label);
  const taskFlow = flowContext(flow);
  const clarified = scopeQuestions.length === 10 && scopeQuestions.every((_, index) => (clarification[index]?.length ?? 0) > 0);
  const scopeNeedsRefresh = !demoLoaded && scopeQuestions.length > 0
    && scopeContext !== JSON.stringify([objective.trim(), taskFlow]);
  const benchmarkReady = benchmarkQuestions.length === 10 && benchmarkQuestions.every((_, index) => (benchmark[index]?.length ?? 0) > 0);
  const framework = FRAMEWORKS_DATA.find(({ name }) => name === selectedFw);
  const pipeline = FRAMEWORK_PIPELINES[selectedFw];
  const scope = scopeQuestions.map(([question], index) => ({ question, answer: (clarification[index] ?? []).join(", ") }));
  const runConfig = {
    framework: selectedFw,
    objective,
    pipeline: pipeline?.nodes,
    taskFlow,
    scope,
    scopeInstruction,
  };
  const currentBenchmarkContext = JSON.stringify(runConfig);
  const benchmarkPlan = {
    source: benchmark[0]?.[0] ?? "",
    scenarios: benchmark[1]?.[0] ?? "",
    testCount: benchmark[2]?.[0] ?? "",
    reference: benchmark[3]?.[0] ?? "",
    hardGate: benchmark[6]?.[0] ?? "",
    repetitions: benchmark[7]?.[0] ?? "",
    measurements: benchmark[8]?.[0] ?? "",
    reporting: benchmark[9]?.[0] ?? "",
    instruction: benchmarkInstruction,
  };
  const successCriteria = {
    metric: benchmark[4]?.[0] ?? "",
    threshold: benchmark[5]?.[0] ?? "",
    verification: benchmark[3]?.[0] ?? "",
  };
  const acceptanceRule = {
    metric: successCriteria.metric,
    calculation: METRIC_DEFINITIONS[successCriteria.metric],
    zeroDenominator: "fail",
    operator: ">=",
    minimumPercent: Number(successCriteria.threshold.replace("%", "")),
    mandatoryFailure: benchmarkPlan.hardGate,
    sampleCount: Number(benchmarkPlan.testCount),
    repetitions: Number(benchmarkPlan.repetitions),
  };
  const benchmarkVersion = JSON.stringify({ runConfig, benchmark, benchmarkInstruction });

  async function generateDesign(mode: "scope" | "benchmark", instruction = "", preserveNodes = false) {
    if (generating) return;
    setGenerationError("");
    setGenerating(true);
    try {
      const submittedObjective = objective.trim() || nodes.filter((node) => node.trim()).join(" → ");
      const response = await fetch("/v1/task-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(150_000), // LLM askıda kalırsa UI'yı sonsuza kadar kilitleme
        body: JSON.stringify({
          mode,
          objective: submittedObjective,
          nodes,
          graph: taskFlow,
          instruction,
          context: [
            ...scope.filter(({ answer }) => answer).map(({ question, answer }) => `${question} ${answer}`),
            ...(mode === "benchmark"
              ? [scopeInstruction, `${selectedFw}: ${pipeline?.nodes.join(" → ") ?? ""}`, ...benchmarkQuestions.flatMap(([question], index) => (benchmark[index]?.length ?? 0) > 0 ? [`${question} ${(benchmark[index] ?? []).join(", ")}`] : [])].filter(Boolean)
              : []),
          ],
        }),
      });
      let draft = await response.json().catch(() => null);
      if (response.status === 503) {
        // No AI provider configured on the server: fall back to the built-in question sets.
        const builtIn = mode === "scope" ? CLARIFICATION_QUESTIONS : BENCHMARK_QUESTIONS;
        draft = {
          nodes: nodes.filter((node) => node.trim()).length >= 2
            ? nodes
            : ["input:Görevi al", "agent:Görevi işle", "validate:Çıktıyı doğrula", "output:Sonucu teslim et"],
          questions: builtIn.map(([question, ...options]) => ({ question, options })),
        };
        setBuiltInNotice(true);
      } else if (!response.ok || !draft) {
        throw new Error(typeof draft?.detail === "string" ? draft.detail : t("Tasarım isteği tamamlanamadı."));
      } else {
        setBuiltInNotice(false);
      }
      if (mode === "scope") {
        const questions: TaskQuestion[] = draft.questions.map(({ question, options }: { question: string; options: string[] }) => [question, ...options]);
        const nextFlow = preserveNodes ? flow : makeTaskFlow(draft.nodes);
        setFlow(nextFlow);
        setObjective(submittedObjective);
        setScopeContext(JSON.stringify([submittedObjective, flowContext(nextFlow)]));
        setScopeQuestions(questions);
        setClarification([]);
        setScopeInstruction(instruction);
        setBenchmarkQuestions([]);
        setBenchmark([]);
        setDemoLoaded(false);
      } else {
        const exactSlots = [2, 4, 5, 6, 7];
        const questions: TaskQuestion[] = draft.questions.map(
          ({ question, options }: { question: string; options: string[] }, index: number) =>
            exactSlots.includes(index) ? BENCHMARK_QUESTIONS[index]! : [question, ...options],
        );
        setBenchmarkQuestions(questions);
        setBenchmark([]);
        setBenchmarkInstruction(instruction);
        setBenchmarkContext(currentBenchmarkContext);
        setStep("criteria");
      }
      setApprovedBenchmark("");
    } catch (error) {
      setGenerationError(error instanceof SyntaxError || error instanceof TypeError
        ? t("Görev tasarımı API’sine bağlanılamadı.")
        : error instanceof Error ? error.message : t("Tasarım oluşturulamadı."));
    } finally {
      setGenerating(false);
    }
  }

  async function launchArena() {
    if (launching || !runNames.length) return;
    // Buton her zaman tıklanabilir: eksik koşul varsa sessizce kilitlenmek yerine bildirim ver.
    if (!benchmarkReady) {
      setNotice(t("Arenayı başlatmak için önce 10 kriter sorusunun tamamını yanıtla."));
      return;
    }
    if (approvedBenchmark !== benchmarkVersion) {
      setNotice(t("Arenayı başlatmak için önce 'Kriterleri Onayla' düğmesine bas."));
      return;
    }
    setLaunching(true);
    setLaunchError("");
    try {
      const repetitions = Number.parseInt(String(benchmarkPlan.repetitions ?? ""), 10);
      const threshold = acceptanceRule.minimumPercent / 100;
      const taskData = {
        objective,
        frameworks: runNames.map((name) => FRAMEWORK_IDS[name]).filter(Boolean),
        taskFlow,
        scope,
        scopeInstruction,
        benchmarkPlan,
        successCriteria,
        acceptanceRule,
        repetitions: Number.isFinite(repetitions) && repetitions > 0 ? repetitions : 1,
        threshold: Number.isFinite(threshold) && threshold > 0 ? threshold : 0.9,
      };
      setLaunchStage(t("Proje ve görev şartnamesi oluşturuluyor…"));
      const project = await post<{ id: string }>("/v1/projects", { name: objective.trim().slice(0, 80) || t("Görev") });
      const spec = await post<{ id: string; spec_hash: string }>(`/v1/projects/${project.id}/specs`, { task_data: taskData });
      setLaunchStage(t("Şartname onaylanıyor…"));
      await post(`/v1/specs/${spec.id}/approve?expected_hash=${encodeURIComponent(spec.spec_hash)}`);
      setLaunchStage(t("Deney kaydı açılıyor…"));
      const experiment = await post<{ id: string }>("/v1/experiments", { spec_id: spec.id });
      setLaunchStage(t("Framework işçileri hazırlanıyor…"));
      await post(`/v1/experiments/${experiment.id}/build`);
      setLaunchStage(t("Çalıştırma başlatılıyor…"));
      await post(`/v1/experiments/${experiment.id}/run`);
      rememberExperiment(experiment.id);
      // Çalıştırma arka planda sürer: hemen arenaya geç, ilerlemeyi orada canlı izle.
      navigate("/execution-arena", { state: { experimentId: experiment.id } });
    } catch (error) {
      setLaunchError(error instanceof ApiError ? error.message : t("Deney başlatılamadı."));
    } finally {
      setLaunching(false);
      setLaunchStage("");
    }
  }

  function loadDemoTask() {
    setBuiltInNotice(false);
    setObjective(SAMPLE_OBJECTIVES[0]!);
    const demoFlow = makeTaskFlow(["input:Sözleşmeleri al", "llm:Tarih ve bütçe bilgilerini çıkar", "validate:Çelişkileri doğrula", "output:Kanıtlı rapor oluştur"]);
    demoFlow.edges.push({ from: demoFlow.blocks[2]!.id, to: demoFlow.blocks[1]!.id, kind: "feedback" });
    setFlow(demoFlow);
    setSelectedFw("LangGraph");
    setClarification(CLARIFICATION_QUESTIONS.map(([, option]) => [option!]));
    setScopeQuestions(CLARIFICATION_QUESTIONS);
    setBenchmarkQuestions(BENCHMARK_QUESTIONS);
    setBenchmark(BENCHMARK_QUESTIONS.map((_, index) => [[
      "Etiketli örnekler", "Normal, sınır ve hata durumları", "30", "Referans cevap", "F1 skoru",
      "%90", "Geçersiz çıktı biçimi", "3", "Süre ve token kullanımı", "Her iki şekilde",
  ][index]!]));
    setScopeInstruction("");
    setBenchmarkInstruction("");
    setDemoLoaded(true);
    setGenerationError("");
    setApprovedBenchmark("");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 18 }}>
      <PageHeader
        eyebrow={t("AŞAMA 2 · GÖREV VE PİPELINE STÜDYOSU")}
        title={t("Görev Tanımı ve Akış Tasarımı")}
        description={t("Önce görevi belirtin. Ardından kapsamı netleştirin, framework akışını inceleyin ve görev benchmarkını tasarlayın.")}
        right={<span style={{ display: "inline-flex", gap: 8 }}>
          <button type="button" className="arena-btn" onClick={resetTask} disabled={generating}>{t("Yeni Görev")}</button>
          <button type="button" className="arena-btn" onClick={loadDemoTask} disabled={demoLoaded || generating}>{demoLoaded ? t("Demo görev yüklendi") : t("Demo Görevi Yükle")}</button>
        </span>}
      />

      <nav className="arena-grid-3" aria-label={t("Görev tasarımı adımları")}>
        {TASK_STEPS.map(({ key, label }, index) => {
          const reachable = demoLoaded || index <= activeStep;
          return (
            <button
              key={key}
              type="button"
              className={`arena-btn ${key === step ? "arena-btn-primary" : ""}`}
              aria-current={key === step ? "step" : undefined}
              disabled={generating}
              title={reachable ? undefined : t("Önce bu adımı tamamla; tamamlanmadan sonraki adım açılmaz.")}
              onClick={() => {
                if (!reachable) {
                  setNotice(t("Bu adım önceki adım tamamlanmadan açılmaz. Önce görevi tanımla ve netleştirme sorularını yanıtla."));
                  return;
                }
                if (key === "criteria" && (!benchmarkQuestions.length || (!demoLoaded && benchmarkContext !== currentBenchmarkContext))) {
                  if (generating) return;
                  setNotice(t("Kriter soruları hazırlanıyor — gerçek model çağrısı yapılıyor, tamamlanınca adım açılacak."));
                  void generateDesign("benchmark");
                } else {
                  setStep(key);
                }
              }}
            >
              {t(label)}
            </button>
          );
        })}
      </nav>

      {generationError && <p role="alert">{generationError}</p>}
      {notice && !generationError && <p role="status" style={{ color: "var(--accent-amber-ink)" }}>{notice}</p>}
      {builtInNotice && <p role="status" style={{ color: "var(--accent-amber-ink)" }}>{t("AI sağlayıcısı yapılandırılmadığı için yerleşik akış ve soru şablonu kullanıldı. Akışı ve yanıtları düzenleyebilirsiniz.")}</p>}
      <GenerationProgress visible={generating} note={t("Gerçek model çağrısı yapılıyor; büyük görevlerde 1-2 dakika sürebilir. Bu adım tamamlanmadan sonraki adım açılmaz — sayfayı kapatırsan bile kayıt tutulur.")} />

      {history.length > 0 && (
        <details className="arena-card arena-card-pad" open>
          <summary>{t("Geçmiş taslaklar")} ({history.length}) — {t("kaldığın yerden devam et")}</summary>
          <ul style={{ display: "grid", gap: 8, margin: "12px 0 0", padding: 0, listStyle: "none" }}>
            {history.map((entry) => (
              <li key={entry.ts} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid var(--accent-cyan-line)", borderRadius: 8 }}>
                <span style={{ flex: "1 1 240px", overflowWrap: "anywhere" }}>{entry.label}</span>
                <small style={{ color: THEME.cyan }}>{new Date(entry.ts).toLocaleString("tr-TR")}</small>
                <button type="button" className="arena-btn" disabled={generating} onClick={() => restoreSnapshot(entry)}>{t("Yükle")}</button>
              </li>
            ))}
          </ul>
        </details>
      )}

      {step === "prompt" && (
        <>
        <TaskFlowEditor flow={flow} onChange={setFlow} disabled={generating} />
        <section className="arena-card arena-card-pad">
          <label htmlFor="task-objective">{t("Framework Arena'ya ne yaptırmak istiyorsunuz?")}</label>
          <textarea id="task-objective" className="arena-textarea" style={{ width: "100%", margin: "10px 0" }} rows={5} maxLength={8000} disabled={generating} value={objective} onChange={(event) => setObjective(event.target.value)} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {SAMPLE_OBJECTIVES.map((sample) => (
              <button type="button" className="arena-btn" key={sample} disabled={generating} onClick={() => setObjective(sample)}>{t(sample).slice(0, 48)}…</button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="arena-btn arena-btn-primary" disabled={generating || objective.trim().length < 3} onClick={() => void generateDesign("scope", scopeInstruction)}>
              {t("Promptu Gönder ve Akış Oluştur")}
            </button>
            <button type="button" className="arena-btn" disabled={generating || nodes.filter((node) => node.trim()).length < 2} onClick={() => void generateDesign("scope", scopeInstruction, true)}>
              {t("Akışa Göre Soruları Oluştur")}
            </button>
          </div>
        </section>

        {scopeQuestions.length > 0 && (
        <section className="arena-card arena-card-pad">
          <h2 className="arena-card-title">{t("Görevi Netleştir")}</h2>
          <p>{objective}</p>
          <TaskQuestionnaire
            key={JSON.stringify(scopeQuestions)}
            questions={scopeQuestions}
            answers={clarification}
            multiple
            onAnswer={(index, selected) => setClarification((previous) => Object.assign([...previous], { [index]: [...selected] }))}
            instruction={scopeInstruction}
            onInstruction={(instruction) => void generateDesign("scope", instruction, true)}
            disabled={generating}
            onFinished={() => {
              if (!clarified) {
                setNotice(t("Pipeline'a geçmek için 10 netleştirme sorusunun tamamına cevap ver (boş 'Diğer' de olur)."));
                return;
              }
              if (scopeNeedsRefresh) {
                setNotice(t("Görev veya akış değişti; önce 'Akışa Göre Soruları Oluştur' ile soruları güncelle."));
                return;
              }
              setNotice("");
              setStep("pipeline");
            }}
            finishedLabel={t("Pipeline Oluşturmaya Geç →")}
          />
          {scopeNeedsRefresh && <p role="status">{t("Görev veya akış değişti. Devam etmek için soruları güncelleyin.")}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="button" className="arena-btn arena-btn-primary" disabled={generating || !clarified || scopeNeedsRefresh || nodes.filter((node) => node.trim()).length < 2} onClick={() => setStep("pipeline")}>{t("Pipeline'ı Oluştur →")}</button>
          </div>
        </section>
        )}
        </>
      )}

      {step === "pipeline" && framework && pipeline && (
        <>
          <div className="arena-framework-detail-grid">
            <nav className="arena-card arena-card-pad" aria-label={t("Framework akışları")} style={{ display: "grid", gap: 8 }}>
              {FRAMEWORKS_DATA.map(({ name }) => (
                <button key={name} type="button" aria-pressed={name === selectedFw} className={`arena-btn ${name === selectedFw ? "arena-btn-primary" : ""}`} onClick={() => setSelectedFw(name)}>{name}</button>
              ))}
            </nav>
            <section className="arena-card arena-card-pad">
              <h2 className="arena-card-title">{framework.name} {t("Akış Şeması")}</h2>
              <ol className="task-pipeline-flow">
                {pipeline.nodes.map((node) => <li key={node}>{node}</li>)}
              </ol>
              <h3 className="arena-card-title">{t("Framework Bilgileri")}</h3>
              <p>{framework.architecture} · v{framework.version}</p>
              <p>{pipeline.desc}</p>
              <details>
                <summary>{t("Görev kapsamı ve netleştirme yanıtları")}</summary>
                <p>{objective}</p>
                <dl>{scope.map(({ question, answer }) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl>
                {scopeInstruction && <p>{t("Ek kapsam talimatı:")} {scopeInstruction}</p>}
              </details>
              <h3 className="arena-card-title" style={{ marginTop: 16 }}>{t("Kod İskeleti")}</h3>
              <pre className="arena-mono task-code-skeleton">{`import json

def run_task(execute_pipeline):
    config = json.loads(
${JSON.stringify(runConfig, null, 2).split("\n").slice(0, 14).map((line) => `        ${JSON.stringify(line + "\n")}`).join("\n")}
        ...
    )
    return execute_pipeline(config)`}</pre>
              <button type="button" className="arena-btn" style={{ marginTop: 8 }} onClick={() => setCodeModalOpen(true)}>{t("⤢ İskeletin Tamamını Genişlet")}</button>
              <h3 className="arena-card-title">{t("Çalıştırmada Ölçülecek Değerler")}</h3>
              <p style={{ color: THEME.muted }}>{t("Çalışma süresi, token kullanımı ve benchmark sonucu çalıştırma sonrasında belirlenir.")}</p>
            </section>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className="arena-btn arena-btn-primary"
              disabled={generating}
              onClick={() => {
                if (generating) return;
                if (benchmarkQuestions.length && (demoLoaded || benchmarkContext === currentBenchmarkContext)) {
                  setNotice("");
                  setStep("criteria");
                } else {
                  setNotice(t("Kriter soruları hazırlanıyor — gerçek model çağrısı yapılıyor, bu adım tamamlanınca açılacak."));
                  void generateDesign("benchmark");
                }
              }}
            >{t("Başarı Kriteri Tasarımı →")}</button>
          </div>
          <Modal wide title={t("Kod İskeleti — Tam Görünüm")} onClose={() => setCodeModalOpen(false)}>
            <pre className="arena-mono" style={{ overflow: "auto", fontSize: 12, lineHeight: 1.5 }}>{`import json

def run_task(execute_pipeline):
    config = json.loads(
${JSON.stringify(runConfig, null, 2).split("\n").map((line) => `        ${JSON.stringify(line + "\n")}`).join("\n")}
    )
    return execute_pipeline(config)`}</pre>
          </Modal>
        </>
      )}

      {step === "criteria" && (
        <section className="arena-card arena-card-pad">
          <h2 className="arena-card-title">{t("Görev Benchmarkı Tasarımı")}</h2>
          <p>{objective}</p>
          <TaskQuestionnaire
            key={JSON.stringify(benchmarkQuestions)}
            questions={benchmarkQuestions}
            answers={benchmark}
            multiple={(index) => ![2, 4, 5, 7].includes(index)}
            onAnswer={(index, selected) => setBenchmark((previous) => Object.assign([...previous], { [index]: [...selected] }))}
            instruction={benchmarkInstruction}
            onInstruction={(instruction) => void generateDesign("benchmark", instruction)}
            disabled={generating}
            onFinished={() => {
              if (!benchmarkReady) {
                setNotice(t("Önce 10 kriter sorusunun tamamını yanıtla (boş 'Diğer' de olur)."));
                return;
              }
              if (approvedBenchmark !== benchmarkVersion) {
                setApprovedBenchmark(benchmarkVersion);
                setNotice(t("Kriterler onaylandı — şimdi framework'leri seçip '▶ Arenayı Başlat'a basabilirsin."));
                return;
              }
              setNotice(t("Kriterler hazır — '▶ Arenayı Başlat' ile çalıştırmayı başlat."));
            }}
            finishedLabel={t("Kriterleri Onayla →")}
          />
          <SuccessTestFlow criteria={successCriteria} benchmark={benchmarkPlan} />
          <fieldset style={{ border: "none", padding: 0, margin: "16px 0 0" }}>
            <legend className="arena-card-title">{t("Çalıştırılacak framework'ler")} ({runNames.length}/{FRAMEWORKS_DATA.length})</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FRAMEWORKS_DATA.map(({ name }) => {
                const on = runNames.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={on}
                    disabled={launching}
                    className={`arena-btn ${on ? "arena-btn-primary" : ""}`}
                    onClick={() => setRunNames((prev) => (on ? prev.filter((n) => n !== name) : [...prev, name]))}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </fieldset>
          {benchmarkReady && (
            <div>
              <p>{t("Kabul kuralı:")} {acceptanceRule.metric} ≥ %{acceptanceRule.minimumPercent}. {acceptanceRule.mandatoryFailure} {t("görüldüğünde test başarısız sayılır.")}</p>
              <p>{t("Hesaplama:")} {acceptanceRule.calculation}. {t("Payda sıfırsa test başarısız sayılır.")}</p>
              <p>{t("Test planı")} {acceptanceRule.sampleCount} {t("örnek ve örnek başına")} {acceptanceRule.repetitions} {t("tekrar içerir.")}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" className="arena-btn" disabled={generating} onClick={() => setStep("pipeline")}>{t("← Akışa Dön")}</button>
            <button type="button" className="arena-btn" disabled={generating || !benchmarkReady || approvedBenchmark === benchmarkVersion} onClick={() => setApprovedBenchmark(benchmarkVersion)}>
              {approvedBenchmark === benchmarkVersion ? t("Kriterler Onaylandı") : t("Kriterleri Onayla")}
            </button>
            <button
              type="button"
              className="arena-btn arena-btn-success"
              disabled={generating || launching || !runNames.length}
              onClick={() => void launchArena()}
            >
              {launching ? t("Başlatılıyor…") : t("▶ Arenayı Başlat")}
            </button>
            {launching && <span role="status" style={{ color: THEME.cyan }}>{launchStage || t("Deney hazırlanıyor…")}</span>}
          </div>
          {launchError && <p role="alert" style={{ color: THEME.red }}>{launchError}</p>}
        </section>
      )}
    </div>
  );
}
