import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FRAMEWORKS_DATA, THEME } from "../data/mockData";
import { PageHeader } from "../components/UI";
import { SuccessTestFlow } from "../components/SuccessTestFlow";
import { TaskQuestionnaire, type TaskQuestion } from "../components/TaskQuestionnaire";
import { TaskFlowEditor } from "../components/TaskFlowEditor";
import { flowContext, makeTaskFlow, type TaskFlow } from "../components/taskFlow";
import { FRAMEWORK_PIPELINES } from "../data/frameworkRuns";
import { ApiError, FRAMEWORK_IDS, post, rememberExperiment } from "../api/client";
import { BENCHMARK_QUESTIONS, CLARIFICATION_QUESTIONS, METRIC_DEFINITIONS } from "../data/taskQuestions";

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
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("prompt");
  const [objective, setObjective] = useState("");
  const [flow, setFlow] = useState<TaskFlow>({ blocks: [], edges: [] });
  const [scopeQuestions, setScopeQuestions] = useState<readonly TaskQuestion[]>([]);
  const [benchmarkQuestions, setBenchmarkQuestions] = useState<readonly TaskQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [approvedBenchmark, setApprovedBenchmark] = useState("");
  const [benchmarkContext, setBenchmarkContext] = useState("");
  const [scopeContext, setScopeContext] = useState("");
  const [selectedFw, setSelectedFw] = useState(FRAMEWORKS_DATA[0]?.name ?? "");
  const [clarification, setClarification] = useState<string[]>([]);
  const [benchmark, setBenchmark] = useState<string[]>([]);
  const [scopeInstruction, setScopeInstruction] = useState("");
  const [benchmarkInstruction, setBenchmarkInstruction] = useState("");
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [runNames, setRunNames] = useState<string[]>(() => FRAMEWORKS_DATA.map(({ name }) => name));
  const [builtInNotice, setBuiltInNotice] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");

  const activeStep = TASK_STEPS.findIndex(({ key }) => key === step);
  const nodes = flow.blocks.map(({ label }) => label);
  const taskFlow = flowContext(flow);
  const clarified = scopeQuestions.length === 10 && scopeQuestions.every((_, index) => Boolean(clarification[index]));
  const scopeNeedsRefresh = !demoLoaded && scopeQuestions.length > 0
    && scopeContext !== JSON.stringify([objective.trim(), taskFlow]);
  const benchmarkReady = benchmarkQuestions.length === 10 && benchmarkQuestions.every((_, index) => Boolean(benchmark[index]));
  const framework = FRAMEWORKS_DATA.find(({ name }) => name === selectedFw);
  const pipeline = FRAMEWORK_PIPELINES[selectedFw];
  const scope = scopeQuestions.map(([question], index) => ({ question, answer: clarification[index] }));
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
    source: benchmark[0],
    scenarios: benchmark[1],
    testCount: benchmark[2],
    reference: benchmark[3],
    hardGate: benchmark[6],
    repetitions: benchmark[7],
    measurements: benchmark[8],
    reporting: benchmark[9],
    instruction: benchmarkInstruction,
  };
  const successCriteria = {
    metric: benchmark[4] ?? "",
    threshold: benchmark[5] ?? "",
    verification: benchmark[3] ?? "",
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
        body: JSON.stringify({
          mode,
          objective: submittedObjective,
          nodes,
          graph: taskFlow,
          instruction,
          context: [
            ...scope.filter(({ answer }) => answer).map(({ question, answer }) => `${question} ${answer}`),
            ...(mode === "benchmark"
              ? [scopeInstruction, `${selectedFw}: ${pipeline?.nodes.join(" → ") ?? ""}`, ...benchmarkQuestions.flatMap(([question], index) => benchmark[index] ? [`${question} ${benchmark[index]}`] : [])].filter(Boolean)
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
        throw new Error(typeof draft?.detail === "string" ? draft.detail : "Tasarım isteği tamamlanamadı.");
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
        ? "Görev tasarımı API’sine bağlanılamadı."
        : error instanceof Error ? error.message : "Tasarım oluşturulamadı.");
    } finally {
      setGenerating(false);
    }
  }

  async function launchArena() {
    if (launching || !runNames.length) return;
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
      const project = await post<{ id: string }>("/v1/projects", { name: objective.trim().slice(0, 80) || "Görev" });
      const spec = await post<{ id: string; spec_hash: string }>(`/v1/projects/${project.id}/specs`, { task_data: taskData });
      await post(`/v1/specs/${spec.id}/approve?expected_hash=${encodeURIComponent(spec.spec_hash)}`);
      const experiment = await post<{ id: string }>("/v1/experiments", { spec_id: spec.id });
      await post(`/v1/experiments/${experiment.id}/build`);
      await post(`/v1/experiments/${experiment.id}/run`);
      rememberExperiment(experiment.id);
      navigate("/execution-arena", { state: { experimentId: experiment.id } });
    } catch (error) {
      setLaunchError(error instanceof ApiError ? error.message : "Deney başlatılamadı.");
    } finally {
      setLaunching(false);
    }
  }

  function loadDemoTask() {
    setBuiltInNotice(false);
    setObjective(SAMPLE_OBJECTIVES[0]!);
    const demoFlow = makeTaskFlow(["input:Sözleşmeleri al", "llm:Tarih ve bütçe bilgilerini çıkar", "validate:Çelişkileri doğrula", "output:Kanıtlı rapor oluştur"]);
    demoFlow.edges.push({ from: demoFlow.blocks[2]!.id, to: demoFlow.blocks[1]!.id, kind: "feedback" });
    setFlow(demoFlow);
    setSelectedFw("LangGraph");
    setClarification(CLARIFICATION_QUESTIONS.map(([, option]) => option!));
    setScopeQuestions(CLARIFICATION_QUESTIONS);
    setBenchmarkQuestions(BENCHMARK_QUESTIONS);
    setBenchmark(["Etiketli örnekler", "Normal, sınır ve hata durumları", "30", "Referans cevap", "F1 skoru", "%90", "Geçersiz çıktı biçimi", "3", "Süre ve token kullanımı", "Her iki şekilde"]);
    setScopeInstruction("");
    setBenchmarkInstruction("");
    setDemoLoaded(true);
    setGenerationError("");
    setApprovedBenchmark("");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 18 }}>
      <PageHeader
        eyebrow="AŞAMA 2 · GÖREV VE PİPELINE STÜDYOSU"
        title="Görev Tanımı ve Akış Tasarımı"
        description="Önce görevi belirtin. Ardından kapsamı netleştirin, framework akışını inceleyin ve görev benchmarkını tasarlayın."
        right={<button type="button" className="arena-btn" onClick={loadDemoTask} disabled={demoLoaded || generating}>{demoLoaded ? "Demo görev yüklendi" : "Demo Görevi Yükle"}</button>}
      />

      <nav className="arena-grid-3" aria-label="Görev tasarımı adımları">
        {TASK_STEPS.map(({ key, label }, index) => (
          <button
            key={key}
            type="button"
            className={`arena-btn ${key === step ? "arena-btn-primary" : ""}`}
            aria-current={key === step ? "step" : undefined}
            disabled={generating || (!demoLoaded && index > activeStep)}
            onClick={() => {
              if (key === "criteria" && (!benchmarkQuestions.length || (!demoLoaded && benchmarkContext !== currentBenchmarkContext))) {
                void generateDesign("benchmark");
              } else {
                setStep(key);
              }
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {generationError && <p role="alert">{generationError}</p>}
      {builtInNotice && <p role="status" style={{ color: THEME.amber }}>AI sağlayıcısı yapılandırılmadığı için yerleşik akış ve soru şablonu kullanıldı. Akışı ve yanıtları düzenleyebilirsiniz.</p>}
      {generating && <p role="status">AI taslağı hazırlanıyor…</p>}

      {step === "prompt" && (
        <>
        <TaskFlowEditor flow={flow} onChange={setFlow} disabled={generating} />
        <section className="arena-card arena-card-pad">
          <label htmlFor="task-objective">Framework Arena'ya ne yaptırmak istiyorsunuz?</label>
          <textarea id="task-objective" className="arena-textarea" style={{ width: "100%", margin: "10px 0" }} rows={5} maxLength={8000} disabled={generating} value={objective} onChange={(event) => setObjective(event.target.value)} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {SAMPLE_OBJECTIVES.map((sample) => (
              <button type="button" className="arena-btn" key={sample} disabled={generating} onClick={() => setObjective(sample)}>{sample.slice(0, 48)}…</button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="arena-btn arena-btn-primary" disabled={generating || objective.trim().length < 3} onClick={() => void generateDesign("scope", scopeInstruction)}>
              Promptu Gönder ve Akış Oluştur
            </button>
            <button type="button" className="arena-btn" disabled={generating || nodes.filter((node) => node.trim()).length < 2} onClick={() => void generateDesign("scope", scopeInstruction, true)}>
              Akışa Göre Soruları Oluştur
            </button>
          </div>
        </section>

        {scopeQuestions.length > 0 && (
        <section className="arena-card arena-card-pad">
          <h2 className="arena-card-title">Görevi Netleştir</h2>
          <p>{objective}</p>
          <TaskQuestionnaire
            key={JSON.stringify(scopeQuestions)}
            questions={scopeQuestions}
            answers={clarification}
            onAnswer={(index, answer) => setClarification((previous) => Object.assign([...previous], { [index]: answer }))}
            instruction={scopeInstruction}
            onInstruction={(instruction) => void generateDesign("scope", instruction, true)}
            disabled={generating}
          />
          {scopeNeedsRefresh && <p role="status">Görev veya akış değişti. Devam etmek için soruları güncelleyin.</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="button" className="arena-btn arena-btn-primary" disabled={generating || !clarified || scopeNeedsRefresh || nodes.filter((node) => node.trim()).length < 2} onClick={() => setStep("pipeline")}>Pipeline'ı Oluştur →</button>
          </div>
        </section>
        )}
        </>
      )}

      {step === "pipeline" && framework && pipeline && (
        <>
          <div className="arena-framework-detail-grid">
            <nav className="arena-card arena-card-pad" aria-label="Framework akışları" style={{ display: "grid", gap: 8 }}>
              {FRAMEWORKS_DATA.map(({ name }) => (
                <button key={name} type="button" aria-pressed={name === selectedFw} className={`arena-btn ${name === selectedFw ? "arena-btn-primary" : ""}`} onClick={() => setSelectedFw(name)}>{name}</button>
              ))}
            </nav>
            <section className="arena-card arena-card-pad">
              <h2 className="arena-card-title">{framework.name} Akış Şeması</h2>
              <ol className="task-pipeline-flow">
                {pipeline.nodes.map((node) => <li key={node}>{node}</li>)}
              </ol>
              <h3 className="arena-card-title">Framework Bilgileri</h3>
              <p>{framework.architecture} · v{framework.version}</p>
              <p>{pipeline.desc}</p>
              <details>
                <summary>Görev kapsamı ve netleştirme yanıtları</summary>
                <p>{objective}</p>
                <dl>{scope.map(({ question, answer }) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl>
                {scopeInstruction && <p>Ek kapsam talimatı: {scopeInstruction}</p>}
              </details>
              <h3 className="arena-card-title" style={{ marginTop: 16 }}>Kod İskeleti</h3>
              <pre className="arena-mono" style={{ overflowX: "auto" }}>{`import json

def run_task(execute_pipeline):
    config = json.loads(
${JSON.stringify(runConfig, null, 2).split("\n").map((line) => `        ${JSON.stringify(line + "\n")}`).join("\n")}
    )
    return execute_pipeline(config)`}</pre>
              <h3 className="arena-card-title">Çalıştırmada Ölçülecek Değerler</h3>
              <p style={{ color: THEME.muted }}>Çalışma süresi, token kullanımı ve benchmark sonucu çalıştırma sonrasında belirlenir.</p>
            </section>
          </div>
          <div>
            <button type="button" className="arena-btn arena-btn-primary" disabled={generating} onClick={() => benchmarkQuestions.length && (demoLoaded || benchmarkContext === currentBenchmarkContext) ? setStep("criteria") : void generateDesign("benchmark")}>Başarı Kriteri Tasarımı →</button>
          </div>
        </>
      )}

      {step === "criteria" && (
        <section className="arena-card arena-card-pad">
          <h2 className="arena-card-title">Görev Benchmarkı Tasarımı</h2>
          <p>{objective}</p>
          <TaskQuestionnaire
            key={JSON.stringify(benchmarkQuestions)}
            questions={benchmarkQuestions}
            answers={benchmark}
            onAnswer={(index, answer) => setBenchmark((previous) => Object.assign([...previous], { [index]: answer }))}
            instruction={benchmarkInstruction}
            onInstruction={(instruction) => void generateDesign("benchmark", instruction)}
            disabled={generating}
          />
          <SuccessTestFlow criteria={successCriteria} benchmark={benchmarkPlan} />
          <fieldset style={{ border: "none", padding: 0, margin: "16px 0 0" }}>
            <legend className="arena-card-title">Çalıştırılacak framework'ler ({runNames.length}/{FRAMEWORKS_DATA.length})</legend>
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
              <p>Kabul kuralı: {acceptanceRule.metric} ≥ %{acceptanceRule.minimumPercent}. {acceptanceRule.mandatoryFailure} görüldüğünde test başarısız sayılır.</p>
              <p>Hesaplama: {acceptanceRule.calculation}. Payda sıfırsa test başarısız sayılır.</p>
              <p>Test planı {acceptanceRule.sampleCount} örnek ve örnek başına {acceptanceRule.repetitions} tekrar içerir.</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="button" className="arena-btn" disabled={generating} onClick={() => setStep("pipeline")}>← Akışa Dön</button>
            <button type="button" className="arena-btn" disabled={generating || !benchmarkReady || approvedBenchmark === benchmarkVersion} onClick={() => setApprovedBenchmark(benchmarkVersion)}>
              {approvedBenchmark === benchmarkVersion ? "Kriterler Onaylandı" : "Kriterleri Onayla"}
            </button>
            <button
              type="button"
              className="arena-btn arena-btn-success"
              disabled={generating || launching || !runNames.length || !benchmarkReady || approvedBenchmark !== benchmarkVersion}
              onClick={() => void launchArena()}
            >
              {launching ? "Başlatılıyor…" : "▶ Arenayı Başlat"}
            </button>
          </div>
          {launchError && <p role="alert" style={{ color: THEME.red }}>{launchError}</p>}
        </section>
      )}
    </div>
  );
}
