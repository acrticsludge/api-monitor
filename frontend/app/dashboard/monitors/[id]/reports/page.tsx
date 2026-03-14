export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase-server";
import { getIsPro } from "../../../../lib/isPro";
import IncidentReportCard from "../IncidentReportCard";
import { type IncidentReport } from "../../../../lib/generateReport";
import { analyzeRootCause } from "../../../../lib/rootCause";

export default async function ReportsPage({
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
    .select("id, name, url, check_interval_minutes")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  if (!isPro) {
    return <ProPageGate feature="Incident Reports" />;
  }

  const { data: pings } = await supabase
    .from("pings")
    .select("id, status, status_code, response_time_ms, checked_at, dns_lookup_ms, tcp_connect_ms, tls_handshake_ms, ttfb_ms, error_detail")
    .eq("monitor_id", id)
    .order("checked_at", { ascending: false })
    .limit(100);

  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, type, sent_at, status_code, response_time_ms, downtime_minutes, incident_id")
    .eq("monitor_id", id)
    .order("sent_at", { ascending: false })
    .limit(40);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data: anomalyAlerts } = await supabase
    .from("anomaly_alerts")
    .select("id, type, baseline_ms, current_avg_ms, triggered_at")
    .eq("monitor_id", id)
    .gte("triggered_at", oneDayAgo.toISOString())
    .order("triggered_at", { ascending: false });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentDownAlerts } = await supabase
    .from("alerts")
    .select("id")
    .eq("monitor_id", id)
    .eq("type", "down")
    .gte("sent_at", thirtyDaysAgo.toISOString());

  const incidentFrequency30d = recentDownAlerts?.length ?? 0;

  const { data: historicalRecoveries } = await supabase
    .from("alerts")
    .select("downtime_minutes")
    .eq("monitor_id", id)
    .eq("type", "recovered")
    .not("downtime_minutes", "is", null)
    .limit(10);

  const averageHistoricalDowntimeMinutes =
    historicalRecoveries && historicalRecoveries.length > 0
      ? Math.round(
          historicalRecoveries.reduce((a, b) => a + (b.downtime_minutes ?? 0), 0) /
            historicalRecoveries.length,
        )
      : null;

  const pingList = pings ?? [];
  const allAlerts = alerts ?? [];

  const upPingsWithResponse = pingList.filter(
    (p) => p.status === "up" && p.response_time_ms != null,
  );
  const baselineMs =
    upPingsWithResponse.length > 0
      ? Math.round(
          upPingsWithResponse.reduce((a, b) => a + (b.response_time_ms ?? 0), 0) /
            upPingsWithResponse.length,
        )
      : null;

  const upPingsForBaseline = pingList.filter((p) => p.status === "up");
  const baseline =
    upPingsForBaseline.length > 0
      ? {
          dns_lookup_ms: Math.round(upPingsForBaseline.reduce((a, b) => a + (b.dns_lookup_ms ?? 0), 0) / upPingsForBaseline.length),
          tcp_connect_ms: Math.round(upPingsForBaseline.reduce((a, b) => a + (b.tcp_connect_ms ?? 0), 0) / upPingsForBaseline.length),
          tls_handshake_ms: Math.round(upPingsForBaseline.reduce((a, b) => a + (b.tls_handshake_ms ?? 0), 0) / upPingsForBaseline.length),
          ttfb_ms: Math.round(upPingsForBaseline.reduce((a, b) => a + (b.ttfb_ms ?? 0), 0) / upPingsForBaseline.length),
        }
      : {};

  const downAlerts = allAlerts.filter((a) => a.type === "down");

  const incidentReports: IncidentReport[] = (
    await Promise.all(
      downAlerts.map(async (downAlert) => {
        if (!downAlert.incident_id) return null;
        const recoveredAlert = allAlerts.find(
          (a) => a.type === "recovered" && a.incident_id === downAlert.incident_id,
        );
        if (!recoveredAlert) return null;

        const downTime = new Date(downAlert.sent_at).getTime();

        const { data: preIncidentPings } = await supabase
          .from("pings")
          .select("checked_at, response_time_ms, status")
          .eq("monitor_id", id)
          .lt("checked_at", downAlert.sent_at)
          .order("checked_at", { ascending: false })
          .limit(5);

        const preIncidentTrend = (preIncidentPings ?? []).reverse().map((p) => ({
          checkedAt: p.checked_at,
          responseTimeMs: p.response_time_ms,
          status: p.status,
        }));

        const thirtyMinBefore = new Date(downTime - 30 * 60 * 1000).toISOString();
        const { data: prePings } = await supabase
          .from("pings")
          .select("status")
          .eq("monitor_id", id)
          .gte("checked_at", thirtyMinBefore)
          .lt("checked_at", downAlert.sent_at);

        const errorRateBeforeIncident =
          prePings && prePings.length > 0
            ? Math.round(
                (prePings.filter((p) => p.status === "down").length / prePings.length) * 100,
              )
            : null;

        const relevantAnomaly = (anomalyAlerts ?? []).find((a) => {
          const anomalyTime = new Date(a.triggered_at).getTime();
          return anomalyTime < downTime && downTime - anomalyTime < 30 * 60 * 1000;
        });

        const anomalyLeadTimeMinutes = relevantAnomaly
          ? Math.round((downTime - new Date(relevantAnomaly.triggered_at).getTime()) / 1000 / 60)
          : null;

        const { data: incidentPingArr } = await supabase
          .from("pings")
          .select("dns_lookup_ms, tcp_connect_ms, tls_handshake_ms, ttfb_ms, status_code, response_time_ms, error_detail")
          .eq("monitor_id", id)
          .eq("status", "down")
          .gte("checked_at", downAlert.sent_at)
          .order("checked_at", { ascending: true })
          .limit(1);

        const incidentPing = incidentPingArr?.[0] ?? null;

        const rootCauseAnalysis = incidentPing
          ? analyzeRootCause(
              {
                dns_lookup_ms: incidentPing.dns_lookup_ms ?? null,
                tcp_connect_ms: incidentPing.tcp_connect_ms ?? null,
                tls_handshake_ms: incidentPing.tls_handshake_ms ?? null,
                ttfb_ms: incidentPing.ttfb_ms ?? null,
                response_time_ms: incidentPing.response_time_ms ?? null,
                status_code: incidentPing.status_code ?? null,
                error_detail: incidentPing.error_detail ?? null,
              },
              baseline,
            )
          : null;

        const previousIncident = allAlerts.find(
          (a) => a.type === "down" && a.sent_at < downAlert.sent_at,
        );
        const timeSinceLastIncidentMinutes = previousIncident
          ? Math.round((downTime - new Date(previousIncident.sent_at).getTime()) / 1000 / 60)
          : null;

        const durationMinutes = recoveredAlert.downtime_minutes;
        const failedChecks = durationMinutes
          ? Math.max(1, Math.round(durationMinutes / (monitor.check_interval_minutes ?? 5)))
          : 1;

        return {
          incidentId: downAlert.incident_id,
          monitorName: monitor.name,
          monitorUrl: monitor.url,
          startTime: downAlert.sent_at,
          endTime: recoveredAlert.sent_at,
          durationMinutes,
          errorStatusCode: downAlert.status_code ?? null,
          rootCause: rootCauseAnalysis?.likelyCause ?? null,
          confidence: rootCauseAnalysis?.confidence ?? null,
          suggestion: rootCauseAnalysis?.suggestion ?? null,
          baselineResponseMs: baselineMs,
          responseAtFailure: downAlert.response_time_ms ?? null,
          responseAtRecovery: recoveredAlert.response_time_ms ?? null,
          failedChecks,
          estimatedRequestsAffected: durationMinutes ? durationMinutes * 100 : null,
          anomalyDetectedBefore: !!relevantAnomaly,
          anomalyLeadTimeMinutes,
          anomalyBaselineMs: relevantAnomaly?.baseline_ms ?? null,
          anomalyPeakMs: relevantAnomaly?.current_avg_ms ?? null,
          dnsLookupMs: incidentPing?.dns_lookup_ms ?? null,
          tcpConnectMs: incidentPing?.tcp_connect_ms ?? null,
          tlsHandshakeMs: incidentPing?.tls_handshake_ms ?? null,
          ttfbMs: incidentPing?.ttfb_ms ?? null,
          preIncidentTrend,
          errorRateBeforeIncident,
          incidentFrequency30d,
          averageHistoricalDowntimeMinutes,
          timeSinceLastIncidentMinutes,
          generatedAt: new Date().toISOString(),
        } satisfies IncidentReport;
      }),
    )
  ).filter((r): r is IncidentReport => r !== null);

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-[11px] tracking-[0.14em] uppercase text-[#00d294] mb-1.5 font-medium"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          &gt; post-mortem reports
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Incident Reports
        </h2>
        <p
          className="text-neutral-500 text-xs mt-1"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Automatically generated after each incident resolves
        </p>
      </div>

      {incidentReports.length === 0 ? (
        <div className="relative bg-card border border-border rounded-2xl p-10 text-center overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
          <p
            className="text-neutral-500 text-xs"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            No completed incidents yet
          </p>
          <p
            className="text-neutral-600 text-[11px] mt-1"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Reports are generated automatically after a monitor recovers from downtime
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidentReports.map((report, i) => (
            <IncidentReportCard
              key={report.incidentId}
              report={report}
              defaultExpanded={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProPageGate({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative bg-card border border-border rounded-2xl p-10 text-center max-w-sm w-full overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
        <div className="w-12 h-12 rounded-xl bg-[#00d294]/[0.06] border border-[#00d294]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#00d294]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-foreground text-sm font-semibold mb-1" style={{ fontFamily: "'Geist', sans-serif" }}>
          {feature}
        </p>
        <p className="text-neutral-500 text-xs mb-4" style={{ fontFamily: "'Geist Mono', monospace" }}>
          Available on Pro tier
        </p>
        <Link
          href="/pricing"
          className="inline-block text-[11px] bg-[#00d294] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#00bb7f] transition-colors"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Upgrade to Pro →
        </Link>
      </div>
    </div>
  );
}
