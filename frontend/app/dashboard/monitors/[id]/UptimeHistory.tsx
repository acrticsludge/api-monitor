"use client";

import { useState, useMemo } from "react";

interface Ping {
  status: string;
  checked_at: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

export default function UptimeHistory({ pings }: { pings: Ping[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // All date math runs in the browser's local timezone
  const days = useMemo(() => {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayMidnight);
      d.setDate(d.getDate() - (6 - i));
      const isToday = i === 6;
      const label = isToday ? "Today" : DAY_NAMES[d.getDay()];
      const fullLabel = `${FULL_DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
      const dateStr = d.toISOString().split("T")[0];

      const dayPings = pings.filter((p) => {
        const pingDay = new Date(p.checked_at);
        pingDay.setHours(0, 0, 0, 0);
        return pingDay.getTime() === d.getTime();
      });

      const totalChecks = dayPings.length;
      const upCount = dayPings.filter((p) => p.status === "up").length;
      const uptimePercent =
        totalChecks > 0 ? Math.round((upCount / totalChecks) * 100) : 0;

      let downtimeMs = 0;
      let downStartMs: number | null = null;
      for (const ping of dayPings) {
        const t = new Date(ping.checked_at).getTime();
        if (ping.status === "down" && downStartMs === null) {
          downStartMs = t;
        } else if (ping.status === "up" && downStartMs !== null) {
          downtimeMs += t - downStartMs;
          downStartMs = null;
        }
      }
      if (downStartMs !== null && dayPings.length > 0) {
        downtimeMs +=
          new Date(dayPings[dayPings.length - 1].checked_at).getTime() -
          downStartMs;
      }
      const downtimeMinutes = Math.round(downtimeMs / 60000);

      return {
        dateStr,
        label,
        fullLabel,
        pings: dayPings.map((p) => ({ status: p.status })),
        uptimePercent,
        totalChecks,
        downtimeMinutes,
      };
    });
  }, [pings]);

  const overallUptimePercent = useMemo(() => {
    const total = days.reduce((acc, d) => acc + d.totalChecks, 0);
    const up = days.reduce(
      (acc, d) => acc + d.pings.filter((p) => p.status === "up").length,
      0,
    );
    return total > 0 ? Math.round((up / total) * 100) : 100;
  }, [days]);

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
                <div className="h-12 flex flex-col rounded-md overflow-hidden cursor-default">
                  {segments.map((seg, j) => (
                    <div
                      key={j}
                      className={`flex-1 ${
                        seg === "up"
                          ? "bg-[#00cc6a] dark:bg-[#00ff87]"
                          : seg === "down"
                            ? "bg-red-500"
                            : "bg-black/[0.06] dark:bg-neutral-800"
                      }`}
                    />
                  ))}
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
