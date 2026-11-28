import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { BLOCK_LIMIT, BLOCK_TYPES, EDGE_LABELS, EDGE_LIMIT, makeBlock, type BlockType, type FlowBlock, type FlowEdge, type TaskFlow } from "./taskFlow";
import { Modal } from "./UI";
import { useI18n } from "../i18n";

const BLOCK_WIDTH = 174;
const BLOCK_HEIGHT = 68;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.6;

function FlowCanvas({
  flow, zoom, disabled, markerId, activeId, source, onActivate, onConnect, onOutput, onDragStart, onDragMove, onDragEnd,
}: {
  flow: TaskFlow;
  zoom: number;
  disabled: boolean;
  markerId: string;
  activeId: string;
  source: string;
  onActivate: (id: string) => void;
  onConnect: (id: string) => void;
  onOutput: (id: string) => void;
  onDragStart?: (event: PointerEvent<HTMLButtonElement>, block: FlowBlock) => void;
  onDragMove?: (event: PointerEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
}) {
  const { t } = useI18n();
  const width = Math.max(770, ...flow.blocks.map(({ x }) => x + BLOCK_WIDTH + 80));
  const height = Math.max(310, ...flow.blocks.map(({ y }) => y + BLOCK_HEIGHT + 100));
  return (
    <div
      className="task-block-canvas"
      style={{
        width: width * zoom,
        height: height * zoom,
        // İçerik ölçeklenir; kaydırma alanı ölçeklenmiş boyuta göre hesaplanır.
      }}
    >
      <div style={{ width, height, transform: `scale(${zoom})`, transformOrigin: "top left", position: "absolute" }}>
        <svg width={width} height={height} aria-hidden="true">
          <defs>
            <marker id={markerId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0 0 L7 3.5 L0 7 Z" fill="var(--text-muted)" />
            </marker>
          </defs>
          {flow.edges.map((edge, index) => {
            const from = flow.blocks.find(({ id }) => id === edge.from);
            const to = flow.blocks.find(({ id }) => id === edge.to);
            if (!from || !to) return null;
            const startX = from.x + BLOCK_WIDTH;
            const startY = from.y + BLOCK_HEIGHT / 2;
            const endX = to.x;
            const endY = to.y + BLOCK_HEIGHT / 2;
            const middleX = (startX + endX) / 2;
            const returnY = Math.max(startY, endY) + 54 + (index % 4) * 12;
            const returning = endX < startX + 32 || edge.kind === "feedback";
            const path = returning
              ? `M${startX} ${startY} H${startX + 22} V${returnY} H${endX - 18} V${endY} H${endX - 7}`
              : `M${startX} ${startY} H${middleX} V${endY} H${endX - 7}`;
            const colorVar = edge.kind === "feedback" ? "var(--accent-purple)" : edge.kind === "yes" ? "var(--accent-green)"
              : edge.kind === "no" || edge.kind === "error" ? "var(--accent-rose)" : "var(--accent-cyan)";
            return <path key={`${edge.from}-${edge.to}-${edge.kind}`} d={path} fill="none" strokeWidth="2" strokeDasharray={edge.kind === "feedback" ? "6 4" : undefined} markerEnd={`url(#${markerId})`} style={{ stroke: colorVar }} />;
          })}
        </svg>
        {flow.blocks.map((block) => (
          <div key={block.id} className="task-block" data-active={block.id === activeId} style={{ left: block.x, top: block.y, width: BLOCK_WIDTH, height: BLOCK_HEIGHT }}>
            <button className="task-block-port task-block-input" type="button" aria-label={`${t(block.label)} ${t("girişine bağla")}`} disabled={disabled || !source} onClick={() => onConnect(block.id)} />
            <button
              className="task-block-face"
              type="button"
              aria-pressed={block.id === activeId}
              onClick={() => onActivate(block.id)}
              onPointerDown={(event) => {
                if (disabled || event.button !== 0) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                onActivate(block.id);
                onDragStart?.(event, block);
              }}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <small>{t(BLOCK_TYPES[block.type])}</small>
              <strong title={t(block.label)}>{t(block.label)}</strong>
            </button>
            <button className="task-block-port task-block-output" type="button" aria-label={`${t(block.label)} ${t("çıkışından bağla")}`} aria-pressed={source === block.id} disabled={disabled || flow.edges.length >= EDGE_LIMIT} onClick={() => onOutput(block.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskFlowEditor({
  flow,
  onChange,
  disabled = false,
}: {
  flow: TaskFlow;
  onChange: (flow: TaskFlow) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const markerId = useId();
  const [type, setType] = useState<BlockType>("llm");
  const [activeId, setActiveId] = useState("");
  const [source, setSource] = useState("");
  const [kind, setKind] = useState<FlowEdge["kind"]>("normal");
  const [drag, setDrag] = useState<{ id: string; startX: number; startY: number; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [fitRequested, setFitRequested] = useState(false);
  const [wideOpen, setWideOpen] = useState(false);
  const newlyAdded = useRef("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeBlockElement = useRef<HTMLDivElement>(null);
  const active = flow.blocks.find(({ id }) => id === activeId);
  const sourceBlock = flow.blocks.find(({ id }) => id === source);
  const canvasWidth = Math.max(770, ...flow.blocks.map(({ x }) => x + BLOCK_WIDTH + 80));
  const canvasHeight = Math.max(310, ...flow.blocks.map(({ y }) => y + BLOCK_HEIGHT + 100));

  // "Sığdır": tüm akışı pencereye sığdıran ölçeği hesapla ve uygula
  useEffect(() => {
    if (!fitRequested) return;
    const viewport = viewportRef.current;
    if (viewport) {
      const scaleX = (viewport.clientWidth - 24) / canvasWidth;
      const scaleY = (viewport.clientHeight - 24) / canvasHeight;
      setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(scaleX, scaleY))));
    }
    setFitRequested(false);
  }, [fitRequested, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (newlyAdded.current && newlyAdded.current === activeId) {
      activeBlockElement.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
      newlyAdded.current = "";
    }
  }, [activeId]);

  function updateBlock(id: string, changes: Partial<FlowBlock>) {
    onChange({ ...flow, blocks: flow.blocks.map((block) => block.id === id ? { ...block, ...changes } : block) });
  }

  function connect(to: string) {
    if (!sourceBlock || flow.edges.length >= EDGE_LIMIT || (source === to && kind !== "feedback") ||
        flow.edges.some((edge) => edge.from === source && edge.to === to && edge.kind === kind)) return;
    onChange({ ...flow, edges: [...flow.edges, { from: source, to, kind }] });
    setSource("");
  }

  function moveBlock(event: PointerEvent<HTMLButtonElement>) {
    if (!drag || disabled) return;
    updateBlock(drag.id, {
      x: Math.min(3000, Math.max(24, drag.x + event.clientX - drag.startX)),
      y: Math.min(1800, Math.max(12, drag.y + event.clientY - drag.startY)),
    });
  }

  const zoomControls = (
    <div className="task-zoom-bar">
      <button type="button" className="arena-btn" disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - 0.1) * 10) / 10))}>− {t("Uzaklaş")}</button>
      <span className="task-zoom-value">%{Math.round(zoom * 100)}</span>
      <button type="button" className="arena-btn" disabled={zoom >= MAX_ZOOM} onClick={() => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + 0.1) * 10) / 10))}>+ {t("Yaklaş")}</button>
      <button type="button" className="arena-btn" onClick={() => setFitRequested(true)}>{t("Sığdır")}</button>
      <button type="button" className="arena-btn" onClick={() => setZoom(1)}>{t("Gerçek Boyut")}</button>
      <button type="button" className="arena-btn arena-btn-primary" onClick={() => setWideOpen(true)}>{t("⤢ Geniş Görünüm")}</button>
    </div>
  );

  return (
    <section className="arena-card arena-card-pad">
      <h2 className="arena-card-title">{t("Görev Akışı")}</h2>
      <div className="task-block-toolbar">
        <label>
          {t("Blok türü")} <select className="arena-select" value={type} disabled={disabled} onChange={(event) => setType(event.target.value as BlockType)}>
            {Object.entries(BLOCK_TYPES).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
          </select>
        </label>
        <button type="button" className="arena-btn" disabled={disabled || flow.blocks.length >= BLOCK_LIMIT} onClick={() => {
          const block = makeBlock(type, flow.blocks.length);
          while (flow.blocks.some(({ x, y }) => Math.abs(block.x - x) < BLOCK_WIDTH + 20 && Math.abs(block.y - y) < BLOCK_HEIGHT + 20)) {
            block.y += 156;
          }
          newlyAdded.current = block.id;
          onChange({ ...flow, blocks: [...flow.blocks, block] });
          setActiveId(block.id);
        }}>+ {t("Blok Ekle")}</button>
        <label>
          {t("Bağlantı türü")} <select className="arena-select" value={kind} disabled={disabled} onChange={(event) => setKind(event.target.value as FlowEdge["kind"])}>
            {Object.entries(EDGE_LABELS).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
          </select>
        </label>
      </div>
      <p className="task-block-help" role="status">
        {sourceBlock ? `${t(sourceBlock.label)} ${t("seçildi. Hedef bloğun girişine basın.")}` : t("Bağlamak için bir bloğun çıkışına, ardından hedef bloğun girişine basın.")}
        {sourceBlock && <button type="button" className="arena-btn" onClick={() => setSource("")}>{t("İptal")}</button>}
      </p>
      {zoomControls}
      <div className="task-block-viewport" ref={viewportRef}>
        <FlowCanvas
          flow={flow}
          zoom={zoom}
          disabled={disabled}
          markerId={markerId}
          activeId={activeId}
          source={source}
          onActivate={setActiveId}
          onConnect={connect}
          onOutput={setSource}
          onDragStart={(event, block) => setDrag({ id: block.id, startX: event.clientX, startY: event.clientY, x: block.x, y: block.y })}
          onDragMove={moveBlock}
          onDragEnd={() => setDrag(null)}
        />
      </div>
      {active && (
        <div className="task-block-inspector">
          <label>{t("Blok adı")} <input className="arena-input" maxLength={120} disabled={disabled} value={active.label} onChange={(event) => updateBlock(active.id, { label: event.target.value })} /></label>
          <label>{t("Blok ayarları")}
            <textarea className="arena-textarea" rows={2} maxLength={500} disabled={disabled} value={active.settings} onChange={(event) => updateBlock(active.id, { settings: event.target.value })}
              placeholder={active.type === "llm" ? t("Model, prompt ve beklenen çıktı") : active.type === "loop" ? t("Çıkış koşulu ve azami tekrar") : t("Girdi, davranış veya çıkış koşulu")} />
          </label>
          <div><button className="arena-btn" type="button" disabled={disabled} onClick={() => {
            onChange({ blocks: flow.blocks.filter(({ id }) => id !== active.id), edges: flow.edges.filter(({ from, to }) => from !== active.id && to !== active.id) });
            setActiveId("");
            if (source === active.id) setSource("");
          }}>{t("Bloğu Sil")}</button></div>
        </div>
      )}
      {flow.edges.length > 0 && <details className="task-block-inspector">
        <summary>{t("Bağlantılar")} ({flow.edges.length})</summary>
        <ul>
          {flow.edges.map((edge, index) => (
            <li key={`${edge.from}-${edge.to}-${edge.kind}`}>
              {t(flow.blocks.find(({ id }) => id === edge.from)?.label ?? "")} → {t(flow.blocks.find(({ id }) => id === edge.to)?.label ?? "")} · {t(EDGE_LABELS[edge.kind])}
              <button type="button" className="arena-btn" disabled={disabled} aria-label={`${index + 1}. ${t("bağlantıyı sil")}`} onClick={() => onChange({ ...flow, edges: flow.edges.filter((_, i) => i !== index) })}>×</button>
            </li>
          ))}
        </ul>
      </details>}

      <Modal wide title={t("Akış — Geniş Görünüm")} onClose={() => setWideOpen(false)}>
        <FlowCanvas
          flow={flow}
          zoom={0.72}
          disabled
          markerId={`${markerId}-wide`}
          activeId={activeId}
          source=""
          onActivate={() => undefined}
          onConnect={() => undefined}
          onOutput={() => undefined}
        />
        <p className="task-block-help" style={{ marginTop: 10 }}>{t("Geniş görünüm salt okunurdur; düzenlemek için kapatıp ana tuvali kullanın.")}</p>
      </Modal>
    </section>
  );
}
