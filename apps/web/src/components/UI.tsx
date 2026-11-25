import React from "react";
import { THEME } from "../data/mockData";

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
        ? "#2e6f5e"
        : "#2b3b4e";
  const fillColor = selected ? "#162b3d" : "#111824";

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
      <text x={x + 35} y={y + 26} fill="#f1f5f9" fontSize={12.5} fontWeight={600}>
        {title}
      </text>
      <text x={x + 35} y={y + 43} fill="#94a3b8" fontSize={10.5}>
        {sub}
      </text>
    </g>
  );
}
