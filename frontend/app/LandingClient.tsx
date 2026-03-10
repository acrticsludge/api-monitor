"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

const mockMonitors = [
  { name: "api.prod.com/health", status: "up", ms: 112, uptime: "100%" },
  { name: "auth.service.io/ping", status: "up", ms: 89, uptime: "99.8%" },
  { name: "payments.api/status", status: "down", ms: null, uptime: "97.2%" },
  { name: "cdn.assets.io/healthz", status: "up", ms: 34, uptime: "100%" },
];

export default function LandingClient({
  uniqueUsers,
}: {
  uniqueUsers: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className="min-h-screen bg-[#f8f8f8] dark:bg-[#080808] text-[#080808] dark:text-white"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.55s ease forwards; opacity: 0; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(0,255,135,0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.018] dark:opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#f8f8f8]/80 dark:bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
            <span className="text-sm font-bold tracking-[0.08em] uppercase">
              Pulse
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 border border-black/[0.08] dark:border-white/[0.08] rounded-md px-3 py-1.5 hover:text-[#080808] dark:hover:text-white hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-150"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main
        className="relative"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {/* Hero — split layout */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-[1fr_440px] gap-10 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div
                className="flex items-center gap-2 mb-7 fade-up"
                style={{ animationDelay: "0s" }}
              >
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cc6a] dark:bg-[#00ff87] opacity-60" />
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00cc6a] dark:bg-[#00ff87]" />
                </span>
                <span
                  className="text-[11px] font-medium text-[#00cc6a] dark:text-[#00ff87] tracking-[0.12em] uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  monitoring active
                  <span className="cursor-blink ml-0.5">_</span>
                </span>
              </div>

              <h1
                className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.02] mb-6 fade-up"
                style={{ animationDelay: "0.08s" }}
              >
                Know when
                <br />
                your APIs
                <br />
                <span className="text-[#00cc6a] dark:text-[#00ff87]">
                  go down.
                </span>
              </h1>

              <p
                className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md fade-up"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  animationDelay: "0.16s",
                }}
              >
                Add your endpoints. We ping them every 5 minutes, record
                response times, and fire an alert the moment something breaks —
                before your users ever notice.
              </p>

              <p
                className="text-xs text-neutral-600 mt-3 mb-8 fade-up"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  animationDelay: "0.2s",
                }}
              >
                Built by a developer tired of finding out about downtime from
                users, not alerts.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 fade-up"
                style={{ animationDelay: "0.24s" }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-[#00cc6a] dark:bg-[#00ff87] hover:bg-[#00b560] dark:hover:bg-[#00f080] text-black text-xs font-bold tracking-[0.08em] uppercase px-6 py-3.5 rounded-xl transition-all duration-150 shadow-[0_0_24px_rgba(0,204,106,0.3)] dark:shadow-[0_0_24px_rgba(0,255,135,0.25)] hover:shadow-[0_0_32px_rgba(0,204,106,0.45)] dark:hover:shadow-[0_0_32px_rgba(0,255,135,0.45)]"
                >
                  Start free — no card needed
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>

              {uniqueUsers > 0 && (
                <p
                  className="text-xs text-neutral-500 mt-4 fade-up"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    animationDelay: "0.3s",
                  }}
                >
                  <span className="text-[#00cc6a] dark:text-[#00ff87] font-medium">
                    {uniqueUsers} developer{uniqueUsers === 1 ? "" : "s"}
                  </span>{" "}
                  already monitoring their APIs
                </p>
              )}

              {/* Specs row */}
              <div
                className="flex items-center gap-8 mt-10 fade-up"
                style={{ animationDelay: "0.32s" }}
              >
                {[
                  { val: "5 min", label: "checks" },
                  { val: "5", label: "monitors free" },
                  { val: "0s", label: "alert delay" },
                ].map((s) => (
                  <div key={s.label}>
                    <p
                      className="text-xl font-extrabold text-[#080808] dark:text-white tabular-nums"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {s.val}
                    </p>
                    <p
                      className="text-[10px] tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-600 mt-0.5"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live monitor panel mockup */}
            <div
              className="relative fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative bg-white dark:bg-[#0d0d0d] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_64px_rgba(0,0,0,0.6)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/60 dark:via-[#00ff87]/60 to-transparent" />

                {/* Panel header */}
                <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cc6a] dark:bg-[#00ff87] opacity-60" />
                      <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00cc6a] dark:bg-[#00ff87]" />
                    </span>
                    <span
                      className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#00cc6a] dark:text-[#00ff87]"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      LIVE
                    </span>
                  </div>
                  <span
                    className="text-[10px] text-neutral-400 dark:text-neutral-600"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    4 monitors · checking every 5m
                  </span>
                </div>

                {/* Column headers */}
                <div className="px-4 py-2 flex items-center gap-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.04] dark:border-white/[0.03]">
                  <span className="w-1.5 shrink-0" />
                  <span
                    className="text-[9px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-600 flex-1"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    Endpoint
                  </span>
                  <span
                    className="text-[9px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-600 w-12 text-right"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    Latency
                  </span>
                  <span
                    className="text-[9px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-600 w-10 text-right"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    Uptime
                  </span>
                </div>

                {/* Monitor rows */}
                <div className="divide-y divide-black/[0.04] dark:divide-white/[0.03]">
                  {mockMonitors.map((m) => (
                    <div
                      key={m.name}
                      className="px-4 py-3.5 flex items-center gap-3"
                    >
                      {m.status === "up" ? (
                        <span className="relative flex w-1.5 h-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cc6a] dark:bg-[#00ff87] opacity-50" />
                          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00cc6a] dark:bg-[#00ff87]" />
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
                      )}
                      <span
                        className="text-xs text-neutral-600 dark:text-neutral-300 truncate flex-1"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {m.name}
                      </span>
                      <span
                        className={`text-[11px] font-medium tabular-nums w-12 text-right ${
                          m.ms === null
                            ? "text-red-500 dark:text-red-400"
                            : m.ms < 100
                              ? "text-[#00cc6a] dark:text-[#00ff87]"
                              : m.ms < 300
                                ? "text-[#00cc6a] dark:text-[#00ff87]"
                                : "text-yellow-500 dark:text-yellow-400"
                        }`}
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {m.ms !== null ? `${m.ms}ms` : "—"}
                      </span>
                      <span
                        className="text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums w-10 text-right"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {m.uptime}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Panel footer */}
                <div className="px-4 py-3 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.015]">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-600"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      Next check in
                    </span>
                    <span
                      className="text-[11px] font-semibold text-[#00cc6a] dark:text-[#00ff87] tabular-nums"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      4:32
                    </span>
                  </div>
                  <div className="h-1 bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00cc6a] dark:bg-[#00ff87] rounded-full transition-all"
                      style={{ width: "11%" }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section divider */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 whitespace-nowrap"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              What you get
            </span>
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
          </div>
        </div>

        {/* Features — joined panel layout */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid sm:grid-cols-3 gap-px bg-black/[0.06] dark:bg-white/[0.05] rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.05]">
            {[
              {
                num: "01",
                title: "Instant Push Notifications",
                desc: "The moment a monitor goes down, you know. Browser push notifications and webhook POSTs fire immediately on status change.",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Response Time Tracking",
                desc: "Every ping records latency. Color-coded readouts instantly show what's fast, degraded, or broken.",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Public Status Pages",
                desc: "One shareable link. Your users see live status, uptime %, and auto-refreshing data. Zero setup.",
                icon: (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
            ].map((f) => (
              <div
                key={f.num}
                className="relative bg-[#f8f8f8] dark:bg-[#080808] px-6 py-8 group hover:bg-white dark:hover:bg-[#0d0d0d] transition-colors duration-200"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/25 dark:via-[#00ff87]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-start justify-between mb-5">
                  <span
                    className="text-[11px] font-bold text-neutral-300 dark:text-neutral-700 tabular-nums"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {f.num}
                  </span>
                  <div className="text-[#00cc6a] dark:text-[#00ff87]">
                    {f.icon}
                  </div>
                </div>
                <h3 className="text-base font-extrabold text-[#080808] dark:text-white mb-2.5 tracking-tight">
                  {f.title}
                </h3>
                <p
                  className="text-xs text-neutral-500 leading-relaxed"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <div className="flex items-center gap-4 mb-14">
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 whitespace-nowrap"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              How it works
            </span>
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
          </div>

          <div className="grid sm:grid-cols-3 gap-10 sm:gap-14">
            {[
              {
                n: "01",
                title: "Add your endpoints",
                desc: "Paste any URL — REST APIs, health checks, webhooks, staging environments. Takes 10 seconds.",
              },
              {
                n: "02",
                title: "We ping every 5 minutes",
                desc: "Our worker hits each endpoint on schedule, recording the status code and latency every single time.",
              },
              {
                n: "03",
                title: "Get alerted instantly",
                desc: "The second something breaks — or recovers — you get an alert. Not a minute later. Not 5 minutes later.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div
                  className="text-6xl font-extrabold text-[#00cc6a] dark:text-[#00ff87] tabular-nums mb-4 leading-none"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {s.n}
                </div>
                <div className="w-8 h-px bg-[#00cc6a]/40 dark:bg-[#00ff87]/30 mb-4" />
                <h3 className="text-base font-extrabold text-[#080808] dark:text-white mb-2.5 tracking-tight">
                  {s.title}
                </h3>
                <p
                  className="text-xs text-neutral-500 leading-relaxed"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA — always dark */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
          <div className="relative bg-[#060606] border border-white/[0.07] rounded-2xl px-8 sm:px-16 py-14 sm:py-20 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/60 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_110%,rgba(0,255,135,0.07),transparent)]" />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative text-center">
              <p
                className="text-[11px] tracking-[0.18em] uppercase text-[#00ff87] font-medium mb-5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Free forever
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                Start monitoring
                <br />
                in 60 seconds.
              </h2>
              <p
                className="text-sm text-neutral-500 mb-10"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                5 monitors · 5 minute checks · no credit card
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#00ff87] hover:bg-[#00f080] text-black text-sm font-bold tracking-[0.08em] uppercase px-8 py-4 rounded-xl transition-all duration-150 shadow-[0_0_32px_rgba(0,255,135,0.3)] hover:shadow-[0_0_48px_rgba(0,255,135,0.5)]"
              >
                Create free account
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <div className="flex items-center gap-4 mb-14">
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 whitespace-nowrap"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              FAQ
            </span>
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
          </div>

          <h2
            className="text-2xl font-bold text-[#080808] dark:text-white mb-8"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Questions &amp; Answers
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                q: "Is this really free?",
                a: "Yes, completely free. No credit card required, no trial period. Free tier includes 5 monitors, 5-minute check intervals, push notifications, webhooks, and a public status page. We plan to offer a paid tier in the future for teams that need more — but the free tier stays free forever.",
              },
              {
                q: "How do I get notified when something goes down?",
                a: "Pulse supports browser push notifications — just click the bell icon on your dashboard and allow notifications. You can also add a Discord webhook URL to any monitor and get a formatted alert directly in your Discord server.",
              },
              {
                q: "What happens if I exceed 5 monitors?",
                a: "You'll see a message letting you know you've hit the free tier limit. We're working on a Pro plan for unlimited monitors — stay tuned.",
              },
              {
                q: "How accurate is the uptime data?",
                a: "Pulse pings your endpoints every 5 minutes from our worker server. Response time and status code are recorded on every check. This means downtime shorter than 5 minutes may not be detected — longer intervals are a Pro tier feature.",
              },
              {
                q: "Is my API data private?",
                a: "Yes. Each user can only see their own monitors and ping history. Your endpoint URLs are never shared or exposed to other users.",
              },
              {
                q: "Can I share my uptime with my users?",
                a: "Yes — every account gets a public status page at your Pulse URL /status/your-id. Share the link with your users or clients so they can see live uptime without needing an account.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="relative bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-5"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00ff87]/40 to-transparent rounded-t-2xl" />
                <p
                  className="text-[#080808] dark:text-white font-semibold text-sm mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {q}
                </p>
                <p
                  className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/[0.06] dark:border-white/[0.06] py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-[#00cc6a] dark:bg-[#00ff87] flex items-center justify-center">
                <svg
                  className="w-2.5 h-2.5 text-black"
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
              <span
                className="text-[11px] text-neutral-500 tracking-[0.1em] uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Pulse · Free API monitoring
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href="/docs"
                className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Docs
              </Link>
              <Link
                href="/login"
                className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-[11px] text-[#00cc6a] dark:text-[#00ff87] hover:text-[#00b560] dark:hover:text-[#00f080] font-medium transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Sign up free
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
