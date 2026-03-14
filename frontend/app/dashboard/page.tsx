import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { logout } from "../auth/actions";
import { deleteMonitor, toggleMonitor } from "./actions";
import AddMonitorForm from "./AddMonitorForm";
import EditMonitorModal from "../../components/EditMonitorModal";
import StatusPageLink from "./StatusPageLink";
import ProjectHeader from "./ProjectHeader";
import ProjectTabs from "./ProjectTabs";
import ThemeToggle from "../../components/ThemeToggle";
import NotificationBell from "../../components/NotificationBell";
import LocalTime from "../../components/LocalTime";
import HealthBadge from "../../components/HealthBadge";
import { calculateHealthScore } from "../lib/healthScore";
import { getIsPro } from "../lib/isPro";

type Monitor = {
  id: string;
  name: string;
  url: string;
  method: string | null;
  expected_status_code: number | null;
  check_interval_minutes: number | null;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  custom_headers: Record<string, string> | null;
  auth_type: string | null;
  response_validation: { path: string; operator: string; expected: string } | null;
  check_ssl: boolean | null;
  custom_body: string | null;
};

type Ping = {
  monitor_id: string;
  status: string;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [isPro, { project: activeProjectParam }] = await Promise.all([
    getIsPro(),
    searchParams,
  ]);

  // Fetch all projects for tabs
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const projectList = projects ?? [];

  // Determine active project
  const activeProject =
    (activeProjectParam
      ? projectList.find((p) => p.id === activeProjectParam)
      : null) ?? projectList[0];

  const { data: monitors } = await supabase
    .from("monitors")
    .select(
      "id, name, url, method, expected_status_code, check_interval_minutes, webhook_url, is_active, created_at, custom_headers, auth_type, response_validation, check_ssl, custom_body",
    )
    .eq("project_id", activeProject?.id ?? "")
    .order("created_at", { ascending: false });

  const monitorList: Monitor[] = monitors ?? [];
  const monitorIds = monitorList.map((m) => m.id);
  const latestPings = new Map<string, Ping>();
  const healthPingsMap = new Map<string, Ping[]>();

  if (monitorIds.length > 0) {
    const { data: pings } = await supabase
      .from("pings")
      .select("monitor_id, status, status_code, response_time_ms, checked_at")
      .in("monitor_id", monitorIds)
      .order("checked_at", { ascending: false })
      .limit(500);

    for (const ping of pings ?? []) {
      if (!latestPings.has(ping.monitor_id)) {
        latestPings.set(ping.monitor_id, ping);
      }
      if (!healthPingsMap.has(ping.monitor_id)) {
        healthPingsMap.set(ping.monitor_id, []);
      }
      const arr = healthPingsMap.get(ping.monitor_id)!;
      if (arr.length < 20) arr.push(ping);
    }
  }

  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

  const { data: anomalies } =
    monitorIds.length > 0
      ? await supabase
          .from("anomaly_alerts")
          .select(
            "id, monitor_id, baseline_ms, current_avg_ms, triggered_at, monitors(name)",
          )
          .gte("triggered_at", twoHoursAgo.toISOString())
          .order("triggered_at", { ascending: false })
      : { data: null };

  const upCount = monitorList.filter(
    (m) => latestPings.get(m.id)?.status === "up",
  ).length;
  const downCount = monitorList.filter(
    (m) => latestPings.get(m.id)?.status === "down",
  ).length;
  const pendingCount = monitorList.length - upCount - downCount;
  const uptimePct =
    monitorList.length > 0
      ? Math.round((upCount / monitorList.length) * 100)
      : 100;

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
            <div className="w-7 h-7 rounded-lg bg-[#00cc6a] dark:bg-[#00ff87] flex items-center justify-center shadow-[0_0_16px_rgba(0,204,106,0.3)] dark:shadow-[0_0_16px_rgba(0,255,135,0.35)]">
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
            {isPro && (
              <span
                className="hidden sm:inline-flex items-center text-[10px] font-semibold tracking-[0.08em] uppercase text-[#00cc6a] dark:text-[#00ff87] border border-[#00cc6a]/30 dark:border-[#00ff87]/30 rounded-md px-2 py-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Pro
              </span>
            )}
            <Link
              href="/pricing"
              className="hidden sm:block text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-[#080808] dark:hover:text-white transition-colors duration-150"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="hidden sm:block text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-[#080808] dark:hover:text-white transition-colors duration-150"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Docs
            </Link>
            <span
              className="hidden sm:block text-xs text-neutral-500 dark:text-neutral-400"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {user.email}
            </span>
            <ThemeToggle />
            <NotificationBell userId={user.id} />
            <form action={logout}>
              <button
                type="submit"
                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 border border-black/[0.08] dark:border-white/[0.08] rounded-md px-3 py-1.5 hover:text-[#080808] dark:hover:text-white hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-150"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        {activeProject && <ProjectHeader project={activeProject} />}

        {/* Project tabs — always shown; Add project only for Pro */}
        <ProjectTabs
          projects={projectList}
          activeProjectId={activeProject?.id ?? ""}
          isPro={isPro}
        />

        <div className="mb-6">
          <p
            className="text-[11px] tracking-[0.14em] uppercase text-[#00cc6a] dark:text-[#00ff87] mb-2 font-medium"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            &gt; overview
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#080808] dark:text-white">
            Your Monitors
          </h1>
          <p
            className="text-sm text-neutral-500 dark:text-neutral-400 mt-1"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {monitorList.length === 0
              ? "No endpoints configured yet"
              : `Watching ${monitorList.length} endpoint${monitorList.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={monitorList.length} />
          <StatCard label="Online" value={upCount} color="green" />
          <StatCard label="Down" value={downCount} color="red" />
          <StatCard label="Pending" value={pendingCount} color="yellow" />
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="flex flex-col gap-0.5">
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 whitespace-nowrap"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Overall Uptime
            </p>
            <p
              className="text-xs text-neutral-500 dark:text-neutral-400"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Current session
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

        <StatusPageLink userId={activeProject?.id ?? user.id} />

        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
          <span
            className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 whitespace-nowrap"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Endpoints
          </span>
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
        </div>

        {anomalies && anomalies.length > 0 && (
          <div className="relative bg-yellow-400/[0.06] border border-yellow-400/20 rounded-2xl p-4 mb-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-lg">⚠️</span>
              <div>
                <p
                  className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Performance Degradation Detected
                </p>
                {anomalies.map((a) => (
                  <p
                    key={a.id}
                    className="text-neutral-400 text-xs"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {(a.monitors as unknown as { name: string } | null)?.name} —
                    averaging {a.current_avg_ms}ms (
                    {Math.round(a.current_avg_ms / a.baseline_ms)}x slower than
                    usual baseline of {a.baseline_ms}ms)
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#0f0f0f] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-500"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Endpoints
              </p>
              <p className="text-sm font-semibold text-[#080808] dark:text-white mt-0.5">
                {monitorList.length} configured
              </p>
            </div>
            <AddMonitorForm
              monitorCount={monitorList.length}
              isPro={isPro}
              projectId={activeProject?.id}
            />
          </div>

          {monitorList.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] mb-5">
                <svg
                  className="w-6 h-6 text-neutral-400 dark:text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                No monitors yet
              </p>
              <p className="text-xs text-neutral-500 mt-1.5">
                Add your first endpoint to start tracking uptime.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                      {[
                        "Name",
                        "URL",
                        "Status",
                        "Response",
                        "Health",
                        "Last Checked",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-500"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monitorList.map((monitor, i) => {
                      const ping = latestPings.get(monitor.id);
                      return (
                        <tr
                          key={monitor.id}
                          className={`border-b border-black/[0.03] dark:border-white/[0.03] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-100 group ${!monitor.is_active ? "opacity-40" : ""}`}
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <td className="px-4 py-4 text-sm font-semibold">
                            <Link
                              href={`/dashboard/monitors/${monitor.id}`}
                              className="text-[#080808] dark:text-white hover:text-[#00cc6a] dark:hover:text-[#00ff87] transition-colors duration-150"
                            >
                              {monitor.name}
                            </Link>
                          </td>
                          <td className="px-4 py-4 max-w-40">
                            <span
                              className="block truncate text-xs text-neutral-500 dark:text-neutral-400"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                              title={monitor.url}
                            >
                              {monitor.url}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {!monitor.is_active ? (
                              <span
                                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-600"
                                style={{ fontFamily: "'DM Mono', monospace" }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                PAUSED
                              </span>
                            ) : (
                              <StatusBadge
                                status={ping?.status}
                                statusCode={ping?.status_code}
                              />
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`text-xs font-medium ${responseTimeColor(ping?.response_time_ms ?? null)}`}
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {ping?.response_time_ms != null
                                ? `${ping.response_time_ms}ms`
                                : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {(() => {
                              const h = calculateHealthScore(
                                healthPingsMap.get(monitor.id) ?? [],
                              );
                              return (
                                <HealthBadge
                                  score={h.score}
                                  label={h.label}
                                  reasons={h.reasons}
                                  size="sm"
                                />
                              );
                            })()}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className="text-xs text-neutral-500 dark:text-neutral-400"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {ping ? <LocalTime iso={ping.checked_at} /> : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <EditMonitorModal
                                monitor={monitor}
                                variant="icon"
                                isPro={isPro}
                              />
                              <form action={toggleMonitor}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={monitor.id}
                                />
                                <input
                                  type="hidden"
                                  name="is_active"
                                  value={monitor.is_active ? "false" : "true"}
                                />
                                <button
                                  type="submit"
                                  className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-[#00cc6a] dark:hover:text-[#00ff87] transition-colors duration-150"
                                >
                                  {monitor.is_active ? "Pause" : "Resume"}
                                </button>
                              </form>
                              <form action={deleteMonitor}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={monitor.id}
                                />
                                <button
                                  type="submit"
                                  className="text-xs font-medium text-neutral-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
                                >
                                  Remove
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {monitorList.map((monitor) => {
                  const ping = latestPings.get(monitor.id);
                  return (
                    <div
                      key={monitor.id}
                      className={`px-4 py-4 space-y-3 ${!monitor.is_active ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/dashboard/monitors/${monitor.id}`}
                            className="block text-sm font-semibold text-[#080808] dark:text-white truncate hover:text-[#00cc6a] dark:hover:text-[#00ff87] transition-colors"
                          >
                            {monitor.name}
                          </Link>
                          <p
                            className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {monitor.url}
                          </p>
                        </div>
                        {!monitor.is_active ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-600 shrink-0"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            PAUSED
                          </span>
                        ) : (
                          <StatusBadge
                            status={ping?.status}
                            statusCode={ping?.status_code}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p
                            className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            Response
                          </p>
                          <p
                            className={`text-xs font-medium ${responseTimeColor(ping?.response_time_ms ?? null)}`}
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {ping?.response_time_ms != null
                              ? `${ping.response_time_ms}ms`
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            Health
                          </p>
                          {(() => {
                            const h = calculateHealthScore(
                              healthPingsMap.get(monitor.id) ?? [],
                            );
                            return (
                              <HealthBadge
                                score={h.score}
                                label={h.label}
                                reasons={h.reasons}
                                size="sm"
                              />
                            );
                          })()}
                        </div>
                        <div>
                          <p
                            className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            Interval
                          </p>
                          <p
                            className="text-xs text-neutral-500 dark:text-neutral-400"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {monitor.check_interval_minutes ?? "—"}m
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <EditMonitorModal monitor={monitor} variant="icon" isPro={isPro} />
                        <form action={toggleMonitor}>
                          <input type="hidden" name="id" value={monitor.id} />
                          <input
                            type="hidden"
                            name="is_active"
                            value={monitor.is_active ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-[#00cc6a] dark:hover:text-[#00ff87] transition-colors"
                          >
                            {monitor.is_active ? "Pause" : "Resume"}
                          </button>
                        </form>
                        <form action={deleteMonitor}>
                          <input type="hidden" name="id" value={monitor.id} />
                          <button
                            type="submit"
                            className="text-xs font-medium text-neutral-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {monitorList.length > 0 && (
          <p
            className="text-[10px] text-neutral-500 mt-3"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Click any monitor for detailed health insights and ping history →
          </p>
        )}

        {/* Upgrade banner for free users */}
        {!isPro && (
          <div className="relative bg-white dark:bg-[#0f0f0f] border border-[#00cc6a]/10 dark:border-[#00ff87]/10 rounded-2xl p-4 mt-2 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/20 dark:via-[#00ff87]/20 to-transparent" />
            <div className="min-w-0">
              <p
                className="text-[#080808] dark:text-white text-sm font-semibold"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Upgrade to Pro
              </p>
              <p
                className="text-neutral-500 text-xs mt-0.5 truncate"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                1 min intervals · SSL monitoring · schema detection · 90 day
                history
              </p>
            </div>
            <Link
              href="/pricing"
              className="text-xs bg-[#00cc6a] dark:bg-[#00ff87] text-black font-bold px-4 py-2 rounded-xl flex-shrink-0"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              See Pro →
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-black/[0.06] dark:border-white/[0.06] mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span
            className="text-[11px] text-neutral-400 dark:text-neutral-600 tracking-[0.1em] uppercase"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Pulse · API Monitor
          </span>
          <div className="flex items-center gap-5">
            {[
              {
                href: `/status/${activeProject?.id ?? user.id}`,
                label: "Status Page",
              },
              { href: "/docs", label: "Docs" },
              { href: "/pricing", label: "Pricing" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[11px] text-neutral-500 dark:text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors duration-150"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function responseTimeColor(ms: number | null): string {
  if (ms === null) return "text-neutral-400 dark:text-neutral-600";
  if (ms < 300) return "text-[#00cc6a] dark:text-[#00ff87]";
  if (ms < 1000) return "text-yellow-500 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "red" | "yellow";
}) {
  const valueColor =
    color === "green"
      ? "text-[#00cc6a] dark:text-[#00ff87]"
      : color === "red"
        ? "text-red-500 dark:text-red-400"
        : color === "yellow"
          ? "text-yellow-500 dark:text-yellow-400"
          : "text-[#080808] dark:text-white";

  return (
    <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-4 py-4 hover:border-black/[0.1] dark:hover:border-white/[0.1] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-none">
      <p
        className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-2"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </p>
      <p className={`text-3xl font-extrabold tabular-nums ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
  statusCode,
}: {
  status?: string;
  statusCode?: number | null;
}) {
  if (!status) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        PENDING
      </span>
    );
  }

  return status === "up" ? (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00cc6a] dark:text-[#00ff87]"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cc6a] dark:bg-[#00ff87] opacity-50" />
        <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00cc6a] dark:bg-[#00ff87]" />
      </span>
      UP{statusCode ? ` · ${statusCode}` : ""}
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-500 dark:text-red-400"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
      DOWN{statusCode ? ` · ${statusCode}` : ""}
    </span>
  );
}
