"use client";

import { useState, useMemo, useEffect } from "react";
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
  monitorId: string;
  isPro: boolean;
}

type Tab = "timeline" | "daily";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function ResponseTimeGraph({ pings: initialPings, monitorId, isPro }: Props) {
  const [tab, setTab] = useState<Tab>("timeline");
  const [rangeDays, setRangeDays] = useState(7);
  const [pings, setPings] = useState<Ping[]>(initialPings);
  const [loadingRange, setLoadingRange] = useState(false);

  // When Pro user changes range, fetch new data
  useEffect(() => {
    if (rangeDays === 7) {
      setPings(initialPings);
      return;
    }
    setLoadingRange(true);
    fetch(`/api/monitors/${monitorId}/pings?days=${rangeDays}`)
      .then((r) => r.json())
      .then((data) => {
        setPings(data);
        setLoadingRange(false);
      })
      .catch(() => setLoadingRange(false));
  }, [rangeDays, monitorId, initialPings]);

  const upPings = useMemo(
    () => pings.filter((p) => p.status === "up" && p.response_time_ms !== null),
    [pings],
  );

  const minMs = upPings.length > 0 ? Math.min(...upPings.map((p) => p.response_time_ms!)) : null;
  const maxMs = upPings.length > 0 ? Math.max(...upPings.map((p) => p.response_time_ms!)) : null;
  const yAxisMax = maxMs !== null ? Math.ceil((maxMs * 1.15) / 100) * 100 : undefined;
  const avgMs =
    upPings.length > 0
      ? Math.round(upPings.reduce((a, p) => a + p.response_time_ms!, 0) / upPings.length)
      : null;

  const timelineData = useMemo(() => {
    const mapped = upPings
      .slice()
      .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())
      .map((p) => {
        const d = new Date(p.checked_at);
        return {
          ts: d.getTime(),
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
    for (let i = rangeDays - 1; i >= 0; i--) {
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
    // For 30/90 day ranges, only show every few days to avoid clutter
    if (rangeDays > 7) {
      const step = rangeDays === 30 ? 3 : 7;
      return days.filter((_, i) => i % step === 0 || i === days.length - 1);
    }
    return days;
  }, [pings, rangeDays]);

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

  const availableRanges = isPro ? RANGES : [RANGES[0]];

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

        {/* Range selector */}
        <div className="flex items-center gap-1">
          {availableRanges.map((r) => (
            <button
              key={r.days}
              onClick={() => setRangeDays(r.days)}
              className={`text-[10px] px-2 py-1 rounded-md transition-all ${
                rangeDays === r.days
                  ? "bg-[#00cc6a]/10 dark:bg-[#00ff87]/10 text-[#00cc6a] dark:text-[#00ff87] font-semibold"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {r.label}
            </button>
          ))}
          {!isPro && (
            <span
              className="text-[10px] text-neutral-600 dark:text-neutral-700 ml-1"
              style={{ fontFamily: "'DM Mono', monospace" }}
              title="30/90 day range requires Pro"
            >
              30d/90d — Pro
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      {hasData && !loadingRange && (
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
        {(["timeline", "daily"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "text-xs font-semibold text-[#00cc6a] dark:text-[#00ff87] border-b-2 border-[#00cc6a] dark:border-[#00ff87] pb-2 px-1 -mb-px transition-colors"
                : "text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 pb-2 px-1 -mb-px transition-colors border-b-2 border-transparent"
            }
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {t === "timeline" ? "Timeline" : "Daily Average"}
          </button>
        ))}
      </div>

      {/* Chart area */}
      {loadingRange ? (
        <div className="h-[200px] flex items-center justify-center">
          <svg className="w-4 h-4 animate-spin text-neutral-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : !hasData ? (
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
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
              width={52}
              domain={[0, yAxisMax ?? 'auto']}
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
              width={52}
              domain={[0, yAxisMax ?? 'auto']}
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
    </div>
  );
}
