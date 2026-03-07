"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
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
              Welcome back
            </p>
            <h2 className="text-xl font-bold text-white mt-1">Sign in</h2>
            <p
              className="text-neutral-400 text-xs mt-1"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Monitor your APIs from one place
            </p>
          </div>

          <div className="px-6 pt-5">
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.05] hover:bg-white/[0.08] disabled:opacity-40 border border-white/[0.1] hover:border-white/[0.18] rounded-xl py-3 transition-all duration-200 group"
            >
              {googleLoading ? (
                <svg
                  className="w-4 h-4 animate-spin text-neutral-400"
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
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span
                className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {googleLoading ? "Redirecting..." : "Continue with Google"}
              </span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span
                className="text-[10px] text-neutral-600 tracking-widest uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                or
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-5 space-y-4">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10 transition-all duration-200"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
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
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
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
              No account?{" "}
              <Link
                href="/signup"
                className="text-[#00ff87] hover:text-white font-medium transition-colors duration-150"
              >
                Sign up
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
