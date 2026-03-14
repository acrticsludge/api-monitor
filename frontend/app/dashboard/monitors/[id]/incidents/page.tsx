export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase-server";
import { getIsPro } from "../../../../lib/isPro";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

const STATUS_CODE_MEANINGS: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  408: "Request Timeout",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

function StatusCodeBadge({ code }: { code: number }) {
  const isError = code >= 400;
  return (
    <span
      className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
        isError
          ? "bg-[#fb2c36]/10 text-[#fb2c36] border border-[#fb2c36]/20"
          : "bg-[#00d294]/10 text-[#00d294] border border-[#00d294]/20"
      }`}
      style={{ fontFamily: "'Geist Mono', monospace" }}
      title={STATUS_CODE_MEANINGS[code]}
    >
      {code}
    </span>
  );
}

export default async function IncidentsPage({
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
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, type, sent_at, status_code, response_time_ms, downtime_minutes")
    .eq("monitor_id", id)
    .order("sent_at", { ascending: false })
    .limit(50);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data: anomalyAlerts } = await supabase
    .from("anomaly_alerts")
    .select("id, type, baseline_ms, current_avg_ms, triggered_at")
    .eq("monitor_id", id)
    .gte("triggered_at", oneDayAgo.toISOString())
    .order("triggered_at", { ascending: false });

  const { data: schemaAlerts } = isPro
    ? await supabase
        .from("schema_alerts")
        .select("id, type, detail, triggered_at")
        .eq("monitor_id", id)
        .order("triggered_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const recentAnomalies = anomalyAlerts ?? [];

  type IncidentItem =
    | { kind: "alert"; id: string; type: string; ts: string; status_code: number | null; response_time_ms: number | null; downtime_minutes: number | null }
    | { kind: "anomaly"; id: string; baseline_ms: number; current_avg_ms: number; ts: string }
    | { kind: "schema"; id: string; type: string; detail: string; ts: string };

  const items: IncidentItem[] = [
    ...(alerts ?? []).map((a) => ({
      kind: "alert" as const,
      id: a.id,
      type: a.type,
      ts: a.sent_at,
      status_code: a.status_code ?? null,
      response_time_ms: a.response_time_ms ?? null,
      downtime_minutes: a.downtime_minutes ?? null,
    })),
    ...(anomalyAlerts ?? []).map((a) => ({
      kind: "anomaly" as const,
      id: a.id,
      baseline_ms: a.baseline_ms,
      current_avg_ms: a.current_avg_ms,
      ts: a.triggered_at,
    })),
    ...(schemaAlerts ?? []).map((a) => ({
      kind: "schema" as const,
      id: a.id,
      type: a.type,
      detail: a.detail,
      ts: a.triggered_at,
    })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-[11px] tracking-[0.14em] uppercase text-[#00d294] mb-1.5 font-medium"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          &gt; incidents
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Incidents & Alerts
        </h2>
        <p
          className="text-neutral-500 text-xs mt-1"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          All downtime events, anomalies and recovery alerts
        </p>
      </div>

      {recentAnomalies.length > 0 && (
        <Alert className="mb-4 bg-[#f99c00]/[0.04] border-[#f99c00]/20 text-[#f99c00]">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription
            className="text-[#f99c00]"
            style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px" }}
          >
            Performance degradation detected in the last 24 hours (
            {recentAnomalies.length} anomal
            {recentAnomalies.length === 1 ? "y" : "ies"})
          </AlertDescription>
        </Alert>
      )}

      {items.length === 0 ? (
        <div className="relative bg-card border border-border rounded-2xl p-10 text-center overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#00d294]/[0.06] border border-[#00d294]/10 mb-3">
            <svg
              className="w-5 h-5 text-[#00d294]"
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
            className="text-xs text-neutral-400 font-medium"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            All clear — no incidents recorded
          </p>
          <p
            className="text-[11px] text-neutral-600 mt-1"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Incidents appear here when a monitor goes down or recovers
          </p>
        </div>
      ) : (
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Type", "Status Code", "Response Time", "Duration", "Time"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-neutral-500 text-[11px] py-3"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                if (item.kind === "alert") {
                  return (
                    <TableRow
                      key={item.id}
                      className="border-border hover:bg-muted/30"
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.type === "down"
                              ? "text-[#fb2c36] border-[#fb2c36]/20 bg-[#fb2c36]/10 text-[10px]"
                              : "text-[#00d294] border-[#00d294]/20 bg-[#00d294]/10 text-[10px]"
                          }
                          style={{ fontFamily: "'Geist Mono', monospace" }}
                        >
                          {item.type === "down" ? "Down" : "Recovered"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.status_code ? (
                          <StatusCodeBadge code={item.status_code} />
                        ) : (
                          <span
                            className="text-neutral-600 text-xs"
                            style={{ fontFamily: "'Geist Mono', monospace" }}
                          >
                            {item.type === "down" ? "Timeout" : "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-neutral-400 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {item.response_time_ms ? `${item.response_time_ms}ms` : "—"}
                      </TableCell>
                      <TableCell
                        className="text-neutral-400 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {item.type === "recovered" && item.downtime_minutes
                          ? `${item.downtime_minutes} min`
                          : "—"}
                      </TableCell>
                      <TableCell
                        className="text-neutral-500 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {new Date(item.ts).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                }

                if (item.kind === "anomaly") {
                  return (
                    <TableRow
                      key={item.id}
                      className="border-border hover:bg-muted/30"
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[#f99c00] border-[#f99c00]/20 bg-[#f99c00]/10 text-[10px]"
                          style={{ fontFamily: "'Geist Mono', monospace" }}
                        >
                          Degraded
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-neutral-600 text-xs" style={{ fontFamily: "'Geist Mono', monospace" }}>
                          —
                        </span>
                      </TableCell>
                      <TableCell
                        className="text-[#f99c00] text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {item.current_avg_ms}ms avg ({Math.round(item.current_avg_ms / item.baseline_ms)}x)
                      </TableCell>
                      <TableCell className="text-neutral-600 text-xs" style={{ fontFamily: "'Geist Mono', monospace" }}>—</TableCell>
                      <TableCell
                        className="text-neutral-500 text-xs"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {new Date(item.ts).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow
                    key={item.id}
                    className="border-border hover:bg-muted/30"
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.type === "ssl_expiry"
                            ? "text-[#f99c00] border-[#f99c00]/20 bg-[#f99c00]/10 text-[10px]"
                            : "text-blue-400 border-blue-400/20 bg-blue-400/10 text-[10px]"
                        }
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {item.type === "ssl_expiry" ? "SSL Expiry" : "Schema"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-600 text-xs" style={{ fontFamily: "'Geist Mono', monospace" }}>—</TableCell>
                    <TableCell className="text-neutral-600 text-xs" style={{ fontFamily: "'Geist Mono', monospace" }}>—</TableCell>
                    <TableCell
                      className="text-neutral-400 text-xs max-w-[180px] truncate"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                    >
                      {item.detail}
                    </TableCell>
                    <TableCell
                      className="text-neutral-500 text-xs"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                    >
                      {new Date(item.ts).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
