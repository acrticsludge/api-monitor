"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

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
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(0,255,135,0.06),transparent)]" />

        <div className="relative w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00ff87] mb-5 shadow-[0_0_32px_rgba(0,255,135,0.4)]">
            <svg
              className="w-7 h-7 text-black"
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
            className="text-neutral-500 text-[11px] mt-3 leading-relaxed tracking-wide"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Confirmation link sent to{" "}
            <span className="text-[#00ff87]">{email}</span>
            <br />
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 mt-7 text-[11px] tracking-[0.08em] uppercase text-neutral-500 hover:text-white border border-white/[0.08] hover:border-white/[0.16] rounded-lg px-4 py-2.5 transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            <svg
              className="w-3 h-3"
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(0,255,135,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_110%,rgba(0,255,135,0.03),transparent)]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#00ff87] mb-5 shadow-[0_0_24px_rgba(0,255,135,0.4)]">
            <svg
              className="w-5 h-5 text-black"
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
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Pulse
          </h1>
          <p
            className="text-[11px] tracking-[0.12em] uppercase text-neutral-500 mt-1.5"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            API Monitoring
          </p>
        </div>

        <div className="relative bg-[#0f0f0f] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/30 to-transparent" />

          <div className="px-6 pt-6 pb-2 border-b border-white/[0.05]">
            <p
              className="text-[10px] tracking-[0.15em] uppercase text-[#00ff87]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Get started
            </p>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Create account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div
                className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                className="block text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-500"
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
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-[#00ff87]/40 focus:ring-1 focus:ring-[#00ff87]/20 transition-all"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-500"
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
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-[#00ff87]/40 focus:ring-1 focus:ring-[#00ff87]/20 transition-all"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
              <p
                className="text-[10px] text-neutral-700 pt-0.5"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff87] hover:bg-[#00e87a] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold tracking-[0.08em] uppercase rounded-lg py-3 transition-all duration-150 shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_28px_rgba(0,255,135,0.35)] mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="px-6 pb-5 text-center">
            <p
              className="text-[11px] text-neutral-600"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#00ff87] hover:text-white transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p
          className="text-center text-[10px] text-neutral-700 mt-6 tracking-[0.08em] uppercase"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Pulse · API Monitor
        </p>
      </div>
    </div>
  );
}
