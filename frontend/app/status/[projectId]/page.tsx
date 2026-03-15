export const revalidate = 0;
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const title = project?.name
    ? `${project.name} — Status`
    : "Service Status";

  return {
    title,
    description: project?.name
      ? `Live uptime status for ${project.name}. Check current service health and monitor availability.`
      : "Live uptime status page powered by Pulse.",
    robots: { index: false, follow: false },
    openGraph: {
      title: `${title} | Pulse`,
      description: project?.name
        ? `Live uptime status for ${project.name}.`
        : "Live uptime status page powered by Pulse.",
    },
  };
}
import AutoRefresh from "./AutoRefresh";
import ThemeToggle from "../../../components/ThemeToggle";
import HealthBadge from "../../../components/HealthBadge";
import { calculateHealthScore } from "../../lib/healthScore";

type Ping = {
  monitor_id: string;
  status: string;
  checked_at: string;
  response_time_ms: number | null;
  status_code: number | null;
};

function uptimeColor(pct: number): string {
  if (pct === 100) return "text-[#00cc6a] dark:text-[#00d294]";
  if (pct >= 90) return "text-[#f99c00] dark:text-[#f99c00]";
  return "text-[#fb2c36] dark:text-[#fb2c36]";
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  let { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .single();

  // Backwards compat: old URLs used userId as the path param
  if (!project) {
    const { data: bySlug, error: slugErr } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", projectId)
      .single();
    if (bySlug) redirect(`/status/${bySlug.id}`);

    const { data: byUser, error: userErr } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", projectId)
      .single();
    if (byUser) redirect(`/status/${byUser.id}`);

    return (
      <pre style={{ color: "white", background: "#111", padding: 20, whiteSpace: "pre-wrap" }}>
        {JSON.stringify({ projectId, slugErr: slugErr?.message, userErr: userErr?.message }, null, 2)}
      </pre>
    );
  }

  const { data: monitors } = await supabase
    .from("monitors")
    .select("id, name, url")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const monitorList = monitors ?? [];
  const monitorIds = monitorList.map((m) => m.id);

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(todayMidnight);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const pingResults = await Promise.all(
    monitorList.map((monitor) =>
      supabase
        .from("pings")
        .select("monitor_id, status, checked_at, response_time_ms, status_code")
        .eq("monitor_id", monitor.id)
        .gte("checked_at", sevenDaysAgo.toISOString())
        .order("checked_at", { ascending: false })
        .limit(2500),
    ),
  );

  const pings: Ping[] = pingResults.flatMap((r) => r.data ?? []);

  // Returns 7 days × 4 buckets (6-hour periods) per day
  function buildWeekDaySegments(monitorId: string): ("up" | "down" | null)[][] {
    const monitorPings = pings.filter((p) => p.monitor_id === monitorId);
    const BUCKETS = 4;
    const bucketMs = 86400000 / BUCKETS;

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayMidnight);
      d.setDate(d.getDate() - (6 - i));
      const dayStart = d.getTime();

      return Array.from({ length: BUCKETS }, (_, b) => {
        const bStart = dayStart + b * bucketMs;
        const bEnd = bStart + bucketMs;
        const bp = monitorPings.filter((p) => {
          const t = new Date(p.checked_at).getTime();
          return t >= bStart && t < bEnd;
        });
        if (bp.length === 0) return null;
        return bp.every((p) => p.status === "up") ? "up" : "down";
      });
    });
  }

  const monitorStats = monitorList.map((monitor) => {
    const monitorPings = pings.filter((p) => p.monitor_id === monitor.id);
    const latestStatus = monitorPings[0]?.status ?? null;
    const upCount = monitorPings.filter((p) => p.status === "up").length;
    const uptimePct =
      monitorPings.length > 0
        ? Math.round((upCount / monitorPings.length) * 100)
        : null;
    const weekDays = buildWeekDaySegments(monitor.id);
    const health = calculateHealthScore(monitorPings.slice(0, 20));
    return { ...monitor, latestStatus, uptimePct, weekDays, health };
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

  if (monitorList.length === 0) {
    return (
      <div
        className="min-h-screen bg-[#080808] flex items-center justify-center"
        style={{ fontFamily: "'Geist Mono', monospace" }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <p className="text-neutral-500 text-sm">
          No monitors found for this status page.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f8f8f8] dark:bg-[#080808] text-[#080808] dark:text-white"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      <AutoRefresh />
      <link
        href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,255,135,0.06),transparent)]" />
        <div
          className="absolute inset-0 opacity-0 dark:opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#f8f8f8]/80 dark:bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00cc6a] dark:bg-[#00d294] flex items-center justify-center shadow-[0_0_16px_rgba(0,204,106,0.35)] dark:shadow-[0_0_16px_rgba(0,255,135,0.35)]">
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
            <span className="text-sm font-bold tracking-[0.08em] uppercase text-[#080808] dark:text-white">
              Pulse
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p
              className="text-[11px] text-neutral-400 dark:text-neutral-500"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {project.name} · Status
            </p>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-4">
        {/* Overall status banner */}
        {overallStatus === "operational" && (
          <div className="flex items-center gap-4 bg-[#00cc6a]/[0.06] dark:bg-[#00d294]/[0.06] border border-[#00cc6a]/20 dark:border-[#00d294]/20 rounded-2xl px-5 py-5">
            <div className="w-10 h-10 rounded-xl bg-[#00cc6a]/10 dark:bg-[#00d294]/10 border border-[#00cc6a]/20 dark:border-[#00d294]/20 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#00cc6a] dark:text-[#00d294]"
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
              <p className="text-base font-bold text-[#00cc6a] dark:text-[#00d294]">
                All Systems Operational
              </p>
              <p
                className="text-xs text-neutral-500 mt-0.5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                All {monitorList.length} endpoint
                {monitorList.length !== 1 ? "s" : ""} responding normally
              </p>
            </div>
          </div>
        )}

        {overallStatus === "degraded" && (
          <div className="flex items-center gap-4 bg-[#f99c00]/[0.06] border border-[#f99c00]/20 rounded-2xl px-5 py-5">
            <div className="w-10 h-10 rounded-xl bg-[#f99c00]/10 border border-[#f99c00]/20 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#f99c00] dark:text-[#f99c00]"
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
              <p className="text-base font-bold text-[#f99c00] dark:text-[#f99c00]">
                Degraded Performance
              </p>
              <p
                className="text-xs text-neutral-500 mt-0.5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {downCount} of {checkedMonitors.length} endpoints experiencing
                issues
              </p>
            </div>
          </div>
        )}

        {overallStatus === "outage" && (
          <div className="flex items-center gap-4 bg-[#fb2c36]/[0.06] border border-[#fb2c36]/20 rounded-2xl px-5 py-5">
            <div className="w-10 h-10 rounded-xl bg-[#fb2c36]/10 border border-[#fb2c36]/20 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#fb2c36] dark:text-[#fb2c36]"
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
              <p className="text-base font-bold text-[#fb2c36] dark:text-[#fb2c36]">
                Major Outage
              </p>
              <p
                className="text-xs text-neutral-500 mt-0.5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                All endpoints are currently down
              </p>
            </div>
          </div>
        )}

        {overallStatus === "unknown" && (
          <div className="flex items-center gap-4 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-5 py-5">
            <div>
              <p className="text-base font-bold text-neutral-500 dark:text-neutral-400">
                No Data Available
              </p>
              <p
                className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                No active endpoints to display
              </p>
            </div>
          </div>
        )}

        {/* Summary strip */}
        {checkedMonitors.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-4 py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500 mb-1"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Total
              </p>
              <p className="text-2xl font-extrabold text-[#080808] dark:text-white tabular-nums">
                {monitorList.length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-4 py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500 mb-1"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Online
              </p>
              <p className="text-2xl font-extrabold text-[#00cc6a] dark:text-[#00d294] tabular-nums">
                {upCount}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-4 py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500 mb-1"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Down
              </p>
              <p
                className={`text-2xl font-extrabold tabular-nums ${downCount > 0 ? "text-[#fb2c36] dark:text-[#fb2c36]" : "text-neutral-400 dark:text-neutral-600"}`}
              >
                {downCount}
              </p>
            </div>
          </div>
        )}

        {/* Monitor list */}
        {monitorStats.length > 0 && (
          <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
            <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Endpoints
              </p>
              <p className="text-sm font-semibold text-[#080808] dark:text-white mt-0.5">
                {monitorList.length} monitored
              </p>
            </div>

            <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {monitorStats.map((monitor) => (
                <div
                  key={monitor.id}
                  className="px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#080808] dark:text-white truncate">
                      {monitor.name}
                    </p>
                    <p
                      className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-0.5"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                    >
                      {monitor.url}
                    </p>
                    <div className="flex gap-0.5 mt-2.5 max-w-[200px] sm:max-w-[300px]">
                      {monitor.weekDays.map((daySegs, dayIdx) => (
                        <div key={dayIdx} className="flex flex-1 gap-[1px]">
                          {daySegs.map((seg, segIdx) => (
                            <div
                              key={segIdx}
                              className={`flex-1 h-1.5 ${segIdx === 0 ? "rounded-l-sm" : ""} ${segIdx === 3 ? "rounded-r-sm" : ""} ${
                                seg === "up"
                                  ? "bg-[#00cc6a] dark:bg-[#00d294]"
                                  : seg === "down"
                                    ? "bg-[#fb2c36] dark:bg-[#fb2c36]"
                                    : "bg-black/[0.08] dark:bg-white/[0.08]"
                              }`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    {monitor.uptimePct !== null && (
                      <div className="text-right hidden sm:block">
                        <p
                          className="text-[10px] tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-600 mb-0.5"
                          style={{ fontFamily: "'Geist Mono', monospace" }}
                        >
                          Uptime
                        </p>
                        <p
                          className={`text-sm font-bold tabular-nums ${uptimeColor(monitor.uptimePct)}`}
                        >
                          {monitor.uptimePct}%
                        </p>
                      </div>
                    )}

                    <div className="hidden sm:block text-right">
                      <p
                        className="text-[10px] tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-600 mb-0.5"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        Health
                      </p>
                      <HealthBadge
                        score={monitor.health.score}
                        label={monitor.health.label}
                        reasons={monitor.health.reasons}
                        size="sm"
                      />
                    </div>

                    {monitor.latestStatus === "up" ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00cc6a] dark:text-[#00d294]"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cc6a] dark:bg-[#00d294] opacity-50" />
                          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00cc6a] dark:bg-[#00d294]" />
                        </span>
                        UP
                      </span>
                    ) : monitor.latestStatus === "down" ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#fb2c36] dark:text-[#fb2c36]"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fb2c36] dark:bg-[#fb2c36]" />
                        DOWN
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
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
          className="text-[10px] text-neutral-600 text-center mt-6"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Health scores are based on response time trends and uptime over the last 20 checks
        </p>

        <p
          className="text-center text-[10px] text-neutral-400 dark:text-neutral-700 tracking-[0.1em] uppercase pt-4"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Powered by Pulse · Auto-refreshes every 60s
        </p>
      </main>
    </div>
  );
}
