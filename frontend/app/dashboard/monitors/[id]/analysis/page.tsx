export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase-server";
import { getIsPro } from "../../../../lib/isPro";
import { analyzeRootCause } from "../../../../lib/rootCause";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

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

export default async function AnalysisPage({
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
    .select("id, name, url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  if (!isPro) {
    return <ProPageGate feature="Root Cause Analysis" />;
  }

  const { data: pings } = await supabase
    .from("pings")
    .select("status, status_code, response_time_ms, dns_lookup_ms, tcp_connect_ms, tls_handshake_ms, ttfb_ms, error_detail, checked_at")
    .eq("monitor_id", id)
    .order("checked_at", { ascending: false })
    .limit(100);

  const pingList = pings ?? [];
  const upPings = pingList.filter((p) => p.status === "up");

  const baseline =
    upPings.length > 0
      ? {
          dns_lookup_ms: Math.round(upPings.reduce((a, b) => a + (b.dns_lookup_ms ?? 0), 0) / upPings.length),
          tcp_connect_ms: Math.round(upPings.reduce((a, b) => a + (b.tcp_connect_ms ?? 0), 0) / upPings.length),
          tls_handshake_ms: Math.round(upPings.reduce((a, b) => a + (b.tls_handshake_ms ?? 0), 0) / upPings.length),
          ttfb_ms: Math.round(upPings.reduce((a, b) => a + (b.ttfb_ms ?? 0), 0) / upPings.length),
        }
      : {};

  // Get last 5 down pings for analysis
  const downPings = pingList.filter((p) => p.status === "down").slice(0, 5);

  const analyses = downPings.map((ping) =>
    analyzeRootCause(
      {
        dns_lookup_ms: ping.dns_lookup_ms ?? null,
        tcp_connect_ms: ping.tcp_connect_ms ?? null,
        tls_handshake_ms: ping.tls_handshake_ms ?? null,
        ttfb_ms: ping.ttfb_ms ?? null,
        response_time_ms: ping.response_time_ms ?? null,
        status_code: ping.status_code ?? null,
        error_detail: ping.error_detail ?? null,
      },
      baseline,
    ),
  ).filter(Boolean);

  const latestPing = pingList[0];
  const isCurrentlyDown = latestPing?.status === "down";

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-[11px] tracking-[0.14em] uppercase text-[#00ff87] mb-1.5 font-medium"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          &gt; root cause analysis
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Root Cause Analysis
        </h2>
        <p
          className="text-neutral-500 text-xs mt-1"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Per-stage timing breakdown for recent incidents
        </p>
      </div>

      {analyses.length === 0 ? (
        <Alert className="bg-[#00ff87]/[0.04] border-[#00ff87]/20">
          <CheckCircle className="h-4 w-4 text-[#00ff87]" />
          <AlertDescription
            className="text-[#00ff87]"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px" }}
          >
            {isCurrentlyDown
              ? "Collecting ping data for analysis..."
              : "No recent incidents — root cause analysis will appear here during or after downtime"}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {downPings.map((ping, i) => {
            const rc = analyses[i];
            if (!rc) return null;
            return (
              <div
                key={ping.checked_at}
                className="relative bg-yellow-400/[0.04] border border-yellow-400/20 rounded-2xl p-5 overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <p
                      className="text-[10px] tracking-[0.15em] uppercase text-yellow-400/70 font-medium mb-1"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {i === 0 ? "Latest incident" : `Incident ${i + 1}`} ·{" "}
                      {new Date(ping.checked_at).toLocaleString()}
                    </p>
                    <p
                      className="text-base font-bold text-foreground leading-tight"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {rc.likelyCause}
                    </p>
                  </div>
                  <span
                    className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-2.5 py-1 font-medium shrink-0"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {rc.confidence}% confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {rc.signals.map((signal) => (
                    <div key={signal.stage} className="bg-black/20 rounded-xl p-3">
                      <p
                        className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {signal.stage}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          signal.status === "critical"
                            ? "text-red-400"
                            : signal.status === "elevated"
                            ? "text-yellow-400"
                            : signal.status === "normal"
                            ? "text-[#00ff87]"
                            : "text-neutral-500"
                        }`}
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {signal.value}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          signal.status === "critical"
                            ? "text-red-400/60"
                            : signal.status === "elevated"
                            ? "text-yellow-400/60"
                            : signal.status === "normal"
                            ? "text-[#00ff87]/60"
                            : "text-neutral-600"
                        }`}
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {signal.status}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2.5 bg-black/20 rounded-xl p-3">
                  <span className="text-yellow-400 mt-0.5 flex-shrink-0">💡</span>
                  <p
                    className="text-neutral-400 text-xs leading-relaxed"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {rc.suggestion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
