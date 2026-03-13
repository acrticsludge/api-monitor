"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  return (
    <div
      className="min-h-screen bg-[#080808] text-white"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(0,255,135,0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
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
            <span className="text-sm font-bold tracking-[0.08em] uppercase">
              Pulse
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="hidden sm:block text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-400 hover:text-white transition-colors duration-150"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Docs
            </Link>
            <Link
              href={loggedIn ? "/dashboard" : "/login"}
              className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-400 border border-white/[0.08] rounded-md px-3 py-1.5 hover:text-white hover:border-white/20 transition-all duration-150"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {loggedIn ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      <main
        className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {/* Page header */}
        <div className="text-center mb-14">
          <p
            className="text-[11px] tracking-[0.2em] uppercase text-[#00ff87] font-medium mb-4"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p
            className="text-sm text-neutral-400 max-w-md mx-auto"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {/* Free plan */}
          <div className="relative bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/30 to-transparent rounded-t-2xl" />
            <p
              className="text-[11px] tracking-[0.18em] uppercase text-neutral-500 mb-3"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Free
            </p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span
                className="text-neutral-500 mb-1"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }}
              >
                / month
              </span>
            </div>
            <p
              className="text-xs text-neutral-600 mb-8"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              No credit card required
            </p>
            <Link
              href="/signup"
              className="block text-center bg-[#00ff87] hover:bg-[#00f080] text-black text-xs font-bold tracking-[0.08em] uppercase px-6 py-3.5 rounded-xl transition-all duration-150 shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_28px_rgba(0,255,135,0.35)] mb-8"
            >
              Get started free
            </Link>
            <ul className="space-y-3">
              {[
                { label: "1 project · 5 monitors" },
                { label: "5 minute check intervals" },
                { label: "2-ping confirmation before alerting" },
                { label: "Browser push notifications" },
                { label: "Discord & Slack webhook alerts" },
                { label: "Rich alert context (status code, response time)" },
                { label: "Public status page" },
                { label: "Health scoring" },
                { label: "Anomaly detection" },
                { label: "Response time graphs (7 days)" },
                { label: "7 day ping history" },
                {
                  label: "Incident reports (timeline, impact, response times)",
                  beta: true,
                },
                {
                  label: "Root cause analysis with confidence score",
                  beta: true,
                },
                { label: "Copyable post mortem reports", beta: true },
              ].map(({ label, beta }) => (
                <li
                  key={label}
                  className="flex items-start gap-3 text-sm text-neutral-300"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "12px",
                  }}
                >
                  <span className="text-[#00ff87] shrink-0 mt-0.5">✓</span>
                  <span className="flex items-center gap-2 flex-wrap">
                    {label}
                    {beta && (
                      <span className="text-[9px] bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/20 px-1.5 py-0.5 rounded-full tracking-wider uppercase font-semibold">
                        Pro · Free in beta
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro plan */}
          <div className="relative bg-[#0f0f0f] border border-[#00ff87]/30 rounded-2xl p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/60 to-transparent rounded-t-2xl" />
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-[11px] tracking-[0.18em] uppercase text-[#00ff87]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Pro
              </p>
              <span
                className="text-[10px] bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/20 px-2 py-0.5 rounded-full tracking-wider uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Recommended for side projects
              </span>
            </div>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-extrabold text-white">$9</span>
              <span
                className="text-neutral-500 mb-1"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }}
              >
                / month
              </span>
            </div>
            <p
              className="text-xs text-neutral-600 mb-8"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              &nbsp;
            </p>
            <button
              disabled
              className="block w-full text-center bg-white/[0.04] border border-white/[0.08] text-neutral-500 text-xs font-bold tracking-[0.08em] uppercase px-6 py-3.5 rounded-xl cursor-not-allowed mb-8"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Coming Soon
            </button>
            <p
              className="text-[11px] text-neutral-600 mb-4"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Everything in Free, plus:
            </p>
            <ul className="space-y-3">
              {[
                "Unlimited monitors",
                "1 minute check intervals",
                "Email alerts",
                "30 & 90 day history",
                "SSL certificate monitoring",
                "Custom status page domain",
                "CSV export",
                "More features yet to be decided",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-neutral-300"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "12px",
                  }}
                >
                  <span className="text-[#00ff87] shrink-0 mt-0.5">⚡</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Note below cards */}
        <p
          className="text-center text-xs text-neutral-600 mb-20"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Pro tier is in development. Free tier stays free forever.
        </p>

        {/* FAQ */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-white/[0.04]" />
          <span
            className="text-[10px] tracking-[0.15em] uppercase text-neutral-600 whitespace-nowrap"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            FAQ
          </span>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-20">
          {[
            {
              q: "Is the free tier really free forever?",
              a: "Yes. No trial period, no credit card required. The free tier is permanent. We plan to sustain it through Pro tier subscriptions.",
            },
            {
              q: "When will Pro be available?",
              a: "We're actively building Pro tier features. Join the free tier now and you'll be notified when Pro launches.",
            },
            {
              q: "What payment methods will you accept?",
              a: "We'll support all major credit and debit cards via Lemon Squeezy when Pro launches.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="relative bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/30 to-transparent rounded-t-2xl" />
              <p
                className="text-white font-semibold text-sm mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {q}
              </p>
              <p
                className="text-neutral-400 text-xs leading-relaxed"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {a}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-[11px] text-neutral-600 tracking-[0.1em] uppercase"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Pulse · Free API monitoring
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/docs"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Docs
            </Link>
            <Link
              href="/privacy"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Terms
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
