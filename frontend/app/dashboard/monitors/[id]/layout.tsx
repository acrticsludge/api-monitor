import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";
import MonitorSidebar from "./MonitorSidebar";

export default async function MonitorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
    .select("id, name, url, is_active, method, check_interval_minutes")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) notFound();

  const { data: latestPing } = await supabase
    .from("pings")
    .select("status, response_time_ms, checked_at")
    .eq("monitor_id", id)
    .order("checked_at", { ascending: false })
    .limit(1)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  const isPro = profile?.is_pro ?? false;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Geist', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Fixed subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,255,135,0.04),transparent)]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="text-neutral-600 hover:text-neutral-400 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-px h-4 bg-border flex-shrink-0" />
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                latestPing?.status === "up" ? "bg-[#00d294]" : "bg-[#fb2c36]"
              }`}
            />
            <div className="min-w-0">
              <h1
                className="text-foreground font-bold text-sm truncate"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                {monitor.name}
              </h1>
              <p
                className="text-neutral-600 text-[11px] truncate max-w-xs hidden sm:block"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {monitor.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {isPro && (
              <span
                className="text-[10px] bg-[#00d294]/10 text-[#00d294] border border-[#00d294]/20 rounded-lg px-2 py-1 font-medium"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                PRO
              </span>
            )}
            <span
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                latestPing?.status === "up"
                  ? "text-[#00d294] bg-[#00d294]/10 border-[#00d294]/20"
                  : latestPing
                  ? "text-[#fb2c36] bg-[#fb2c36]/10 border-[#fb2c36]/20"
                  : "text-neutral-500 bg-muted/30 border-border"
              }`}
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {latestPing?.status === "up"
                ? "Operational"
                : latestPing?.status === "down"
                ? "Down"
                : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row">
        <MonitorSidebar monitorId={id} isPro={isPro} />
        <main className="flex-1 min-w-0 p-5 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
