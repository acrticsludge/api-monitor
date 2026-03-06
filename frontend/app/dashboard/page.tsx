import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase-server";
import { logout } from "../auth/actions";
import { deleteMonitor } from "./actions";
import AddMonitorForm from "./AddMonitorForm";

type Monitor = {
  id: string;
  name: string;
  url: string;
  method: string | null;
  check_interval_minutes: number | null;
  is_active: boolean;
  created_at: string;
};

type Ping = {
  monitor_id: string;
  status: string;
  status_code: number | null;
  response_time_ms: number | null;
  checked_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: monitors } = await supabase
    .from("monitors")
    .select(
      "id, name, url, method, check_interval_minutes, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  const monitorList: Monitor[] = monitors ?? [];
  const monitorIds = monitorList.map((m) => m.id);
  const latestPings = new Map<string, Ping>();

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
    }
  }

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
      className="min-h-screen bg-[#080808] text-white"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,255,135,0.05),transparent)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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

          <div className="flex items-center gap-4">
            <span
              className="hidden sm:block text-[11px] text-neutral-500"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 border border-white/[0.08] rounded-md px-3 py-1.5 hover:text-white hover:border-white/20 transition-all duration-150"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        <div className="mb-6">
          <p
            className="text-[11px] font-mono tracking-[0.15em] uppercase text-[#00ff87] mb-1"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Overview
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Your Monitors
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={monitorList.length} />
          <StatCard label="Online" value={upCount} color="green" />
          <StatCard label="Down" value={downCount} color="red" />
          <StatCard label="Pending" value={pendingCount} color="yellow" />
        </div>

        <div className="flex items-center gap-4 bg-[#0f0f0f] border border-white/[0.06] rounded-2xl px-5 py-4">
          <p
            className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 whitespace-nowrap"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Uptime
          </p>
          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00ff87] rounded-full shadow-[0_0_8px_rgba(0,255,135,0.5)] transition-all duration-700"
              style={{ width: `${uptimePct}%` }}
            />
          </div>
          <p
            className="text-sm font-bold text-[#00ff87] tabular-nums"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {uptimePct}%
          </p>
        </div>

        <div className="bg-[#0f0f0f] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div>
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-neutral-500"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Endpoints
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {monitorList.length} configured
              </p>
            </div>
            <AddMonitorForm />
          </div>

          {monitorList.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-5">
                <svg
                  className="w-6 h-6 text-neutral-600"
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
              <p className="text-sm font-semibold text-neutral-300">
                No monitors yet
              </p>
              <p className="text-xs text-neutral-600 mt-1.5">
                Add your first endpoint to start tracking uptime.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {[
                        "Name",
                        "URL",
                        "Status",
                        "Response",
                        "Last Checked",
                        "Interval",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-600"
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
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-100 group"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <td className="px-5 py-4 text-sm font-semibold text-white">
                            {monitor.name}
                          </td>
                          <td className="px-5 py-4 max-w-[180px]">
                            <span
                              className="block truncate text-[11px] text-neutral-500"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                              title={monitor.url}
                            >
                              {monitor.url}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge
                              status={ping?.status}
                              statusCode={ping?.status_code}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="text-[11px] text-neutral-400"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {ping?.response_time_ms != null
                                ? `${ping.response_time_ms}ms`
                                : "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="text-[11px] text-neutral-500"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {ping
                                ? new Date(ping.checked_at).toLocaleString()
                                : "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="text-[11px] text-neutral-600"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {monitor.check_interval_minutes ?? "—"}m
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <form action={deleteMonitor}>
                              <input
                                type="hidden"
                                name="id"
                                value={monitor.id}
                              />
                              <button
                                type="submit"
                                className="text-[11px] font-medium text-neutral-700 hover:text-red-400 transition-colors duration-150 opacity-0 group-hover:opacity-100"
                              >
                                Remove
                              </button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden divide-y divide-white/[0.04]">
                {monitorList.map((monitor) => {
                  const ping = latestPings.get(monitor.id);
                  return (
                    <div key={monitor.id} className="px-4 py-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {monitor.name}
                          </p>
                          <p
                            className="text-[11px] text-neutral-500 truncate mt-0.5"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {monitor.url}
                          </p>
                        </div>
                        <StatusBadge
                          status={ping?.status}
                          statusCode={ping?.status_code}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p
                            className="text-[10px] uppercase tracking-widest text-neutral-600 mb-0.5"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            Response
                          </p>
                          <p
                            className="text-[11px] text-neutral-400"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {ping?.response_time_ms != null
                              ? `${ping.response_time_ms}ms`
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-[10px] uppercase tracking-widest text-neutral-600 mb-0.5"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            Interval
                          </p>
                          <p
                            className="text-[11px] text-neutral-400"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                          >
                            {monitor.check_interval_minutes ?? "—"}m
                          </p>
                        </div>
                        <div className="ml-auto">
                          <form action={deleteMonitor}>
                            <input type="hidden" name="id" value={monitor.id} />
                            <button
                              type="submit"
                              className="text-[11px] font-medium text-neutral-700 hover:text-red-400 transition-colors"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
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
      ? "text-[#00ff87]"
      : color === "red"
        ? "text-red-400"
        : color === "yellow"
          ? "text-yellow-400"
          : "text-white";

  const glowColor =
    color === "green"
      ? "hover:shadow-[0_0_24px_rgba(0,255,135,0.08)]"
      : color === "red"
        ? "hover:shadow-[0_0_24px_rgba(255,68,68,0.08)]"
        : color === "yellow"
          ? "hover:shadow-[0_0_24px_rgba(255,204,0,0.08)]"
          : "";

  return (
    <div
      className={`bg-[#0f0f0f] border border-white/[0.06] rounded-2xl px-4 py-4 hover:border-white/[0.1] transition-all duration-200 ${glowColor}`}
    >
      <p
        className="text-[10px] tracking-[0.12em] uppercase text-neutral-600 mb-2"
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
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-600"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
        PENDING
      </span>
    );
  }

  return status === "up" ? (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00ff87]"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-50" />
        <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00ff87]" />
      </span>
      UP{statusCode ? ` · ${statusCode}` : ""}
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-400"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      DOWN{statusCode ? ` · ${statusCode}` : ""}
    </span>
  );
}
