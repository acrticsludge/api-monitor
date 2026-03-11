"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface Ping {
  status: string;
  response_time_ms: number | null;
  checked_at: string;
}

interface Props {
  pings: Ping[];
  monitorName: string;
}

type Tab = "timeline" | "daily";

export default function ResponseTimeGraph({ pings, monitorName }: Props) {
  const [tab, setTab] = useState<Tab>("timeline");

  const upPings = useMemo(
    () => pings.filter((p) => p.status === "up" && p.response_time_ms !== null),
    [pings],
  );

  const minMs = upPings.length > 0 ? Math.min(...upPings.map((p) => p.response_time_ms!)) : null;
  const maxMs = upPings.length > 0 ? Math.max(...upPings.map((p) => p.response_time_ms!)) : null;
  const avgMs =
    upPings.length > 0
      ? Math.round(upPings.reduce((a, p) => a + p.response_time_ms!, 0) / upPings.length)
      : null;

  const timelineData = useMemo(() => {
    const mapped = upPings.map((p) => {
      const d = new Date(p.checked_at);
      return {
        // Numeric timestamp — unique per point, used as XAxis dataKey for accurate hover
        ts: d.getTime(),
        // Full label shown in tooltip
        fullTime: d.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        ms: p.response_time_ms!,
      };
    });
    const maxPoints = 200;
    const step = Math.ceil(mapped.length / maxPoints);
    return step <= 1 ? mapped : mapped.filter((_, i) => i % step === 0);
  }, [upPings]);

  const dailyData = useMemo(() => {
    const days: { day: string; avgMs: number | null; checks: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dayPings = pings.filter((p) => {
        const pingDate = new Date(p.checked_at);
        return (
          pingDate.toDateString() === date.toDateString() &&
          p.status === "up" &&
          p.response_time_ms !== null
        );
      });
      days.push({
        day: i === 0 ? "Today" : dateStr,
        avgMs:
          dayPings.length > 0
            ? Math.round(
                dayPings.reduce((a, b) => a + (b.response_time_ms ?? 0), 0) /
                  dayPings.length,
              )
            : null,
        checks: dayPings.length,
      });
    }
    return days;
  }, [pings]);

  const hasData = upPings.length > 0;

  const tooltipStyle = {
    backgroundColor: "#111111",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    fontFamily: "DM Mono",
    fontSize: "11px",
    color: "#d4d4d4",
  };

  const axisTickStyle = {
    fill: "#a3a3a3",
    fontSize: 10,
    fontFamily: "DM Mono",
  };

  return (
    <div className="relative bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3 sm:p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00ff87]/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-500 font-medium"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Response Time
          </p>
          <p
            className="text-lg font-bold text-[#080808] dark:text-white mt-0.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Performance Trends
          </p>
        </div>
        <span
          className="text-[10px] text-neutral-400 dark:text-neutral-600 tracking-wider uppercase"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Last 7 days
        </span>
      </div>

      {/* Stats row */}
      {hasData && (
        <div className="flex gap-5 mb-4">
          {[
            { label: "Min", value: `${minMs}ms` },
            { label: "Avg", value: `${avgMs}ms` },
            { label: "Max", value: `${maxMs}ms` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                className="text-[10px] tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-500 mb-0.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {label}
              </p>
              <p
                className="text-sm font-semibold text-[#080808] dark:text-neutral-200 tabular-nums"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex gap-4 mb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
        <button
          onClick={() => setTab("timeline")}
          className={
            tab === "timeline"
              ? "text-xs font-semibold text-[#00cc6a] dark:text-[#00ff87] border-b-2 border-[#00cc6a] dark:border-[#00ff87] pb-2 px-1 -mb-px transition-colors"
              : "text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 pb-2 px-1 -mb-px transition-colors border-b-2 border-transparent"
          }
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Timeline
        </button>
        <button
          onClick={() => setTab("daily")}
          className={
            tab === "daily"
              ? "text-xs font-semibold text-[#00cc6a] dark:text-[#00ff87] border-b-2 border-[#00cc6a] dark:border-[#00ff87] pb-2 px-1 -mb-px transition-colors"
              : "text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 pb-2 px-1 -mb-px transition-colors border-b-2 border-transparent"
          }
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Daily Average
        </button>
      </div>

      {/* Chart area */}
      {!hasData ? (
        <div className="h-[200px] flex items-center justify-center">
          <p
            className="text-neutral-500 dark:text-neutral-600 text-xs"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            No data available yet — check back after a few pings
          </p>
        </div>
      ) : tab === "timeline" ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={timelineData}
            margin={{ top: 5, right: 4, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={["auto", "auto"]}
              tickFormatter={(ts) =>
                new Date(ts).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              tick={axisTickStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={48}
            />
            <YAxis
              tick={axisTickStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}ms`}
              width={36}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value}ms`, "Response time"]}
              labelFormatter={(_label, payload) =>
                payload?.[0]?.payload?.fullTime ?? _label
              }
              labelStyle={{ color: "#737373", marginBottom: "4px" }}
            />
            {avgMs !== null && (
              <ReferenceLine
                y={avgMs}
                stroke="rgba(0,255,135,0.2)"
                strokeDasharray="4 4"
                label={{
                  value: "avg",
                  fill: "#00ff87",
                  fontSize: 9,
                  fontFamily: "DM Mono",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="ms"
              stroke="#00ff87"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: "#00ff87", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={dailyData}
            margin={{ top: 5, right: 4, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={axisTickStyle}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={axisTickStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}ms`}
              width={36}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value, _name, props: any) => [
                `${value}ms avg (${props.payload?.checks ?? 0} checks)`,
                "Response time",
              ]}
              labelStyle={{ color: "#737373", marginBottom: "4px" }}
            />
            <Bar dataKey="avgMs" fill="#00ff87" opacity={0.7} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Pro tier note */}
      <p
        className="text-[10px] text-neutral-400 dark:text-neutral-700 mt-3 text-right"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        30-day history — coming with Pro tier
      </p>
    </div>
  );
}
