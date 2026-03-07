/*
 * SQL — run these in the Supabase SQL editor before using this page:
 *
 * -- Allow public read on active monitors
 * CREATE POLICY "Public read active monitors"
 * ON monitors FOR SELECT
 * USING (is_active = true);
 *
 * -- Allow public read on pings
 * CREATE POLICY "Public read pings"
 * ON pings FOR SELECT
 * USING (true);
 */

import { createClient } from "../../lib/supabase-server";
import AutoRefresh from "./AutoRefresh";

type Ping = {
  monitor_id: string;
  status: string;
  checked_at: string;
};

function uptimeColor(pct: number): string {
  if (pct === 100) return "text-[#00ff87]";
  if (pct >= 90) return "text-yellow-400";
  return "text-red-400";
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: monitors } = await supabase
    .from("monitors")
    .select("id, name, url")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const monitorList = monitors ?? [];
  const monitorIds = monitorList.map((m) => m.id);

  const pingsByMonitor = new Map<string, Ping[]>();

  if (monitorIds.length > 0) {
    const { data: pings } = await supabase
      .from("pings")
      .select("monitor_id, status, checked_at")
      .in("monitor_id", monitorIds)
      .order("checked_at", { ascending: false })
      .limit(500);

    for (const ping of pings ?? []) {
      const list = pingsByMonitor.get(ping.monitor_id) ?? [];
      if (list.length < 100) list.push(ping);
      pingsByMonitor.set(ping.monitor_id, list);
    }
  }

  const monitorStats = monitorList.map((monitor) => {
    const pings = pingsByMonitor.get(monitor.id) ?? [];
    const latestStatus = pings[0]?.status ?? null;
    const upCount = pings.filter((p) => p.status === "up").length;
    const uptimePct =
      pings.length > 0 ? Math.round((upCount / pings.length) * 100) : null;
    return { ...monitor, latestStatus, uptimePct };
  });

  const checkedMonitors = monitorStats.filter((m) => m.latestStatus !== null);
  const downCount = monitorStats.filter(
    (m) => m.latestStatus === "down",
  ).length;
  const upCount = monitorStats.filter((m) => m.latestStatus === "up").length;

  let overallStatus: "operational" | "degraded" | "outage" | "unknown";
  if (monitorList.length === 0 || checkedMonitors.length === 0) {
    overallStatus = "unknown";
  } else if (downCount === 0) {
    overallStatus = "operational";
  } else if (downCount === checkedMonitors.length) {
    overallStatus = "outage";
  } else {
    overallStatus = "degraded";
  }

  return (
    <div
      className="min-h-screen bg-[#080808] text-white"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <AutoRefresh />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,255,135,0.06),transparent)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00ff87] flex items-center justify-center shadow-[0_0_16px_rgba(0,255,135,0.35)]">
              <svg
                className="w-3.5 h-3.5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-[0.08em] uppercase text-white">
              Pulse
            </span>
          </div>
          <p
            className="text-[11px] text-neutral-500"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Status Page
          </p>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-4">
        {/* Overall status banner */}
        {overallStatus === "operational" && (
          <div className="flex items-center gap-4 bg-[#00ff87]/[0.06] border border-[#00ff87]/20 rounded-2xl px-5 py-5">
            <div className="w-10 h-10 rounded-xl bg-[#00ff87]/10 border border-[#00ff87]/20 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#00ff87]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-[#00ff87]">
                All Systems Operational
              </p>
              <p
                className="text-xs text-neutral-500 mt-0.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                All {monitorList.length} endpoint
                {monitorList.length !== 1 ? "s" : ""} responding normally
              </p>
            </div>
          </div>
        )}

        {overallStatus === "degraded" && (
          <div className="flex items-center gap-4 bg-yellow-400/[0.06] border border-yellow-400/20 rounded-2xl px-5 py-5">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-yellow-400">
                Degraded Performance
              </p>
              <p
                className="text-xs text-neutral-500 mt-0.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {downCount} of {checkedMonitors.length} endpoints experiencing
                issues
              </p>
            </div>
          </div>
        )}

        {overallStatus === "outage" && (
          <div className="flex items-center gap-4 bg-red-400/[0.06] border border-red-400/20 rounded-2xl px-5 py-5">
            <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-red-400">Major Outage</p>
              <p
                className="text-xs text-neutral-500 mt-0.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                All endpoints are currently down
              </p>
            </div>
          </div>
        )}

        {overallStatus === "unknown" && (
          <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-5">
            <div>
              <p className="text-base font-bold text-neutral-400">
                No Data Available
              </p>
              <p
                className="text-xs text-neutral-600 mt-0.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                No active endpoints to display
              </p>
            </div>
          </div>
        )}

        {/* Summary strip */}
        {checkedMonitors.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl px-4 py-3 text-center">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Total
              </p>
              <p className="text-2xl font-extrabold text-white tabular-nums">
                {monitorList.length}
              </p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl px-4 py-3 text-center">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Online
              </p>
              <p className="text-2xl font-extrabold text-[#00ff87] tabular-nums">
                {upCount}
              </p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl px-4 py-3 text-center">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Down
              </p>
              <p
                className={`text-2xl font-extrabold tabular-nums ${downCount > 0 ? "text-red-400" : "text-neutral-600"}`}
              >
                {downCount}
              </p>
            </div>
          </div>
        )}

        {/* Monitor list */}
        {monitorStats.length > 0 && (
          <div className="bg-[#0f0f0f] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-500"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Endpoints
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {monitorList.length} monitored
              </p>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {monitorStats.map((monitor) => (
                <div
                  key={monitor.id}
                  className="px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {monitor.name}
                    </p>
                    <p
                      className="text-xs text-neutral-500 truncate mt-0.5"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {monitor.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    {monitor.uptimePct !== null && (
                      <div className="text-right hidden sm:block">
                        <p
                          className="text-[10px] tracking-[0.1em] uppercase text-neutral-600 mb-0.5"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          Uptime
                        </p>
                        <p
                          className={`text-sm font-bold tabular-nums ${uptimeColor(monitor.uptimePct)}`}
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {monitor.uptimePct}%
                        </p>
                      </div>
                    )}

                    {monitor.latestStatus === "up" ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00ff87]"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-50" />
                          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00ff87]" />
                        </span>
                        UP
                      </span>
                    ) : monitor.latestStatus === "down" ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-400"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        DOWN
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p
          className="text-center text-[10px] text-neutral-700 tracking-[0.1em] uppercase pt-4"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Powered by Pulse · Auto-refreshes every 60s
        </p>
      </main>
    </div>
  );
}
