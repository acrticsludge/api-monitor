"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from "../lib/supabase";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "monitors", label: "Monitors" },
  { id: "incident-reports", label: "Incident Reports" },
  { id: "notifications", label: "Notifications" },
  { id: "webhooks", label: "Webhooks" },
  { id: "status-pages", label: "Status Pages" },
  { id: "coming-soon", label: "Coming Soon" },
];

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5 text-[#00d294] text-xs"
      style={{ fontFamily: "'Geist Mono', monospace" }}
    >
      {children}
    </code>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[#00d294]/40 pl-4 mb-6">
      <p
        className="text-[10px] tracking-[0.18em] uppercase text-[#00d294] font-medium"
        style={{ fontFamily: "'Geist Mono', monospace" }}
      >
        {children}
      </p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl font-bold text-white mb-4"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-base font-bold text-white mt-8 mb-3"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      {children}
    </h3>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm text-neutral-300 leading-relaxed"
      style={{ fontFamily: "'Geist Mono', monospace" }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.06] my-10" />;
}

function ComingSoonCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-dashed border-white/[0.1] rounded-xl p-4">
      <p
        className="text-white font-semibold text-sm"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        {title}
      </p>
      <p
        className="text-neutral-500 text-xs mt-1 leading-relaxed"
        style={{ fontFamily: "'Geist Mono', monospace" }}
      >
        {description}
      </p>
    </div>
  );
}

