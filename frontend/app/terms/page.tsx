"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";

export default function TermsPage() {
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(0,255,135,0.06),transparent)]" />
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
            <span className="text-sm font-bold tracking-[0.08em] uppercase">Pulse</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="hidden sm:block text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-400 hover:text-white transition-colors duration-150"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Pricing
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
        className="relative max-w-[680px] mx-auto px-4 sm:px-6 py-16 sm:py-24"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        <p
          className="text-[11px] tracking-[0.2em] uppercase text-[#00ff87] font-medium mb-4"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Legal
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
        <p
          className="text-xs text-neutral-500 mb-12"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Last updated: March 2026
        </p>

        <p
          className="text-sm text-neutral-300 leading-relaxed mb-12"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          By using Pulse (&quot;the Service&quot;), you agree to these terms. The Service is
          operated independently under the name Pulse.
        </p>

        {[
          {
            n: "01",
            title: "Use of the Service",
            items: [
              "You must be 13 years or older to use Pulse",
              "You are responsible for the endpoints you monitor",
              "You may not use Pulse to monitor systems you do not own or have permission to monitor",
              "You may not attempt to abuse, overload, or disrupt the Service",
            ],
          },
          {
            n: "02",
            title: "Free Tier",
            items: [
              "The free tier is provided at no cost and may be used indefinitely",
              "We reserve the right to apply fair use limits if usage is abusive",
              "Free tier features may change but we will provide reasonable notice",
            ],
          },
          {
            n: "03",
            title: "Accounts",
            items: [
              "You are responsible for keeping your account credentials secure",
              "You are responsible for all activity under your account",
              "We reserve the right to suspend accounts that violate these terms",
            ],
          },
          {
            n: "04",
            title: "Monitoring and Alerts",
            items: [
              "Pulse provides uptime monitoring on a best-effort basis",
              "We do not guarantee 100% alert delivery or monitoring uptime",
              "Alert delivery depends on third party services (push notifications, webhooks) outside our control",
              "Pulse is not liable for any damages resulting from missed alerts or monitoring gaps",
            ],
          },
          {
            n: "05",
            title: "Data",
            items: [
              "You retain ownership of your data",
              "By using the Service you grant us the right to store and process your data to provide the Service",
              "We do not sell your data",
            ],
          },
          {
            n: "06",
            title: "Intellectual Property",
            items: [
              "Pulse and its branding are the property of the operator",
              "You may not copy, reproduce, or redistribute the Service",
            ],
          },
          {
            n: "07",
            title: "Limitation of Liability",
            items: [
              'The Service is provided "as is" without warranties of any kind',
              "We are not liable for any indirect, incidental, or consequential damages",
              "Our total liability to you shall not exceed the amount you paid us in the last 12 months",
            ],
          },
          {
            n: "08",
            title: "Changes to Terms",
            items: [
              "We may update these terms at any time",
              "Continued use of the Service after changes constitutes acceptance",
            ],
          },
        ].map((section) => (
          <div key={section.n} className="mb-10">
            <div className="flex items-baseline gap-3 mb-4">
              <span
                className="text-[#00ff87] text-xs tabular-nums"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {section.n}
              </span>
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
            </div>
            <ul className="space-y-2.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-neutral-300 text-sm leading-relaxed"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  <span className="text-neutral-600 shrink-0 mt-0.5">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-4">
            <span
              className="text-[#00ff87] text-xs tabular-nums"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              09
            </span>
            <h2 className="text-lg font-bold text-white">Governing Law</h2>
          </div>
          <p
            className="text-neutral-300 text-sm leading-relaxed"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            These terms are governed by the laws of India. Any disputes shall be
            subject to the jurisdiction of courts in India.
          </p>
        </div>

        <div className="mb-16">
          <div className="flex items-baseline gap-3 mb-4">
            <span
              className="text-[#00ff87] text-xs tabular-nums"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              10
            </span>
            <h2 className="text-lg font-bold text-white">Contact</h2>
          </div>
          <p
            className="text-neutral-300 text-sm leading-relaxed"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            For questions about these terms:{" "}
            <span className="text-[#00ff87]">anubhavrai100@gmail.com</span>
          </p>
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
              href="/pricing"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Privacy
            </Link>
            <Link
              href="/docs"
              className="text-[11px] text-neutral-500 hover:text-white transition-colors"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Docs
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
