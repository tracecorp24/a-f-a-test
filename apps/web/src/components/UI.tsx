import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { THEME } from "../data/mockData";

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  // Portalla <body>'ye taşınır: üst elementlerin stacking/konum etkisinden bağımsız.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // arka plan kaydırmasını kilitle
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);
  return createPortal(
    <div className="arena-modal-backdrop" onClick={onClose}>
      <div className={`arena-modal${wide ? " arena-modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <header className="arena-modal-head">
          <h3>{title}</h3>
          <button type="button" className="arena-btn" onClick={onClose} aria-label="Kapat">×</button>
        </header>
        <div className="arena-modal-body">{children}</div>
        <footer className="arena-modal-foot">
          <button type="button" className="arena-btn arena-btn-primary" onClick={onClose}>Kapat (Esc)</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

const GENERATION_STEPS = [
  "İstek analiz ediliyor",
  "Akış tasarlanıyor",
  "Sorular hazırlanıyor",
  "Doğrulanıyor ve kaydediliyor",
];

/** Step-by-step visible progress while the LLM prepares the draft (no dead waiting). */
export function GenerationProgress({ visible, note }: { visible: boolean; note?: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 2200);
    return () => window.clearInterval(timer);
  }, [visible]);
  if (!visible) return null;
  return (
    <section className="arena-card arena-card-pad arena-progress" role="status">
      <h2 className="arena-card-title">AI taslağı hazırlıyor…</h2>
      <ol className="arena-progress-steps">
        {GENERATION_STEPS.map((label, index) => {
          // Tek yönlü ilerleme: son adımda kalır, başa sarmaz (yanıltıcı olmasın diye)
          const activeIndex = Math.min(GENERATION_STEPS.length - 1, tick);
          const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "wait";
          return <li key={label} className="arena-progress-step" data-state={state}>{label}</li>;
        })}
      </ol>
      <p style={{ fontSize: 12, color: THEME.muted, margin: "10px 0 0" }}>
        {note ?? "Bu işlem gerçek bir model çağrısı içerir; büyük görevlerde 1-2 dakika sürebilir. Sayfayı kapatmadığın sürece işlem devam eder."}
      </p>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="arena-page-header">
      <div>
        <div className="arena-eyebrow">{eyebrow}</div>
        <h1 className="arena-page-title">{title}</h1>
        <p className="arena-page-desc">{description}</p>
      </div>
      {right && <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>{right}</div>}
    </div>
  );
}

export function KVRow({
  label,
  value,
  color,
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "9px 0",
        borderBottom: `1px solid ${THEME.lineSubtle}`,
        fontSize: 12.5,
      }}
    >
      <span style={{ color: THEME.muted }}>{label}</span>
      <strong style={{ fontWeight: 600, color: color || THEME.text }}>{value}</strong>
    </div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <div
      className="arena-card"
      style={{
        padding: "18px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            color: THEME.subtle,
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          {title}
        </div>
        <div
          className="arena-mono"
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: THEME.text,
            lineHeight: 1.15,
          }}
        >
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11.5, color: THEME.muted, marginTop: 6 }}>{subtitle}</div>
        )}
      </div>
      <svg style={{ width: 64, height: 28, flexShrink: 0 }} viewBox="0 0 72 30" aria-hidden="true">
        <path
          d="M1 25 L10 19 L19 22 L29 11 L39 15 L49 8 L59 12 L71 3"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function SvgNode({
  x,
  y,
  w,
  h,
  icon,
  title,
  sub,
  status,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  icon: string;
  title: string;
  sub: string;
  status?: "complete" | "running" | "queued";
  selected?: boolean;
  onClick?: () => void;
}) {
  const isComplete = status === "complete";
  const isRunning = status === "running";
  const strokeColor = selected
    ? THEME.cyan
    : isRunning
      ? THEME.cyan
      : isComplete
        ? "var(--accent-green)"
        : "var(--border)";
  const fillColor = selected ? "var(--bg-active)" : "var(--bg-card)";

  return (
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={selected || isRunning ? 1.8 : 1.2}
      />
      <text x={x + 14} y={y + 34} fill={THEME.cyan} fontSize={16}>
        {icon}
      </text>
      <text x={x + 35} y={y + 26} fill="var(--text-primary)" fontSize={12.5} fontWeight={600}>
        {title}
      </text>
      <text x={x + 35} y={y + 43} fill="var(--text-secondary)" fontSize={10.5}>
        {sub}
      </text>
    </g>
  );
}