export default function DocsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("getting-started");
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [mounted]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileNavOpen(false);
  }

  return (
    <div
      className="min-h-screen bg-[#080808] text-white"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,255,135,0.05),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#00d294] flex items-center justify-center shadow-[0_0_16px_rgba(0,255,135,0.35)]">
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
            </Link>
            <span
              className="text-neutral-600 text-xs hidden sm:block"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              /
            </span>
            <span
              className="text-neutral-400 text-xs hidden sm:block tracking-[0.08em] uppercase"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Docs
            </span>
          </div>
          <div>
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 bg-[#00d294] hover:bg-[#00bb7f] text-black text-xs font-bold tracking-[0.06em] uppercase rounded-xl px-3.5 py-2 transition-all shadow-[0_0_16px_rgba(0,255,135,0.2)] hover:shadow-[0_0_24px_rgba(0,255,135,0.35)]"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 bg-[#00d294] hover:bg-[#00bb7f] text-black text-xs font-bold tracking-[0.06em] uppercase rounded-xl px-3.5 py-2 transition-all shadow-[0_0_16px_rgba(0,255,135,0.2)] hover:shadow-[0_0_24px_rgba(0,255,135,0.35)]"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Get started free
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Page hero */}
      <div
        className="border-b border-white/[0.06] py-12 sm:py-16 relative"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.7s",
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p
            className="text-[10px] tracking-[0.2em] uppercase text-[#00d294] font-medium mb-3"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Documentation
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "'Geist', sans-serif" }}
          >
            Everything you need to get
            <br className="hidden sm:block" /> the most out of Pulse
          </h1>
          <p
            className="text-sm text-neutral-400 max-w-lg leading-relaxed"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Guides, references, and explanations for monitoring your APIs with
            Pulse.
          </p>
        </div>
      </div>

      {/* Mobile pill nav */}
      <div
        className="sm:hidden border-b border-white/[0.06] bg-[#080808]/90 sticky top-14 z-40"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.7s 0.1s",
        }}
      >
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`shrink-0 text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border transition-all ${
                activeSection === s.id
                  ? "border-[#00d294]/40 text-[#00d294] bg-[#00d294]/[0.08]"
                  : "border-white/[0.08] text-neutral-500 hover:text-white hover:border-white/[0.16]"
              }`}
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex gap-12"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.7s 0.1s",
        }}
      >
        {/* Sidebar (desktop) */}
        <aside className="hidden sm:block w-[200px] shrink-0">
          <nav className="sticky top-28 space-y-1">
            <p
              className="text-[9px] tracking-[0.2em] uppercase text-neutral-600 mb-3 px-3"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              On this page
            </p>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs tracking-[0.05em] uppercase transition-all ${
                  activeSection === s.id
                    ? "text-[#00d294] bg-[#00d294]/[0.06]"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.03]"
                }`}
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-[680px]">
          {/* ── Getting Started ── */}
          <section id="getting-started" className="scroll-mt-28">
            <SectionLabel>01 · Getting Started</SectionLabel>
            <SectionHeading>Getting Started</SectionHeading>
            <Body>
              Pulse is a lightweight uptime and response monitoring tool for
              developers. Add your API endpoints, and Pulse pings them on a
              schedule — alerting you instantly when something goes down or
              recovers.
            </Body>
            <Body>
              There&apos;s nothing to install. Everything runs in the browser
              and through our hosted worker. You&apos;ll be monitoring your
              first endpoint in under a minute.
            </Body>

            <SubHeading>How it works</SubHeading>
            <ol
              className="space-y-3 mt-2"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                "Sign up for free — no credit card required",
                "Add your first endpoint — give it a name, URL, HTTP method, and expected status code",
                "Pulse pings it every 5 minutes automatically from our worker",
                "Get notified instantly via push notification or webhook if it goes down",
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0 text-xs mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <SubHeading>Free tier limits</SubHeading>
            <div className="space-y-2 mt-2">
              {[
                ["Up to 5 monitors", "Add up to 5 endpoints on the free plan"],
                ["5-minute check interval", "Pulse pings every 5 minutes"],
                [
                  "7-day ping history",
                  "Uptime bars and ping logs show the last 7 days",
                ],
                [
                  "Browser push notifications",
                  "Get notified in your browser on status change",
                ],
                [
                  "Webhooks",
                  "POST to any URL including Discord on status change",
                ],
                [
                  "Public status page",
                  "Share a live status page with your users",
                ],
                [
                  "Incident reports",
                  "Every resolved outage generates a structured report with timeline, root cause, and impact",
                ],
                [
                  "Post mortem reports",
                  "Copy a formatted plain-text post mortem to share with your team in one click",
                ],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="flex gap-3 items-start bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d294] mt-1.5 shrink-0" />
                  <div>
                    <p
                      className="text-xs font-semibold text-white"
                      style={{ fontFamily: "'Geist', sans-serif" }}
                    >
                      {title}
                    </p>
                    <p
                      className="text-[11px] text-neutral-500 mt-0.5"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* ── Monitors ── */}
          <section id="monitors" className="scroll-mt-28">
            <SectionLabel>02 · Monitors</SectionLabel>
            <SectionHeading>Monitors</SectionHeading>
            <Body>
              A monitor is an endpoint Pulse regularly pings to check if
              it&apos;s responding as expected. Each monitor tracks a single URL
              and reports its status, response time, and uptime history.
            </Body>

            <SubHeading>Adding a monitor</SubHeading>
            <Body>
              Click <InlineCode>Add Monitor</InlineCode> on the dashboard. Fill
              in:
            </Body>
            <div
              className="mt-4 space-y-2.5"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                ["Name", "A human-readable label, e.g. Production API"],
                [
                  "URL",
                  "The full URL to ping, e.g. https://api.example.com/health",
                ],
                ["Method", "GET, POST, or HEAD — defaults to GET"],
                [
                  "Expected status code",
                  "The HTTP status your endpoint returns when healthy (usually 200)",
                ],
                ["Check interval", "Minimum 5 minutes on the free tier"],
                [
                  "Webhook URL",
                  "Optional — Pulse will POST here on status change",
                ],
              ].map(([field, desc]) => (
                <div key={field} className="flex gap-3 text-xs leading-relaxed">
                  <span className="text-[#00d294] shrink-0 w-36">{field}</span>
                  <span className="text-neutral-400">{desc}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Body>
                Click <InlineCode>Save</InlineCode> — Pulse starts monitoring
                immediately on the next cron cycle.
              </Body>
            </div>

            <SubHeading>Editing a monitor</SubHeading>
            <Body>
              Click the <InlineCode>Edit</InlineCode> link on any monitor row
              (visible on hover on desktop, always visible on mobile). You can
              update any field including the webhook URL. Changes take effect on
              the next ping cycle.
            </Body>

            <SubHeading>Pausing a monitor</SubHeading>
            <Body>
              Click <InlineCode>Pause</InlineCode> on any monitor row to stop
              pinging it. No alerts will fire while paused, and the monitor will
              disappear from your public status page. Resume anytime with{" "}
              <InlineCode>Resume</InlineCode>.
            </Body>

            <SubHeading>False positive protection</SubHeading>
            <Body>
              Pulse requires 2 consecutive failed pings before firing a down
              alert. A single timeout or network blip won&apos;t wake you up at
              3am. Once 2 pings in a row fail, an alert fires immediately and is
              logged to your incident history.
            </Body>

            <SubHeading>Anomaly Detection</SubHeading>
            <Body>
              Pulse monitors response time trends and alerts you when performance
              degrades — even before your endpoint goes down. If your API&apos;s
              response time is consistently 2x slower than its 7-day baseline
              for 3 or more consecutive checks, you&apos;ll get a push
              notification and a warning on your dashboard. Anomaly alerts appear
              in your monitor&apos;s incident log alongside regular down/recovered
              events.
            </Body>

            <SubHeading>Health Score</SubHeading>
            <Body>
              Every monitor gets a live health score — Healthy, Degraded, or
              Critical — shown as a badge on your dashboard and monitor detail
              page. The score factors in recent uptime, consecutive failures, and
              whether response times are stable. It gives you an at-a-glance
              signal beyond just up/down.
            </Body>

            <SubHeading>Response Time Graph</SubHeading>
            <Body>
              The monitor detail page includes a response time chart with two
              views: <InlineCode>Timeline</InlineCode> plots every recorded ping
              over the last 7 days so you can spot spikes at a glance, and{" "}
              <InlineCode>Daily Average</InlineCode> shows a bar chart of average
              latency per day. Min, avg, and max for the period are shown above
              the chart.
            </Body>

            <SubHeading>Monitor detail page</SubHeading>
            <Body>
              Click any monitor name to open its detail page. Here you can:
            </Body>
            <ul
              className="mt-3 space-y-2"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                "View the 7-day uptime bar with daily breakdown and hover tooltips",
                "See response time trends — timeline chart and 7-day daily average bar chart",
                "Check your monitor's health score (Healthy / Degraded / Critical)",
                "See full ping history with status codes and response times",
                "Review incident reports — timeline, root cause analysis, response time comparison, and estimated impact per outage",
                "Copy a post mortem report to your clipboard with one click",
                "Trigger an immediate manual ping with Check Now",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          {/* ── Incident Reports ── */}
          <section id="incident-reports" className="scroll-mt-28">
            <SectionLabel>03 · Incident Reports</SectionLabel>
            <SectionHeading>Incident Reports</SectionHeading>

            {/* Pro callout */}
            <div className="flex items-start gap-3 bg-[#00d294]/[0.04] border border-[#00d294]/20 rounded-xl px-4 py-3 mb-5">
              <span className="text-[#00d294] text-sm shrink-0 mt-0.5">⚡</span>
              <p
                className="text-xs font-semibold text-[#00d294]"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Pro feature
              </p>
            </div>

            <Body>
              Every time a monitor goes down and recovers, Pulse automatically
              generates a structured incident report. No configuration required —
              reports appear in your monitor&apos;s detail page as soon as the
              outage is resolved.
            </Body>

            <SubHeading>What each report contains</SubHeading>
            <div className="space-y-2 mt-2">
              {[
                ["Timeline", "Exact start time, resolution time, and total downtime in minutes"],
                ["Error", "The HTTP status code returned during the outage (or Timeout if the endpoint was unreachable)"],
                ["Root Cause", "Pulse analyzes the error code and response patterns to suggest a likely cause — e.g. server overload, authentication failure, or upstream dependency — along with a confidence percentage"],
                ["Response time comparison", "Baseline (7-day average), response at time of failure, and response at recovery — so you can see whether performance recovered fully"],
                ["Anomaly warning", "A yellow banner appears if Pulse detected a response time spike before the incident, indicating the degradation was visible before the outage"],
                ["Impact estimate", "Number of failed checks during the outage, and an estimated count of requests likely affected based on check interval"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="flex gap-3 items-start bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d294] mt-1.5 shrink-0" />
                  <div>
                    <p
                      className="text-xs font-semibold text-white"
                      style={{ fontFamily: "'Geist', sans-serif" }}
                    >
                      {title}
                    </p>
                    <p
                      className="text-[11px] text-neutral-500 mt-0.5"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <SubHeading>Root Cause Analysis</SubHeading>
            <Body>
              Pulse classifies HTTP errors to surface the most likely explanation
              for each incident. Examples:
            </Body>
            <div
              className="mt-4 space-y-2"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                ["5xx errors", "Server-side failures — overload, crashes, or upstream dependency issues"],
                ["401 / 403", "Authentication or authorization problems — expired tokens, missing credentials"],
                ["404", "Endpoint removed or URL changed"],
                ["408 / timeout", "Network congestion, DNS resolution failure, or server unresponsive"],
                ["429", "Rate limiting — the pinging IP is being throttled"],
              ].map(([code, desc]) => (
                <div key={code} className="flex gap-3 text-xs leading-relaxed">
                  <span className="text-[#00d294] shrink-0 w-28">{code}</span>
                  <span className="text-neutral-400">{desc}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Body>
                Each classification includes a confidence score. Lower confidence
                appears when the error could have multiple explanations.
              </Body>
            </div>

            <SubHeading>Post Mortem Reports</SubHeading>
            <Body>
              Expand any incident report and click{" "}
              <InlineCode>Copy incident report</InlineCode> to copy a formatted
              plain-text post mortem to your clipboard. The report includes
              monitor name, URL, full timeline, root cause, response time
              comparison, and impact estimate — ready to paste into Slack, Notion,
              a ticket, or an email.
            </Body>

            <SubHeading>Where to find them</SubHeading>
            <Body>
              Open any monitor&apos;s detail page and scroll to the{" "}
              <InlineCode>Incidents</InlineCode> section. Each resolved incident
              appears as a collapsible card showing the start time, duration, and
              HTTP status. Click a card to expand the full report.
            </Body>

            <SubHeading>Notes</SubHeading>
            <ul
              className="mt-2 space-y-2"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                "Incident reports are only generated for resolved incidents — an ongoing outage shows the start time and \"Ongoing\" for the end time",
                "Reports require the 2-consecutive-ping confirmation — a single blip will not generate an incident",
                "If anomaly detection flagged the monitor before the outage, the incident report will note this",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          {/* ── Notifications ── */}
          <section id="notifications" className="scroll-mt-28">
            <SectionLabel>04 · Notifications</SectionLabel>
            <SectionHeading>Notifications</SectionHeading>
            <Body>
              Pulse sends browser push notifications the moment a monitor
              changes status — no app required, no email setup needed.
            </Body>

            <SubHeading>Enabling push notifications</SubHeading>
            <ol
              className="mt-3 space-y-3"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                <>
                  Click the bell icon <InlineCode>🔔</InlineCode> in the
                  dashboard header
                </>,
                "Click Allow when your browser prompts for notification permission",
                "You'll receive a system notification when any monitor goes down or recovers",
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0 text-xs mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <SubHeading>Browser support</SubHeading>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                ["Chrome", "✓", true],
                ["Edge", "✓", true],
                ["Firefox", "✓", true],
                ["Android Chrome", "✓", true],
                ["iOS Safari", "✗", false],
                ["Safari (macOS)", "Partial", null],
              ].map(([browser, status, supported]) => (
                <div
                  key={String(browser)}
                  className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2"
                >
                  <span
                    className="text-xs text-neutral-400"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    {browser}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      supported === true
                        ? "text-[#00d294]"
                        : supported === false
                          ? "text-[#fb2c36]"
                          : "text-[#f99c00]"
                    }`}
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>

            <SubHeading>Re-enabling blocked notifications</SubHeading>
            <Body>
              If you accidentally blocked notifications, go to your browser
              settings → Site permissions → Notifications → find this site →
              change to Allow. Then click the bell icon again to re-subscribe.
            </Body>
          </section>

          <Divider />

          {/* ── Webhooks ── */}
          <section id="webhooks" className="scroll-mt-28">
            <SectionLabel>05 · Webhooks</SectionLabel>
            <SectionHeading>Webhooks</SectionHeading>
            <Body>
              A webhook is a URL on your server or a third-party service that
              Pulse will POST to whenever a monitor changes status. One webhook
              URL per monitor.
            </Body>

            <SubHeading>Adding a webhook</SubHeading>
            <Body>
              When adding or editing a monitor, paste a URL into the optional{" "}
              <InlineCode>Webhook URL</InlineCode> field. Pulse will POST to
              that URL on every status change — both when a monitor goes down
              and when it recovers.
            </Body>

            <SubHeading>Discord webhooks</SubHeading>
            <Body>
              Pulse auto-detects Discord webhook URLs and sends a formatted
              embed message instead of a raw JSON body.
            </Body>
            <ol
              className="mt-3 space-y-3"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                "Open your Discord server",
                "Go to channel settings → Integrations → Webhooks",
                "Create a new webhook and copy the URL",
                "Paste the URL into the Webhook URL field on any monitor",
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0 text-xs mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p
              className="text-sm text-neutral-400 mt-4 leading-relaxed"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              You&apos;ll get a <span className="text-[#fb2c36]">red embed</span>{" "}
              when a monitor goes down and a{" "}
              <span className="text-[#00d294]">green embed</span> when it
              recovers.
            </p>

            <SubHeading>Slack webhooks</SubHeading>
            <Body>
              Pulse auto-detects Slack incoming webhook URLs and sends a
              formatted attachment message instead of a raw JSON body.
            </Body>
            <ol
              className="mt-3 space-y-3"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                "Go to api.slack.com/apps → Create an app → Incoming Webhooks",
                "Enable Incoming Webhooks and add it to your workspace channel",
                "Copy the Webhook URL (starts with hooks.slack.com)",
                "Paste it into the Webhook URL field on any monitor",
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0 text-xs mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <SubHeading>Generic webhooks</SubHeading>
            <Body>
              For custom servers, Zapier, Make, or any other service, Pulse
              sends a JSON body:
            </Body>
            <div className="mt-4 bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-4 text-xs text-neutral-300 overflow-x-auto">
              <pre style={{ fontFamily: "'Geist Mono', monospace" }}>{`{
  "monitor_id": "uuid",
  "monitor_name": "My API",
  "monitor_url": "https://api.example.com",
  "type": "down" | "recovered",
  "status_code": 503,
  "last_response_time_ms": 1240,
  "expected_status_code": 200,
  "timestamp": "2026-01-01T00:00:00.000Z"
}`}</pre>
            </div>

            <SubHeading>Notes</SubHeading>
            <ul
              className="mt-2 space-y-2"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                "One webhook URL per monitor",
                "Webhook failures are logged but do not affect monitoring or alerts",
                "Webhooks fire on every status change — both down and recovered",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          {/* ── Status Pages ── */}
          <section id="status-pages" className="scroll-mt-28">
            <SectionLabel>06 · Status Pages</SectionLabel>
            <SectionHeading>Status Pages</SectionHeading>
            <Body>
              Every Pulse account comes with a public status page — a live URL
              you can share with your users, clients, or team. No login required
              to view it.
            </Body>

            <SubHeading>Finding your status page URL</SubHeading>
            <Body>
              On the dashboard, scroll down to the{" "}
              <InlineCode>Share status page</InlineCode> section. Your URL looks
              like:
            </Body>
            <div className="mt-4 bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-4 text-xs text-neutral-300 overflow-x-auto">
              <pre style={{ fontFamily: "'Geist Mono', monospace" }}>
                {`${origin || ""}/status/[your-user-id]`}
              </pre>
            </div>
            <p
              className="text-sm text-neutral-400 mt-3 leading-relaxed"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Click the copy button next to the URL to copy it to your
              clipboard.
            </p>

            <SubHeading>What the status page shows</SubHeading>
            <ul
              className="mt-2 space-y-2"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                "Overall system status banner — All systems operational, Degraded, or Outage",
                "Each active monitor with name, current status indicator, and uptime %",
                "A 7-day uptime bar (4 segments per day showing 6-hour windows)",
                "Auto-refreshes every 60 seconds",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <SubHeading>Notes</SubHeading>
            <ul
              className="mt-2 space-y-2"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {[
                "Paused monitors do not appear on the status page",
                "No login or account required to view a status page",
                "The status page is publicly indexed — share the URL freely",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-neutral-300 leading-relaxed"
                >
                  <span className="text-[#00d294] shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          {/* ── Coming Soon ── */}
          <section id="coming-soon" className="scroll-mt-28">
            <SectionLabel>07 · Coming Soon</SectionLabel>
            <SectionHeading>What&apos;s Coming in V2</SectionHeading>
            <p
              className="text-sm text-neutral-500 leading-relaxed mb-8"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              These features are planned for upcoming releases. The free tier
              stays free.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <ComingSoonCard
                title="Email alerts"
                description="Get notified by email when a monitor goes down or recovers. Requires custom domain setup."
              />
              <ComingSoonCard
                title="Unlimited monitors"
                description="Pro tier removes the 5-monitor limit so you can monitor everything."
              />
              <ComingSoonCard
                title="1-minute check intervals"
                description="Pro tier enables more frequent pinging for critical endpoints."
              />
              <ComingSoonCard
                title="30 and 90 day history"
                description="Longer ping history retention for trend analysis and reporting."
              />
              <ComingSoonCard
                title="SSL certificate monitoring"
                description="Get alerted before your SSL certificate expires so you never go dark."
              />
              <ComingSoonCard
                title="Custom status page domain"
                description="Use your own domain for your status page instead of the default URL."
              />
              <ComingSoonCard
                title="CSV export"
                description="Export your full ping history as a CSV for analysis or reporting."
              />
              <ComingSoonCard
                title="Account & billing page"
                description="Manage your subscription, payment details, and account settings."
              />
            </div>

            <div
              className="mt-8 text-sm text-neutral-500 leading-relaxed"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Have a feature request? We&apos;d love to hear it.{" "}
              <a
                href="mailto:anubhavrai100@gmail.com"
                className="text-[#00d294] hover:text-[#00bb7f] transition-colors underline underline-offset-4 decoration-[#00d294]/30"
              >
                Send us a message
              </a>
              .
            </div>
          </section>

          <div className="h-20" />
        </main>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-[11px] text-neutral-600 tracking-[0.1em] uppercase"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Pulse · Free API monitoring
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/pricing"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
