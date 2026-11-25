import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { BLOCK_LIMIT, BLOCK_TYPES, EDGE_LABELS, EDGE_LIMIT, makeBlock, type BlockType, type FlowBlock, type FlowEdge, type TaskFlow } from "./taskFlow";

const BLOCK_WIDTH = 174;
const BLOCK_HEIGHT = 68;

export function TaskFlowEditor({
  flow,
  onChange,
  disabled = false,
}: {
  flow: TaskFlow;
  onChange: (flow: TaskFlow) => void;
  disabled?: boolean;
}) {
  const markerId = useId();
  const [type, setType] = useState<BlockType>("llm");
  const [activeId, setActiveId] = useState("");
  const [source, setSource] = useState("");
  const [kind, setKind] = useState<FlowEdge["kind"]>("normal");
  const [drag, setDrag] = useState<{ id: string; startX: number; startY: number; x: number; y: number } | null>(null);
  const newlyAdded = useRef("");
  const activeBlockElement = useRef<HTMLDivElement>(null);
  const active = flow.blocks.find(({ id }) => id === activeId);
  const sourceBlock = flow.blocks.find(({ id }) => id === source);
  const width = Math.max(770, ...flow.blocks.map(({ x }) => x + BLOCK_WIDTH + 80));
  const height = Math.max(310, ...flow.blocks.map(({ y }) => y + BLOCK_HEIGHT + 100));

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

  return (
    <section className="arena-card arena-card-pad">
      <h2 className="arena-card-title">Görev Akışı</h2>
      <div className="task-block-toolbar">
        <label>
          Blok türü <select className="arena-select" value={type} disabled={disabled} onChange={(event) => setType(event.target.value as BlockType)}>
            {Object.entries(BLOCK_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
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
        }}>+ Blok Ekle</button>
        <label>
          Bağlantı türü <select className="arena-select" value={kind} disabled={disabled} onChange={(event) => setKind(event.target.value as FlowEdge["kind"])}>
            {Object.entries(EDGE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <p className="task-block-help" role="status">
        {sourceBlock ? `${sourceBlock.label} seçildi. Hedef bloğun girişine basın.` : "Bağlamak için bir bloğun çıkışına, ardından hedef bloğun girişine basın."}
        {sourceBlock && <button type="button" className="arena-btn" onClick={() => setSource("")}>İptal</button>}
      </p>
      <div className="task-block-viewport">
        <div className="task-block-canvas" style={{ width, height }}>
          <svg width={width} height={height} aria-hidden="true">
            <defs>
              <marker id={markerId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0 0 L7 3.5 L0 7 Z" fill="#7da1ba" />
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
              const color = edge.kind === "feedback" ? "#ae92f5" : edge.kind === "yes" ? "#52d8a4"
                : edge.kind === "no" || edge.kind === "error" ? "#ef8694" : "#53cbe8";
              return <path key={`${edge.from}-${edge.to}-${edge.kind}`} d={path} fill="none" stroke={color} strokeWidth="2" strokeDasharray={edge.kind === "feedback" ? "6 4" : undefined} markerEnd={`url(#${markerId})`} />;
            })}
          </svg>
          {flow.blocks.map((block) => (
            <div key={block.id} ref={block.id === activeId ? activeBlockElement : undefined} className="task-block" data-active={block.id === activeId} style={{ left: block.x, top: block.y, width: BLOCK_WIDTH, height: BLOCK_HEIGHT }}>
              <button className="task-block-port task-block-input" type="button" aria-label={`${block.label} girişine bağla`} disabled={disabled || !sourceBlock} onClick={() => connect(block.id)} />
              <button
                className="task-block-face"
                type="button"
                aria-pressed={block.id === activeId}
                onClick={() => setActiveId(block.id)}
                onPointerDown={(event) => {
                  if (disabled || event.button !== 0) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setActiveId(block.id);
                  setDrag({ id: block.id, startX: event.clientX, startY: event.clientY, x: block.x, y: block.y });
                }}
                onPointerMove={moveBlock}
                onPointerUp={() => setDrag(null)}
                onPointerCancel={() => setDrag(null)}
              >
                <small>{BLOCK_TYPES[block.type]}</small>
                <strong title={block.label}>{block.label}</strong>
              </button>
              <button className="task-block-port task-block-output" type="button" aria-label={`${block.label} çıkışından bağla`} aria-pressed={source === block.id} disabled={disabled || flow.edges.length >= EDGE_LIMIT} onClick={() => setSource(block.id)} />
            </div>
          ))}
        </div>
      </div>
      {active && (
        <div className="task-block-inspector">
          <label>Blok adı <input className="arena-input" maxLength={120} disabled={disabled} value={active.label} onChange={(event) => updateBlock(active.id, { label: event.target.value })} /></label>
          <label>Blok ayarları
            <textarea className="arena-textarea" rows={2} maxLength={500} disabled={disabled} value={active.settings} onChange={(event) => updateBlock(active.id, { settings: event.target.value })}
              placeholder={active.type === "llm" ? "Model, prompt ve beklenen çıktı" : active.type === "loop" ? "Çıkış koşulu ve azami tekrar" : "Girdi, davranış veya çıkış koşulu"} />
          </label>
          <div><button className="arena-btn" type="button" disabled={disabled} onClick={() => {
            onChange({ blocks: flow.blocks.filter(({ id }) => id !== active.id), edges: flow.edges.filter(({ from, to }) => from !== active.id && to !== active.id) });
            setActiveId("");
            if (source === active.id) setSource("");
          }}>Bloğu Sil</button></div>
        </div>
      )}
      {flow.edges.length > 0 && <details className="task-block-inspector">
        <summary>Bağlantılar ({flow.edges.length})</summary>
        <ul>
          {flow.edges.map((edge, index) => (
            <li key={`${edge.from}-${edge.to}-${edge.kind}`}>
              {flow.blocks.find(({ id }) => id === edge.from)?.label} → {flow.blocks.find(({ id }) => id === edge.to)?.label} · {EDGE_LABELS[edge.kind]}
              <button type="button" className="arena-btn" disabled={disabled} aria-label={`${index + 1}. bağlantıyı sil`} onClick={() => onChange({ ...flow, edges: flow.edges.filter((_, i) => i !== index) })}>×</button>
            </li>
          ))}
        </ul>
      </details>}
    </section>
  );
}
