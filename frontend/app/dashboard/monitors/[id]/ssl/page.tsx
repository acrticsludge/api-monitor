export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase-server";
import { getIsPro } from "../../../../lib/isPro";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function ProPageGate({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative bg-card border border-border rounded-2xl p-10 text-center max-w-sm w-full overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
        <div className="w-12 h-12 rounded-xl bg-[#00ff87]/[0.06] border border-[#00ff87]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#00ff87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-foreground text-sm font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
          {feature}
        </p>
        <p className="text-neutral-500 text-xs mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>
          Available on Pro tier
        </p>
        <Link
          href="/pricing"
          className="inline-block text-[11px] bg-[#00ff87] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#00f080] transition-colors"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Upgrade to Pro →
        </Link>
      </div>
    </div>
  );
}

export default async function SSLPage({
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
    .select("id, check_ssl")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  if (!isPro) {
    return <ProPageGate feature="SSL & Schema Monitoring" />;
  }

  const { data: latestSSLPing } =
    monitor.check_ssl
      ? await supabase
          .from("pings")
          .select("ssl_valid, ssl_expires_at, ssl_days_remaining")
          .eq("monitor_id", id)
          .not("ssl_valid", "is", null)
          .order("checked_at", { ascending: false })
          .limit(1)
          .single()
      : { data: null };

  const { data: schemaAlerts } = await supabase
    .from("schema_alerts")
    .select("id, type, detail, triggered_at")
    .eq("monitor_id", id)
    .order("triggered_at", { ascending: false })
    .limit(20);

  const ssl = latestSSLPing as {
    ssl_valid?: boolean;
    ssl_expires_at?: string | null;
    ssl_days_remaining?: number | null;
  } | null;

  const daysLeft = ssl?.ssl_days_remaining ?? null;

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-[11px] tracking-[0.14em] uppercase text-[#00ff87] mb-1.5 font-medium"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          &gt; ssl & schema
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          SSL & Schema Alerts
        </h2>
        <p
          className="text-neutral-500 text-xs mt-1"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Certificate status and response schema changes
        </p>
      </div>

      {/* SSL card */}
      {!monitor.check_ssl ? (
        <div className="relative bg-card border border-border rounded-2xl p-6 mb-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
          <p
            className="text-neutral-500 text-xs"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            SSL monitoring is not enabled for this monitor. Enable it in{" "}
            <Link href={`/dashboard/monitors/${id}/settings`} className="text-[#00ff87] hover:underline">
              Settings
            </Link>
            .
          </p>
        </div>
      ) : ssl ? (
        <div className="relative bg-card border border-border rounded-2xl p-5 mb-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="text-[10px] tracking-[0.15em] uppercase text-neutral-500 mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                SSL Certificate
              </p>
              <p
                className={`text-2xl font-bold ${ssl.ssl_valid ? "text-[#00ff87]" : "text-red-400"}`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {ssl.ssl_valid ? "Valid" : "Invalid"}
              </p>
              {ssl.ssl_expires_at && (
                <p
                  className="text-neutral-500 text-xs mt-1"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Expires {new Date(ssl.ssl_expires_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p
                className={`text-4xl font-bold tabular-nums ${
                  daysLeft == null
                    ? "text-neutral-500"
                    : daysLeft <= 7
                    ? "text-red-400"
                    : daysLeft <= 30
                    ? "text-yellow-400"
                    : "text-[#00ff87]"
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {daysLeft ?? "—"}
              </p>
              <p
                className="text-neutral-600 text-[11px]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                days remaining
              </p>
            </div>
          </div>
          {daysLeft !== null && (
            <Progress
              value={Math.min(100, (daysLeft / 90) * 100)}
              className="h-1.5 bg-muted"
            />
          )}
        </div>
      ) : (
        <div className="relative bg-card border border-border rounded-2xl p-6 mb-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
          <p
            className="text-neutral-500 text-xs"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            No SSL data yet — will appear after next ping.
          </p>
        </div>
      )}

      {/* Schema alerts table */}
      <div className="mb-3">
        <p
          className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-3"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Schema & SSL Alerts
        </p>
      </div>

      {!schemaAlerts || schemaAlerts.length === 0 ? (
        <div className="relative bg-card border border-border rounded-2xl p-8 text-center overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
          <p
            className="text-neutral-500 text-xs"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            No schema or SSL alerts yet
          </p>
        </div>
      ) : (
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Type", "Detail", "Time"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-neutral-500 text-[11px] py-3"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemaAlerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className="border-border hover:bg-muted/30"
                >
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        alert.type === "ssl_expiry"
                          ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/10 text-[10px]"
                          : "text-blue-400 border-blue-400/20 bg-blue-400/10 text-[10px]"
                      }
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {alert.type === "ssl_expiry" ? "SSL Expiry" : "Schema Changed"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-neutral-400 text-xs max-w-[300px]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {alert.detail}
                  </TableCell>
                  <TableCell
                    className="text-neutral-500 text-xs whitespace-nowrap"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {new Date(alert.triggered_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
