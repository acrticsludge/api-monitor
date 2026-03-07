"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setConfirmed(true);
    }
  }

  if (confirmed) {
    return (
      <div
        className="min-h-screen bg-[#080808] flex items-center justify-center px-4"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(0,255,135,0.07),transparent)]" />

        <div
          className="relative w-full max-w-sm text-center transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00ff87] mb-6 shadow-[0_0_40px_rgba(0,255,135,0.5)]">
            <div className="absolute inset-0 rounded-2xl bg-[#00ff87] animate-ping opacity-20" />
            <svg
              className="w-8 h-8 text-black relative z-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Check your email
          </h2>
          <p
            className="text-neutral-400 text-sm mt-3 leading-relaxed"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            We sent a link to{" "}
            <span className="text-[#00ff87] font-medium">{email}</span>
          </p>
          <p
            className="text-neutral-600 text-xs mt-1"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Click it to activate your account
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 mt-8 text-xs tracking-[0.08em] uppercase text-neutral-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-xl px-5 py-3 transition-all duration-200 hover:bg-white/[0.03]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#080808] flex items-center justify-center px-4"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(0,255,135,0.07),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_110%,rgba(0,255,135,0.03),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_80%_50%,rgba(0,255,135,0.02),transparent)]" />
      </div>

      <div
        className="relative w-full max-w-sm transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00ff87] mb-4 shadow-[0_0_28px_rgba(0,255,135,0.45)]">
            <svg
              className="w-6 h-6 text-black"
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Pulse
          </h1>
          <p
            className="text-xs tracking-[0.14em] uppercase text-neutral-500 mt-1.5"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            API Monitoring
          </p>
        </div>

        <div className="relative bg-[#0f0f0f] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />

          <div className="px-6 pt-6 pb-3 border-b border-white/[0.05]">
            <p
              className="text-[10px] tracking-[0.18em] uppercase text-[#00ff87] font-medium"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Get started
            </p>
            <h2 className="text-xl font-bold text-white mt-1">
              Create account
            </h2>
            <p
              className="text-neutral-400 text-xs mt-1"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Start monitoring your APIs in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div
                className="text-red-300 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-3 leading-relaxed"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                className="block text-xs font-semibold tracking-[0.08em] uppercase text-neutral-300"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10 transition-all duration-200"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-xs font-semibold tracking-[0.08em] uppercase text-neutral-300"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10 transition-all duration-200"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
              <p
                className="text-[11px] text-neutral-500 pt-0.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-[#00ff87] hover:bg-[#00f080] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold tracking-[0.1em] uppercase rounded-xl py-3.5 transition-all duration-200 shadow-[0_0_24px_rgba(0,255,135,0.25)] hover:shadow-[0_0_32px_rgba(0,255,135,0.45)] mt-2 overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <p
              className="text-xs text-neutral-500"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#00ff87] hover:text-white font-medium transition-colors duration-150"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p
          className="text-center text-[10px] text-neutral-700 mt-5 tracking-[0.1em] uppercase"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Pulse · API Monitor
        </p>
      </div>
    </div>
  );
}
