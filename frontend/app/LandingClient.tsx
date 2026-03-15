"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import FeatureCarousel from "../components/FeatureCarousel";

export default function LandingClient({
  uniqueUsers,
}: {
  uniqueUsers: number;
}) {
  void uniqueUsers;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className="min-h-screen bg-[#f8f8f8] dark:bg-[#080808] text-[#080808] dark:text-white"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap"
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
            <div className="w-7 h-7 rounded-lg bg-[#00cc6a] dark:bg-[#00d294] flex items-center justify-center shadow-[0_0_16px_rgba(0,204,106,0.3)] dark:shadow-[0_0_16px_rgba(0,255,135,0.35)]">
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
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="hidden sm:block text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-[#080808] dark:hover:text-white transition-colors duration-150"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="hidden sm:block text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-[#080808] dark:hover:text-white transition-colors duration-150"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Docs
            </Link>
            <ThemeToggle />
            <Link
              href="/login"
              className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 border border-black/[0.08] dark:border-white/[0.08] rounded-md px-3 py-1.5 hover:text-[#080808] dark:hover:text-white hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-150"
              style={{ fontFamily: "'Geist Mono', monospace" }}
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cc6a] dark:bg-[#00d294] opacity-60" />
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00cc6a] dark:bg-[#00d294]" />
                </span>
                <span
                  className="text-[11px] font-medium text-[#00cc6a] dark:text-[#00d294] tracking-[0.12em] uppercase"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  monitoring active
                  <span className="cursor-blink ml-0.5">_</span>
                </span>
              </div>

              <h1
                className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.02] mb-6 fade-up"
                style={{ animationDelay: "0.08s" }}
              >
                Most monitors tell you
                <br />
                after it breaks.
                <br />
                <span className="text-[#00cc6a] dark:text-[#00d294]">
                  Pulse warns you before.
                </span>
              </h1>

              <p
                className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md fade-up"
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  animationDelay: "0.16s",
                }}
              >
                DNS breakdown, TCP timing, TLS handshake — every ping
                tracks each stage separately. Health scoring catches
                degradation before it becomes downtime. All free.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 mt-8 fade-up"
                style={{ animationDelay: "0.24s" }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-[#00cc6a] dark:bg-[#00d294] hover:bg-[#00b560] dark:hover:bg-[#00bb7f] text-black text-xs font-bold tracking-[0.08em] uppercase px-6 py-3.5 rounded-xl transition-all duration-150 shadow-[0_0_24px_rgba(0,204,106,0.3)] dark:shadow-[0_0_24px_rgba(0,255,135,0.25)] hover:shadow-[0_0_32px_rgba(0,204,106,0.45)] dark:hover:shadow-[0_0_32px_rgba(0,255,135,0.45)]"
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
              <a
                href="/docs"
                className="text-neutral-500 text-xs hover:text-neutral-400 transition-colors mt-2 block"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Read the docs →
              </a>

              {/* Social proof pills */}
              <div
                className="flex items-center gap-3 flex-wrap mt-8 fade-up"
                style={{ animationDelay: "0.3s" }}
              >
                {["Free forever", "No credit card", "60 second setup"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-neutral-500 border border-white/[0.06] rounded-full px-3 py-1"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Feature preview carousel */}
            <div
              className="relative fade-up w-full max-w-md mx-auto lg:mx-0"
              style={{ animationDelay: "0.2s" }}
            >
              <FeatureCarousel />
            </div>
          </div>
        </section>

        {/* Differentiator strip */}
        <section className="border-y border-black/[0.06] dark:border-white/[0.06] py-10 my-10">
          <div className="max-w-5xl mx-auto px-6">
            <p
              className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-600 text-center mb-8 font-medium"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              What makes Pulse different
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: "🔍",
                  title: "Catches it before it breaks",
                  body: "Health scoring and anomaly detection flag degradation when response times spike — before your API actually goes down.",
                },
                {
                  icon: "⚡",
                  title: "Tells you exactly why",
                  body: "Every incident shows a DNS, TCP, TLS, and TTFB breakdown. You know which stage failed before you open a terminal.",
                },
                {
                  icon: "📋",
                  title: "Writes the post-mortem for you",
                  body: "After every recovery, Pulse generates a complete incident report — timeline, impact estimate, response time comparison.",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="relative bg-[#f0f0f0] dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-5 overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/30 dark:via-[#00d294]/30 to-transparent" />
                  <span className="text-2xl mb-3 block">{card.icon}</span>
                  <p
                    className="text-[#080808] dark:text-white font-bold text-sm mb-2"
                    style={{ fontFamily: "'Geist', sans-serif" }}
                  >
                    {card.title}
                  </p>
                  <p
                    className="text-neutral-500 text-xs leading-relaxed"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section divider */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 whitespace-nowrap"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              What you get
            </span>
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
          </div>
        </div>

        {/* Features — joined panel layout */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.06] dark:bg-white/[0.05] rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.05]">
            {[
              {
                num: "01",
                title: "Health Score & Anomaly Detection",
                desc: "Every monitor gets a 0-100 health score based on uptime, response time trends, and variance. Anomaly detection fires a warning when response time is 2x the 7-day baseline across 3 consecutive pings — before anything actually goes down.",
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Root Cause Analysis",
                pro: true,
                desc: "When a monitor goes down, Pulse breaks the request into DNS lookup, TCP connect, TLS handshake, and time to first byte — each compared against its historical baseline. Server overload looks different from a DNS failure. Pulse tells you which one it is.",
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Auto Incident Reports",
                pro: true,
                desc: "After every recovery, Pulse generates a complete post-mortem automatically. Timeline, response time before and after, pre-incident trend, anomaly lead time, and impact estimate. One button to copy and share with your team.",
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
              },
              {
                num: "04",
                title: "Response Time Graph",
                desc: "Every ping records latency. View timeline trends and daily averages in an interactive chart — min, avg, and max included. Pro users get 30 and 90 day history.",
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
                num: "05",
                title: "Rich Alerts",
                desc: "Push notifications, Discord, and Slack webhooks include the status code, response time at failure, and a direct link to the incident. 2-ping confirmation means no false alarms from single network hiccups.",
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
                num: "06",
                title: "Public Status Pages",
                desc: "One shareable link. Your users see live status, uptime %, and health scores — no login required. Each project gets its own status page.",
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
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/25 dark:via-[#00d294]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-start justify-between mb-5">
                  <span
                    className="text-[11px] font-bold text-neutral-300 dark:text-neutral-700 tabular-nums"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    {f.num}
                  </span>
                  <div className="text-[#00cc6a] dark:text-[#00d294]">
                    {f.icon}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <h3 className="text-base font-extrabold text-[#080808] dark:text-white tracking-tight">
                    {f.title}
                  </h3>
                  {f.pro && (
                    <span
                      className="text-[9px] bg-[#00cc6a]/10 dark:bg-[#00d294]/10 text-[#00cc6a] dark:text-[#00d294] border border-[#00cc6a]/20 dark:border-[#00d294]/20 px-1.5 py-0.5 rounded-full tracking-wider uppercase font-semibold"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                    >
                      Pro
                    </span>
                  )}
                </div>
                <p
                  className="text-xs text-neutral-500 leading-relaxed"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Screenshot / UI mockup section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p
                className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-600 mb-3 font-medium"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Built for developers
              </p>
              <h2 className="text-3xl font-bold text-[#080808] dark:text-white">
                Everything you need in one place
              </h2>
              <p
                className="text-neutral-500 text-sm mt-3 max-w-md mx-auto"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Monitor detail page gives you health score, root cause analysis, response time graphs, incident reports and ping history — all in a clean layout.
              </p>
            </div>

            {/* UI mockup */}
            <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />

              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="w-2 h-2 rounded-full bg-[#00d294]" />
                    <span
                      className="text-white text-xs font-medium"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                    >
                      payments.api/status
                    </span>
                  </div>
                </div>
                <span
                  className="text-[10px] text-[#00d294] bg-[#00d294]/10 border border-[#00d294]/20 rounded-lg px-2 py-0.5"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  Operational
                </span>
              </div>

              {/* Content */}
              <div className="flex">
                {/* Sidebar — mirrors MonitorSidebar.tsx */}
                <div className="w-40 border-r border-white/[0.06] p-3 space-y-0.5 flex-shrink-0 pt-4">
                  {[
                    { label: "Overview", active: true, pro: false },
                    { label: "Response Time", active: false, pro: false },
                    { label: "Incidents", active: false, pro: false },
                    { label: "Reports", active: false, pro: true },
                    { label: "Root Cause", active: false, pro: true },
                    { label: "Ping History", active: false, pro: false },
                    { label: "SSL & Schema", active: false, pro: true },
                    { label: "Settings", active: false, pro: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${
                        item.active ? "bg-[#00d294]/10" : ""
                      } ${item.pro && !item.active ? "opacity-35" : ""}`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full flex-shrink-0 ${
                          item.active ? "bg-[#00d294]" : "bg-white/20"
                        }`}
                      />
                      <span
                        className={`text-[10px] flex-1 ${
                          item.active ? "text-[#00d294]" : "text-neutral-500"
                        }`}
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        {item.label}
                      </span>
                      {item.pro && (
                        <svg className="w-2.5 h-2.5 text-neutral-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>

                {/* Main content — mirrors monitors/[id]/page.tsx overview */}
                <div className="flex-1 p-4 overflow-hidden">
                  {/* 6 stat cards (2-col grid matching grid-cols-2 lg:grid-cols-3) */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {[
                      { label: "Status", value: "UP", color: "#00d294" },
                      { label: "Uptime", value: "99.8%", sub: "100 pings", color: "#00d294" },
                      { label: "Avg Response", value: "112ms", color: "#00d294" },
                      { label: "Last Response", value: "89ms", color: "#00d294" },
                      { label: "Last Checked", value: "2:41 PM" },
                      { label: "Check Interval", value: "5m", sub: "check interval" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="relative bg-[#0f0f0f] border border-white/[0.06] rounded-xl px-2.5 py-2 overflow-hidden"
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
                        <p
                          className="text-[8px] text-neutral-500 uppercase tracking-wider mb-1"
                          style={{ fontFamily: "'Geist Mono', monospace" }}
                        >
                          {stat.label}
                        </p>
                        <p
                          className="text-sm font-extrabold tabular-nums"
                          style={{ color: stat.color ?? "white", fontFamily: "'Geist', sans-serif" }}
                        >
                          {stat.value}
                        </p>
                        {stat.sub && (
                          <p className="text-[8px] text-neutral-600 mt-0.5" style={{ fontFamily: "'Geist Mono', monospace" }}>
                            {stat.sub}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Health Score card */}
                  <div className="relative bg-[#0f0f0f] border border-white/[0.06] rounded-xl px-3 py-2 mb-2 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
                    <p className="text-[8px] text-neutral-500 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'Geist Mono', monospace" }}>
                      Health Score
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold tabular-nums text-[#00d294]" style={{ fontFamily: "'Geist Mono', monospace" }}>94</span>
                      <span className="text-[10px] font-semibold text-[#00d294]" style={{ fontFamily: "'Geist Mono', monospace" }}>Healthy</span>
                    </div>
                  </div>

                  {/* Uptime bar */}
                  <div className="relative bg-[#0f0f0f] border border-white/[0.06] rounded-xl px-3 py-2 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
                    <div className="flex items-center gap-2">
                      <p className="text-[8px] text-neutral-500 uppercase tracking-wider whitespace-nowrap" style={{ fontFamily: "'Geist Mono', monospace" }}>
                        Uptime
                      </p>
                      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00d294] rounded-full shadow-[0_0_8px_rgba(0,255,135,0.5)]" style={{ width: "99.8%" }} />
                      </div>
                      <span className="text-[10px] font-bold text-[#00d294] tabular-nums" style={{ fontFamily: "'Geist Mono', monospace" }}>99.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <div className="flex items-center gap-4 mb-14">
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 whitespace-nowrap"
              style={{ fontFamily: "'Geist Mono', monospace" }}
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
                desc: "Paste any URL — REST APIs, health checks, webhooks, staging environments. Name it, set the check interval, add a webhook if you want. Takes 30 seconds.",
              },
              {
                n: "02",
                title: "Pulse pings it continuously",
                desc: "Our worker hits each endpoint on schedule, recording status code, response time, and per-stage timing (DNS, TCP, TLS, TTFB) on every single check.",
              },
              {
                n: "03",
                title: "Know before your users do",
                desc: "Health scoring catches degradation early. Anomaly detection fires before actual downtime. And when something does break, you already know why.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div
                  className="text-6xl font-extrabold text-[#00cc6a] dark:text-[#00d294] tabular-nums mb-4 leading-none"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {s.n}
                </div>
                <div className="w-8 h-px bg-[#00cc6a]/40 dark:bg-[#00d294]/30 mb-4" />
                <h3 className="text-base font-extrabold text-[#080808] dark:text-white mb-2.5 tracking-tight">
                  {s.title}
                </h3>
                <p
                  className="text-xs text-neutral-500 leading-relaxed"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
          <div className="relative bg-[#f0f0f0] dark:bg-[#060606] border border-black/[0.07] dark:border-white/[0.07] rounded-2xl px-8 sm:px-16 py-14 sm:py-20 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/60 dark:via-[#00d294]/60 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_110%,rgba(0,204,106,0.05),transparent)] dark:bg-[radial-gradient(ellipse_60%_80%_at_50%_110%,rgba(0,255,135,0.07),transparent)]" />
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative text-center">
              <p
                className="text-[11px] tracking-[0.18em] uppercase text-[#00d294] font-medium mb-5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Free forever
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#080808] dark:text-white mb-4 leading-tight">
                Stop finding out
                <br />
                from your users.
              </h2>
              <p
                className="text-sm text-neutral-500 dark:text-neutral-500 mb-10"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                5 monitors, health scoring, anomaly detection,
                <br />
                root cause analysis — all free. No credit card.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#00d294] hover:bg-[#00bb7f] text-black text-sm font-bold tracking-[0.08em] uppercase px-8 py-4 rounded-xl transition-all duration-150 shadow-[0_0_32px_rgba(0,255,135,0.3)] hover:shadow-[0_0_48px_rgba(0,255,135,0.5)]"
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
              <p
                className="text-neutral-600 dark:text-neutral-700 text-[11px] mt-3"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Joins developers monitoring APIs at companies like yours
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <div className="flex items-center gap-4 mb-14">
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-600 whitespace-nowrap"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              FAQ
            </span>
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.04]" />
          </div>

          <h2
            className="text-2xl font-bold text-[#080808] dark:text-white mb-8"
            style={{ fontFamily: "'Geist', sans-serif" }}
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
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00d294]/40 to-transparent rounded-t-2xl" />
                <p
                  className="text-[#080808] dark:text-white font-semibold text-sm mb-2"
                  style={{ fontFamily: "'Geist', sans-serif" }}
                >
                  {q}
                </p>
                <p
                  className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
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
              <div className="w-5 h-5 rounded-md bg-[#00cc6a] dark:bg-[#00d294] flex items-center justify-center">
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
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Pulse · Free API monitoring
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href="/pricing"
                className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Docs
              </Link>
              <Link
                href="/privacy"
                className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Terms
              </Link>
              <Link
                href="/login"
                className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-[11px] text-[#00cc6a] dark:text-[#00d294] hover:text-[#00b560] dark:hover:text-[#00bb7f] font-medium transition-colors"
                style={{ fontFamily: "'Geist Mono', monospace" }}
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
