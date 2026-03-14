export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";
import CheckNowButton from "./CheckNowButton";
import CSVExportButton from "./CSVExportButton";
import EditMonitorModal from "../../../../components/EditMonitorModal";
import UptimeHistory from "./UptimeHistory";
import HealthBadge from "../../../../components/HealthBadge";
import { calculateHealthScore } from "../../../lib/healthScore";
import { getIsPro } from "../../../lib/isPro";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function responseTimeColor(ms: number | null): string {
  if (ms === null) return "text-neutral-600";
  if (ms < 300) return "text-[#00ff87]";
  if (ms < 1000) return "text-yellow-400";
  return "text-red-400";
}

export default async function MonitorOverviewPage({
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

  const isPro = await getIsPro();

  const { data: monitor } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  const { data: pings } = await supabase
    .from("pings")
    .select("id, status, status_code, response_time_ms, checked_at, dns_lookup_ms, tcp_connect_ms, tls_handshake_ms, ttfb_ms, error_detail")
    .eq("monitor_id", id)
    .order("checked_at", { ascending: false })
    .limit(100);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: weekPings } = await supabase
    .from("pings")
    .select("status, checked_at")
    .eq("monitor_id", id)
    .gte("checked_at", sevenDaysAgo.toISOString())
    .order("checked_at", { ascending: false })
    .limit(2500);

  const pingList = pings ?? [];
  const upCount = pingList.filter((p) => p.status === "up").length;
  const uptimePct =
    pingList.length > 0 ? Math.round((upCount / pingList.length) * 100) : 100;
  const latestPing = pingList[0];
  const recentPings = pingList.slice(0, 20);
  const health = calculateHealthScore(recentPings);

  const avgResponse =
    pingList.filter((p) => p.response_time_ms != null).length > 0
      ? Math.round(
          pingList
            .filter((p) => p.response_time_ms != null)
            .reduce((acc, p) => acc + (p.response_time_ms ?? 0), 0) /
            pingList.filter((p) => p.response_time_ms != null).length,
        )
      : null;

  const lastCheckedStr = latestPing?.checked_at
    ? new Date(latestPing.checked_at).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div style={{ fontFamily: "'Syne', sans-serif" }}>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p
            className="text-[11px] tracking-[0.14em] uppercase text-[#00ff87] mb-1.5 font-medium"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            &gt; overview
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            {monitor.name}
          </h2>
          <p
            className="text-xs text-neutral-500 mt-1 break-all"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {monitor.url}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {!monitor.is_active && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 border border-border rounded-md px-2.5 py-1.5"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              PAUSED
            </span>
          )}
          <EditMonitorModal monitor={monitor} variant="button" isPro={isPro} />
          <CheckNowButton monitorId={id} />
          {isPro && <CSVExportButton monitorId={id} monitorName={monitor.name} />}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <StatCard
          label="Status"
          value={latestPing ? (latestPing.status === "up" ? "UP" : "DOWN") : "—"}
          color={
            latestPing?.status === "up"
              ? "green"
              : latestPing?.status === "down"
              ? "red"
              : undefined
          }
        />
        <StatCard
          label="Uptime"
          value={`${uptimePct}%`}
          sub={`${pingList.length} pings`}
          color="green"
        />
        <StatCard
          label="Avg Response"
          value={avgResponse != null ? `${avgResponse}ms` : "—"}
          responseMs={avgResponse}
        />
        <StatCard
          label="Last Response"
          value={
            latestPing?.response_time_ms != null
              ? `${latestPing.response_time_ms}ms`
              : "—"
          }
          responseMs={latestPing?.response_time_ms ?? null}
        />
        <StatCard
          label="Last Checked"
          value={lastCheckedStr}
          sub={latestPing?.checked_at ? new Date(latestPing.checked_at).toLocaleDateString() : undefined}
        />
        <StatCard
          label="Check Interval"
          value={`${monitor.check_interval_minutes ?? 5}m`}
          sub="check interval"
        />
      </div>

      {/* Health Score card */}
      <div className="relative bg-card border border-border rounded-2xl px-4 py-4 mb-5 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
        <p
          className="text-[10px] tracking-[0.15em] uppercase text-neutral-500 mb-2"
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

      {/* Uptime bar */}
      <div className="relative bg-card border border-border rounded-2xl px-5 py-4 mb-5 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 whitespace-nowrap"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Uptime
            </p>
            <p
              className="text-[10px] text-neutral-600"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Last {pingList.length} checks
            </p>
          </div>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
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
      </div>

      {/* 7-day uptime history */}
      <UptimeHistory pings={weekPings ?? []} />

      {/* Details grid */}
      <div className="relative bg-card border border-border rounded-2xl px-5 py-4 mt-5 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
        <p
          className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-4"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Configuration
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Method", value: monitor.method || "GET" },
            { label: "Expected Status", value: String(monitor.expected_status_code || 200) },
            { label: "Interval", value: `${monitor.check_interval_minutes ?? 5}m` },
            { label: "Added", value: new Date(monitor.created_at).toLocaleDateString() },
            {
              label: "Webhook",
              value: monitor.webhook_url
                ? monitor.webhook_url.replace(/^https?:\/\//, "").slice(0, 28) +
                  (monitor.webhook_url.length > 35 ? "…" : "")
                : "Not configured",
              valueClass: monitor.webhook_url ? "text-[#00ff87]" : "text-neutral-600",
            },
            ...(isPro && monitor.auth_type && monitor.auth_type !== "none"
              ? [
                  {
                    label: "Authentication",
                    value:
                      monitor.auth_type === "bearer"
                        ? "Bearer Token"
                        : monitor.auth_type === "api_key"
                        ? "API Key"
                        : "Basic Auth",
                  },
                ]
              : []),
          ].map(({ label, value, valueClass }) => (
            <div key={label}>
              <p
                className="text-[10px] tracking-[0.1em] uppercase text-neutral-500 mb-1.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {label}
              </p>
              <p
                className={`text-sm font-medium ${valueClass ?? "text-foreground"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
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
        ? "text-[#00ff87]"
        : responseMs < 1000
        ? "text-yellow-400"
        : "text-red-400"
      : color === "green"
      ? "text-[#00ff87]"
      : color === "red"
      ? "text-red-400"
      : "text-foreground";

  return (
    <div className="relative bg-card border border-border rounded-2xl px-4 py-4 hover:border-input transition-all duration-200 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
      <p
        className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-2"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </p>
      <p className={`text-2xl font-extrabold tabular-nums ${valueColor}`} style={{ fontFamily: "'Syne', sans-serif" }}>
        {value}
      </p>
      {sub && (
        <p
          className="text-[10px] text-neutral-600 mt-1"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
