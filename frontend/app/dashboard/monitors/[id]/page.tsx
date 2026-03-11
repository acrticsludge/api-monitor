export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";
import CheckNowButton from "./CheckNowButton";
import ThemeToggle from "../../../../components/ThemeToggle";
import EditMonitorModal from "../../../../components/EditMonitorModal";
import UptimeHistory from "./UptimeHistory";
import ResponseTimeGraph from "./ResponseTimeGraph";
import LocalTime from "../../../../components/LocalTime";
import HealthBadge from "../../../../components/HealthBadge";
import { calculateHealthScore } from "../../../lib/healthScore";

function responseTimeColor(ms: number | null): string {
  if (ms === null) return "text-neutral-400 dark:text-neutral-600";
  if (ms < 300) return "text-[#00cc6a] dark:text-[#00ff87]";
  if (ms < 1000) return "text-yellow-500 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: monitor } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  const { data: pings } = await supabase
    .from("pings")
    .select("id, status, status_code, response_time_ms, checked_at")
    .eq("monitor_id", id)
    .order("checked_at", { ascending: false })
    .limit(100);

  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, type, sent_at, status_code, response_time_ms, downtime_minutes")
    .eq("monitor_id", id)
    .order("sent_at", { ascending: false })
    .limit(20);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data: anomalyAlerts } = await supabase
    .from("anomaly_alerts")
    .select("id, type, baseline_ms, current_avg_ms, triggered_at")
    .eq("monitor_id", id)
    .gte("triggered_at", oneDayAgo.toISOString())
    .order("triggered_at", { ascending: false });

  const graphSevenDaysAgo = new Date();
  graphSevenDaysAgo.setDate(graphSevenDaysAgo.getDate() - 7);

  const { data: graphPings } = await supabase
    .from("pings")
    .select("status, response_time_ms, checked_at")
    .eq("monitor_id", id)
    .gte("checked_at", graphSevenDaysAgo.toISOString())
    .order("checked_at", { ascending: true })
    .limit(2000);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: weekPings } = await supabase
    .from("pings")
    .select("status, checked_at")
    .eq("monitor_id", id)
    .gte("checked_at", sevenDaysAgo.toISOString())
    .order("checked_at", { ascending: true })
    .limit(2500);

  const pingList = pings ?? [];
  const upCount = pingList.filter((p) => p.status === "up").length;
  const uptimePct =
    pingList.length > 0 ? Math.round((upCount / pingList.length) * 100) : 100;
  const latestPing = pingList[0];
  const recentPings = pingList.slice(0, 20);
  const health = calculateHealthScore(recentPings);

  const avgResponse =
    pingList.length > 0
      ? Math.round(
          pingList
            .filter((p) => p.response_time_ms != null)
            .reduce((acc, p) => acc + (p.response_time_ms ?? 0), 0) /
            pingList.filter((p) => p.response_time_ms != null).length,
        )
      : null;

  return (
    <div
      className="min-h-screen bg-[#f8f8f8] dark:bg-[#080808] text-[#080808] dark:text-white"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,255,135,0.06),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.018] dark:opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#f8f8f8]/80 dark:bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00cc6a] dark:bg-[#00ff87] flex items-center justify-center shadow-[0_0_16px_rgba(0,204,106,0.35)] dark:shadow-[0_0_16px_rgba(0,255,135,0.35)]">
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-[#080808] dark:hover:text-white border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.16] dark:hover:border-white/[0.16] rounded-md px-3 py-1.5 transition-all duration-150 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p
              className="text-[11px] tracking-[0.14em] uppercase text-[#00cc6a] dark:text-[#00ff87] mb-1.5 font-medium"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              &gt; monitor
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#080808] dark:text-white">
              {monitor.name}
            </h1>
            <p
              className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 break-all"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {monitor.url}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!monitor.is_active && (
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 border border-black/[0.08] dark:border-white/[0.08] rounded-md px-2.5 py-1.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                PAUSED
              </span>
            )}
            <EditMonitorModal monitor={monitor} variant="button" />
            <CheckNowButton monitorId={id} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard
            label="Uptime"
            value={`${uptimePct}%`}
            sub={`${pingList.length} pings`}
            color="green"
          />
          <StatCard
            label="Status"
            value={
              latestPing ? (latestPing.status === "up" ? "UP" : "DOWN") : "—"
            }
            color={
              latestPing?.status === "up"
                ? "green"
                : latestPing?.status === "down"
                  ? "red"
                  : undefined
            }
          />
          <StatCard
            label="Last Response"
            value={
              latestPing?.response_time_ms != null
                ? `${latestPing.response_time_ms}`
                : "—"
            }
            sub={latestPing?.response_time_ms != null ? "ms" : undefined}
            responseMs={latestPing?.response_time_ms ?? null}
          />
          <StatCard
            label="Avg Response"
            value={avgResponse != null ? `${avgResponse}` : "—"}
            sub={avgResponse != null ? "ms" : undefined}
            responseMs={avgResponse}
          />
          <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-4 py-4 hover:border-black/[0.1] dark:hover:border-white/[0.1] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none col-span-2 sm:col-span-1">
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500 mb-2"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Health Score
            </p>
            <HealthBadge
              score={health.score}
              label={health.label}
              reasons={health.reasons}
              size="md"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Method", value: monitor.method || "GET" },
            {
              label: "Expected Status",
              value: String(monitor.expected_status_code || 200),
            },
            {
              label: "Interval",
              value: `${monitor.check_interval_minutes ?? "—"}m`,
            },
            {
              label: "Added",
              value: new Date(monitor.created_at).toLocaleDateString(),
            },
            {
              label: "Webhook",
              value: monitor.webhook_url
                ? monitor.webhook_url.replace(/^https?:\/\//, "").slice(0, 28) +
                  (monitor.webhook_url.length > 35 ? "…" : "")
                : "Not configured",
              valueClass: monitor.webhook_url
                ? "text-[#00cc6a] dark:text-[#00ff87]"
                : "text-neutral-400 dark:text-neutral-600",
            },
          ].map(({ label, value, valueClass }) => (
            <div key={label}>
              <p
                className="text-[10px] tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-500 mb-1.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {label}
              </p>
              <p
                className={`text-sm font-medium ${valueClass ?? "text-neutral-700 dark:text-neutral-200"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500 whitespace-nowrap"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Uptime
            </p>
            <p
              className="text-[10px] text-neutral-400 dark:text-neutral-600"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Last {pingList.length} checks
            </p>
          </div>
          <div className="flex-1 h-1.5 bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00cc6a] dark:bg-[#00ff87] rounded-full shadow-[0_0_8px_rgba(0,204,106,0.4)] dark:shadow-[0_0_8px_rgba(0,255,135,0.5)] transition-all duration-700"
              style={{ width: `${uptimePct}%` }}
            />
          </div>
          <p
            className="text-sm font-bold text-[#00cc6a] dark:text-[#00ff87] tabular-nums"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {uptimePct}%
          </p>
        </div>

        <UptimeHistory pings={weekPings ?? []} />

        <ResponseTimeGraph pings={graphPings ?? []} monitorName={monitor.name} />

        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Ping History
            </p>
            <p className="text-sm font-semibold text-[#080808] dark:text-white mt-0.5">
              Last {recentPings.length} checks
            </p>
          </div>

          {recentPings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p
                className="text-xs text-neutral-400 dark:text-neutral-500"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                No pings yet — worker will check this on its next cycle.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="sm:hidden divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {recentPings.map((ping) => (
                  <div
                    key={ping.id}
                    className="px-4 py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      {ping.status === "up" ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00cc6a] dark:text-[#00ff87] mb-1"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00cc6a] dark:bg-[#00ff87]" />
                          UP
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-500 dark:text-red-400 mb-1"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                          DOWN
                        </span>
                      )}
                      <p
                        className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        <LocalTime iso={ping.checked_at} />
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-semibold tabular-nums ${responseTimeColor(ping.response_time_ms)}`}
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {ping.response_time_ms != null
                          ? `${ping.response_time_ms}ms`
                          : "—"}
                      </p>
                      <p
                        className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {ping.status_code ?? "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                      {[
                        "Checked At",
                        "Status",
                        "Response Time",
                        "Status Code",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-500"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentPings.map((ping) => (
                      <tr
                        key={ping.id}
                        className="border-b border-black/[0.03] dark:border-white/[0.03] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td
                          className="px-5 py-3 text-xs text-neutral-500 dark:text-neutral-400"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          <LocalTime iso={ping.checked_at} />
                        </td>
                        <td className="px-5 py-3">
                          {ping.status === "up" ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00cc6a] dark:text-[#00ff87]"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00cc6a] dark:bg-[#00ff87]" />
                              UP
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-500 dark:text-red-400"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                              DOWN
                            </span>
                          )}
                        </td>
                        <td
                          className={`px-5 py-3 text-xs font-medium ${responseTimeColor(ping.response_time_ms)}`}
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {ping.response_time_ms != null
                            ? `${ping.response_time_ms}ms`
                            : "—"}
                        </td>
                        <td
                          className="px-5 py-3 text-xs text-neutral-500 dark:text-neutral-400"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {ping.status_code ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
          <span
            className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 whitespace-nowrap"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Incidents
          </span>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Incidents
            </p>
            <p className="text-sm font-semibold text-[#080808] dark:text-white mt-0.5">
              Alert history
            </p>
          </div>

          {(() => {
            type IncidentItem =
              | { kind: "alert"; id: string; type: string; ts: string; status_code: number | null; response_time_ms: number | null; downtime_minutes: number | null }
              | { kind: "anomaly"; id: string; baseline_ms: number; current_avg_ms: number; ts: string };

            const items: IncidentItem[] = [
              ...(alerts ?? []).map((a) => ({ kind: "alert" as const, id: a.id, type: a.type, ts: a.sent_at, status_code: a.status_code ?? null, response_time_ms: a.response_time_ms ?? null, downtime_minutes: a.downtime_minutes ?? null })),
              ...(anomalyAlerts ?? []).map((a) => ({ kind: "anomaly" as const, id: a.id, baseline_ms: a.baseline_ms, current_avg_ms: a.current_avg_ms, ts: a.triggered_at })),
            ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

            if (items.length === 0) {
              return (
                <div className="px-5 py-12 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#00cc6a]/[0.06] dark:bg-[#00ff87]/[0.06] border border-[#00cc6a]/10 dark:border-[#00ff87]/10 mb-3">
                    <svg
                      className="w-5 h-5 text-[#00cc6a] dark:text-[#00ff87]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p
                    className="text-xs text-neutral-600 dark:text-neutral-400 font-medium"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    All clear — no incidents recorded
                  </p>
                  <p
                    className="text-[11px] text-neutral-400 dark:text-neutral-700 mt-1"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    Incidents appear here when a monitor goes down or recovers
                  </p>
                </div>
              );
            }

            return (
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {items.map((item) =>
                  item.kind === "alert" ? (
                    <div
                      key={item.id}
                      className="px-5 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.type === "down" ? "bg-red-500 dark:bg-red-400" : "bg-[#00cc6a] dark:bg-[#00ff87]"}`} />
                            <span
                              className={`text-xs font-medium ${item.type === "down" ? "text-red-500 dark:text-red-400" : "text-[#00cc6a] dark:text-[#00ff87]"}`}
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {item.type === "down" ? "Down" : "Recovered"}
                            </span>
                          </div>
                          <span
                            className="text-xs text-neutral-500 dark:text-neutral-600 shrink-0"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {new Date(item.ts).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 pl-3.5 flex-wrap">
                          {item.status_code ? (
                            <StatusCodeBadge code={item.status_code} />
                          ) : item.type === "down" ? (
                            <span
                              className="text-neutral-500 dark:text-neutral-500 text-[11px]"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              No response · Connection timeout
                            </span>
                          ) : null}
                          {item.response_time_ms && (
                            <span
                              className="text-neutral-500 dark:text-neutral-500 text-[11px]"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {item.response_time_ms}ms
                            </span>
                          )}
                          {item.type === "recovered" && item.downtime_minutes && (
                            <span
                              className="text-neutral-500 dark:text-neutral-500 text-[11px]"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              · Down for {item.downtime_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={item.id}
                      className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                        <div>
                          <span
                            className="text-xs font-semibold text-yellow-400"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            ⚠️ DEGRADATION
                          </span>
                          <span
                            className="text-xs text-neutral-400 dark:text-neutral-500 ml-2"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {item.current_avg_ms}ms avg ({Math.round(item.current_avg_ms / item.baseline_ms)}x baseline)
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-xs text-neutral-500 dark:text-neutral-400"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {new Date(item.ts).toLocaleString()}
                      </span>
                    </div>
                  )
                )}
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}

const STATUS_CODE_MEANINGS: Record<number, string> = {
  400: "Bad Request — malformed request syntax",
  401: "Unauthorized — authentication required",
  403: "Forbidden — server refused the request",
  404: "Not Found — endpoint does not exist",
  408: "Request Timeout — server timed out waiting",
  429: "Too Many Requests — rate limited",
  500: "Internal Server Error — server crashed",
  502: "Bad Gateway — invalid response from upstream",
  503: "Service Unavailable — server overloaded or down",
  504: "Gateway Timeout — upstream server timed out",
};

function StatusCodeBadge({ code }: { code: number }) {
  const meaning = STATUS_CODE_MEANINGS[code];
  const isError = code >= 400;

  return (
    <div className="relative group inline-flex">
      <span
        className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
          isError
            ? "bg-red-400/10 text-red-500 dark:text-red-400 border border-red-400/20"
            : "bg-[#00cc6a]/10 dark:bg-[#00ff87]/10 text-[#00cc6a] dark:text-[#00ff87] border border-[#00cc6a]/20 dark:border-[#00ff87]/20"
        }`}
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {code}
      </span>
      {meaning && (
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-10 w-56">
          <div
            className="bg-white dark:bg-[#111111] border border-black/8 dark:border-white/8 rounded-xl px-3 py-2 shadow-lg"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">{meaning}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  responseMs,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "green" | "red";
  responseMs?: number | null;
}) {
  const valueColor =
    responseMs != null
      ? responseMs < 300
        ? "text-[#00cc6a] dark:text-[#00ff87]"
        : responseMs < 1000
          ? "text-yellow-500 dark:text-yellow-400"
          : "text-red-500 dark:text-red-400"
      : color === "green"
        ? "text-[#00cc6a] dark:text-[#00ff87]"
        : color === "red"
          ? "text-red-500 dark:text-red-400"
          : "text-[#080808] dark:text-white";

  return (
    <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-4 py-4 hover:border-black/[0.1] dark:hover:border-white/[0.1] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
      <p
        className="text-[10px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500 mb-2"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </p>
      <p className={`text-3xl font-extrabold tabular-nums ${valueColor}`}>
        {value}
      </p>
      {sub && (
        <p
          className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
