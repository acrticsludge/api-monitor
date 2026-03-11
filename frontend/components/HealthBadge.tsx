"use client";

import type { HealthLabel } from "../app/lib/healthScore";

interface HealthBadgeProps {
  score: number;
  label: HealthLabel;
  reasons: string[];
  size?: "sm" | "md";
}

function scoreColor(label: HealthLabel): string {
  if (label === "Healthy") return "text-[#00ff87]";
  if (label === "Degraded") return "text-yellow-400";
  if (label === "Critical") return "text-red-400";
  return "text-neutral-500";
}

function HealthTooltip({ reasons }: { reasons: string[] }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover/badge:block pointer-events-none">
      <div className="bg-[#111111] border border-white/[0.06] rounded-xl px-3 py-2.5 w-max max-w-[220px]">
        <ul className="space-y-1">
          {reasons.map((reason, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              <span className="text-neutral-600 shrink-0 mt-px">·</span>
              <span className="text-[11px] text-neutral-300 leading-snug">
                {reason}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HealthBadge({
  score,
  label,
  reasons,
  size = "sm",
}: HealthBadgeProps) {
  const color = scoreColor(label);
  const isNoData = label === "No Data";

  if (size === "md") {
    return (
      <div className="relative group/badge inline-block cursor-default">
        <p
          className={`text-3xl font-extrabold tabular-nums ${color}`}
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {isNoData ? "—" : `${score}/100`}
        </p>
        <p
          className={`text-xs font-semibold mt-1 ${color}`}
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {label}
        </p>
        <HealthTooltip reasons={reasons} />
      </div>
    );
  }

  return (
    <div className="relative group/badge inline-flex items-center gap-1.5 cursor-default">
      <span
        className={`text-xs font-semibold tabular-nums ${color}`}
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {isNoData ? "—" : `${score}/100`}
      </span>
      <span
        className={`text-[10px] uppercase tracking-[0.08em] font-medium ${color}`}
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </span>
      <HealthTooltip reasons={reasons} />
    </div>
  );
}
