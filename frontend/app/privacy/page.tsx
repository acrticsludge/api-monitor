"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";
import ThemeToggle from "../../components/ThemeToggle";

export default function PrivacyPage() {
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
      className="min-h-screen bg-[#f8f8f8] dark:bg-[#080808] text-[#080808] dark:text-white"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap"
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
      <header className="sticky top-0 z-50 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#f8f8f8]/80 dark:bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
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
            <span className="text-sm font-bold tracking-[0.08em] uppercase">Pulse</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="hidden sm:block text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-[#080808] dark:hover:text-white transition-colors duration-150"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Pricing
            </Link>
            <ThemeToggle />
            <Link
              href={loggedIn ? "/dashboard" : "/login"}
              className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 border border-black/[0.08] dark:border-white/[0.08] rounded-md px-3 py-1.5 hover:text-[#080808] dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-all duration-150"
              style={{ fontFamily: "'Geist Mono', monospace" }}
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
          className="text-[11px] tracking-[0.2em] uppercase text-[#00d294] font-medium mb-4"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Legal
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
        <p
          className="text-xs text-neutral-500 mb-12"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Last updated: March 2026
        </p>

        <p
          className="text-sm text-neutral-300 leading-relaxed mb-12"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Pulse (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated as an independent project.
          This policy explains how we collect, use, and protect your data.
        </p>

        {[
          {
            n: "01",
            title: "Information We Collect",
            items: [
              "Email address (when you sign up)",
              "API endpoint URLs you add as monitors",
              "Ping results: status codes, response times, timestamps",
              "Browser push notification subscription tokens",
              "Authentication data managed by Supabase",
            ],
          },
          {
            n: "02",
            title: "How We Use Your Information",
            items: [
              "To provide the uptime monitoring service",
              "To send alerts when your monitors change status",
              "To display your ping history and uptime statistics",
              "We do not sell your data to any third party",
            ],
          },
          {
            n: "03",
            title: "Data Storage",
            items: [
              "All data is stored in Supabase (PostgreSQL) hosted on secure cloud infrastructure",
              "Authentication is handled by Supabase Auth",
              "Row-level security ensures you can only access your own data",
            ],
          },
          {
            n: "04",
            title: "Third Party Services",
            items: [
              "Supabase — database and authentication (supabase.com)",
              "Vercel — frontend hosting (vercel.com)",
              "Railway — worker hosting (railway.app)",
              "Resend — transactional email (resend.com) when email alerts are enabled",
            ],
          },
          {
            n: "05",
            title: "Data Retention",
            items: [
              "Ping history is retained for 7 days on the free tier",
              "Account data is retained until you delete your account",
              "You can request deletion of your data by contacting us",
            ],
          },
          {
            n: "06",
            title: "Cookies",
            items: [
              "We use cookies only for authentication session management via Supabase",
              "No advertising or tracking cookies are used",
            ],
          },
          {
            n: "07",
            title: "Your Rights",
            items: [
              "You have the right to access, correct, or delete your personal data",
              "Contact us to exercise these rights",
            ],
          },
        ].map((section) => (
          <div key={section.n} className="mb-10">
            <div className="flex items-baseline gap-3 mb-4">
              <span
                className="text-[#00d294] text-xs tabular-nums"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {section.n}
              </span>
              <h2 className="text-lg font-bold text-[#080808] dark:text-white">{section.title}</h2>
            </div>
            <ul className="space-y-2.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
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
              className="text-[#00d294] text-xs tabular-nums"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              08
            </span>
            <h2 className="text-lg font-bold text-white">Contact</h2>
          </div>
          <p
            className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            For privacy-related questions contact us at:{" "}
            <span className="text-[#00d294]">anubhavrai100@gmail.com</span>
          </p>
        </div>

        <div className="mb-16">
          <div className="flex items-baseline gap-3 mb-4">
            <span
              className="text-[#00d294] text-xs tabular-nums"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              09
            </span>
            <h2 className="text-lg font-bold text-white">Governing Law</h2>
          </div>
          <p
            className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            This policy is governed by the laws of India.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-[11px] text-neutral-600 tracking-[0.1em] uppercase"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Pulse · Free API monitoring
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/pricing"
              className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Pricing
            </Link>
            <Link
              href="/terms"
              className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Terms
            </Link>
            <Link
              href="/docs"
              className="text-[11px] text-neutral-500 hover:text-[#080808] dark:hover:text-white transition-colors"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Docs
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
