"use client";

import { useState } from "react";

export type DayData = {
  dateStr: string;
  label: string;
  fullLabel: string;
  pings: { status: string }[];
  uptimePercent: number;
  totalChecks: number;
  downtimeMinutes: number;
};

function buildSegments(
  pings: { status: string }[],
  numSegments = 12,
): ("up" | "down" | null)[] {
  if (pings.length === 0) return Array(numSegments).fill(null);

  const segments: ("up" | "down" | null)[] = [];
  const chunkSize = pings.length / numSegments;

  for (let i = 0; i < numSegments; i++) {
    const start = Math.floor(i * chunkSize);
    const end = Math.floor((i + 1) * chunkSize);
    const chunk = pings.slice(start, end);
    if (chunk.length === 0) {
      segments.push(null);
    } else {
      const allUp = chunk.every((p) => p.status === "up");
      segments.push(allUp ? "up" : "down");
    }
  }

  return segments;
}

export default function UptimeHistory({
  days,
  overallUptimePercent,
}: {
  days: DayData[];
  overallUptimePercent: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hasData = days.some((d) => d.totalChecks > 0);

  return (
    <div className="relative bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-5 overflow-visible">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00ff87]/40 to-transparent rounded-t-2xl" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-500 font-medium"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            7-day history
          </p>
          <p
            className="text-xl font-bold text-[#080808] dark:text-white mt-0.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {hasData ? `${overallUptimePercent}%` : "—"} uptime
          </p>
        </div>
        <span
          className="text-[10px] text-neutral-400 dark:text-neutral-600 tracking-wider uppercase"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Last 7 days
        </span>
      </div>

      {!hasData ? (
        <p
          className="text-xs text-neutral-400 dark:text-neutral-500 py-8 text-center"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Not enough data yet — check back tomorrow
        </p>
      ) : (
        <div className="flex gap-1 sm:gap-1.5">
          {days.map((day, i) => {
            const segments = buildSegments(day.pings);
            const tooltipAlign =
              i === 0
                ? "left-0"
                : i >= 5
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";

            return (
              <div
                key={day.dateStr}
                className="relative flex-1"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                <div
                  className={`absolute bottom-[calc(100%+8px)] z-30 w-40 bg-[#f8f8f8] dark:bg-[#111111] border border-black/[0.1] dark:border-white/[0.1] rounded-xl px-3 py-2.5 shadow-lg pointer-events-none transition-opacity duration-150 ${tooltipAlign} ${
                    hoveredIndex === i
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                >
                  <p
                    className="text-[11px] font-semibold text-[#080808] dark:text-white mb-1.5 leading-tight"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {day.fullLabel}
                  </p>
                  {day.totalChecks === 0 ? (
                    <p
                      className="text-[10px] text-neutral-400 dark:text-neutral-500"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      No data
                    </p>
                  ) : (
                    <>
                      <p
                        className="text-[10px] text-neutral-500 dark:text-neutral-400"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        <span className="text-[#00cc6a] dark:text-[#00ff87]">
                          {day.uptimePercent}%
                        </span>{" "}
                        uptime
                      </p>
                      <p
                        className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {day.totalChecks} checks
                      </p>
                      {day.downtimeMinutes > 0 && (
                        <p
                          className="text-[10px] text-red-500 dark:text-red-400 mt-0.5"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {day.downtimeMinutes}m downtime
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Column blocks */}
                <div className="h-12 flex flex-col rounded-md overflow-hidden cursor-default gap-[1px]">
                  {segments.map((seg, j) => (
                    <div
                      key={j}
                      className="flex-1"
                      style={{
                        backgroundColor:
                          seg === "up"
                            ? "#00cc6a"
                            : seg === "down"
                              ? "#ef4444"
                              : undefined,
                      }}
                      // dark mode handled via style — both use same hex but dark is brighter
                    />
                  ))}
                  {segments.every((s) => s === null) && (
                    <div className="flex-1 bg-black/[0.06] dark:bg-neutral-800 rounded-md" />
                  )}
                </div>

                {/* Day label */}
                <p
                  className="text-[9px] sm:text-[10px] text-center text-neutral-400 dark:text-neutral-600 mt-1.5 truncate"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {day.label}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
