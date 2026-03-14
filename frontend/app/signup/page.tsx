"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";
import ThemeToggle from "../../components/ThemeToggle";

const features = [
  { icon: "📡", title: "Uptime Monitoring", desc: "5 monitors, pinged every 5 minutes automatically" },
  { icon: "🔔", title: "Push Notifications", desc: "Browser alerts the moment something goes down" },
  { icon: "🎯", title: "Smart Alerting", desc: "2-ping confirmation — no false alarms" },
  { icon: "💬", title: "Discord & Slack", desc: "Webhook alerts with status code and response time" },
  { icon: "❤️", title: "Health Scoring", desc: "0-100 score showing degradation before outages" },
  { icon: "⚠️", title: "Anomaly Detection", desc: "Warns you when response time spikes 2x baseline" },
  { icon: "📈", title: "Response Time Graphs", desc: "7-day timeline and daily average charts" },
  { icon: "🌐", title: "Public Status Page", desc: "Shareable uptime page for your users and clients" },
  { icon: "🔍", title: "Root Cause Analysis", desc: "Know why your API failed — DNS, TCP, TLS, or server overload", highlight: true },
  { icon: "📋", title: "Auto Incident Reports", desc: "Full post-mortem generated automatically after every outage", highlight: true },
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Feature overview states
  const [showOverview, setShowOverview] = useState(true);
  const [overviewFading, setOverviewFading] = useState(false);
  const [featureVisible, setFeatureVisible] = useState<boolean[]>(
    new Array(features.length).fill(false)
  );
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stagger feature cards
  useEffect(() => {
    if (!showOverview) return;
    features.forEach((_, i) => {
      setTimeout(() => {
        setFeatureVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 100 + i * 80);
    });
  }, [showOverview]);

  // Show button after all cards animated in
  useEffect(() => {
    if (!showOverview) return;
    const total = 100 + features.length * 80 + 200;
    const timer = setTimeout(() => setShowButton(true), total);
    return () => clearTimeout(timer);
  }, [showOverview]);

  function handleLetsGo() {
    setOverviewFading(true);
    setTimeout(() => setShowOverview(false), 400);
  }

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

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  const bgAndKeyframes = (
    <>
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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(0,255,135,0.07),transparent)]" />
        <div className="absolute inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_40%_40%_at_50%_110%,rgba(0,255,135,0.03),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.018] dark:opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
    </>
  );

  if (confirmed) {
    return (
      <div
        className="min-h-screen bg-[#f8f8f8] dark:bg-[#080808] flex items-center justify-center px-4"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        {bgAndKeyframes}
        <div
          className="relative w-full max-w-sm text-center fade-up"
          style={{ animationDelay: "0s" }}
        >
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00cc6a] dark:bg-[#00d294] mb-6 shadow-[0_0_40px_rgba(0,204,106,0.4)] dark:shadow-[0_0_40px_rgba(0,255,135,0.5)]">
            <div className="absolute inset-0 rounded-2xl bg-[#00cc6a] dark:bg-[#00d294] animate-ping opacity-20" />
            <svg
              className="w-8 h-8 text-black relative z-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p
            className="text-[11px] tracking-[0.14em] uppercase text-[#00cc6a] dark:text-[#00d294] mb-3 font-medium"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            &gt; account created
            <span className="cursor-blink ml-0.5">_</span>
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#080808] dark:text-white">
            Check your email
          </h2>
          <p
            className="text-neutral-500 dark:text-neutral-400 text-sm mt-3 leading-relaxed"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            We sent a link to{" "}
            <span className="text-[#00cc6a] dark:text-[#00d294] font-medium">{email}</span>
          </p>
          <p
            className="text-neutral-400 dark:text-neutral-600 text-xs mt-1"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Click it to activate your account
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 mt-8 text-xs tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-[#080808] dark:hover:text-white border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.16] dark:hover:border-white/20 rounded-xl px-5 py-3 transition-all duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f8f8f8] dark:bg-[#080808] flex items-center justify-center px-4"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      {bgAndKeyframes}

      {showOverview ? (
        <div
          className="relative w-full max-w-2xl py-12"
          style={{
            opacity: overviewFading ? 0 : 1,
            transform: overviewFading ? "translateY(-8px)" : "translateY(0)",
            transition: "opacity 400ms ease, transform 400ms ease",
          }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00cc6a] dark:bg-[#00d294] mb-4 shadow-[0_0_28px_rgba(0,204,106,0.35)] dark:shadow-[0_0_28px_rgba(0,255,135,0.45)]">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#080808] dark:text-white" style={{ fontFamily: "'Geist', sans-serif" }}>
              Pulse
            </h1>
            <p className="text-xs tracking-[0.14em] uppercase text-neutral-500 mt-1.5" style={{ fontFamily: "'Geist Mono', monospace" }}>
              Here&apos;s what you get — free, forever
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`relative flex items-start gap-3 rounded-xl p-4 overflow-hidden ${
                  feature.highlight
                    ? "bg-[#00d294]/[0.04] border border-[#00cc6a]/30 dark:border-[#00d294]/30"
                    : "bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06]"
                }`}
                style={{
                  opacity: featureVisible[index] ? 1 : 0,
                  transform: featureVisible[index] ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 700ms ease, transform 700ms ease",
                }}
              >
                {feature.highlight && (
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/60 dark:via-[#00d294]/60 to-transparent" />
                )}
                <span className="text-lg flex-shrink-0">{feature.icon}</span>
                <div>
                  <p
                    className={`text-sm font-semibold ${feature.highlight ? "text-[#00cc6a] dark:text-[#00d294]" : "text-[#080808] dark:text-white"}`}
                    style={{ fontFamily: "'Geist', sans-serif" }}
                  >
                    {feature.title}
                    {feature.highlight && (
                      <span
                        className="text-[9px] bg-[#00cc6a]/10 dark:bg-[#00d294]/10 text-[#00cc6a] dark:text-[#00d294] border border-[#00cc6a]/20 dark:border-[#00d294]/20 rounded-full px-1.5 py-0.5 font-medium ml-2 align-middle tracking-wider uppercase"
                        style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                        Pro · Free in beta
                      </span>
                    )}
                  </p>
                  <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed" style={{ fontFamily: "'Geist Mono', monospace" }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Let's go button */}
          <div
            className="mt-8 text-center"
            style={{
              opacity: showButton ? 1 : 0,
              transform: showButton ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 500ms ease, transform 500ms ease",
            }}
          >
            <button
              onClick={handleLetsGo}
              className="relative bg-[#00cc6a] dark:bg-[#00d294] hover:bg-[#00b560] dark:hover:bg-[#00bb7f] text-black text-xs font-bold tracking-[0.1em] uppercase rounded-xl px-10 py-3.5 transition-all duration-200 shadow-[0_0_24px_rgba(0,204,106,0.2)] dark:shadow-[0_0_24px_rgba(0,255,135,0.25)] hover:shadow-[0_0_32px_rgba(0,204,106,0.35)] dark:hover:shadow-[0_0_32px_rgba(0,255,135,0.45)] overflow-hidden group"
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
              <span className="relative z-10">Let&apos;s go →</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
            </button>
            <p className="text-neutral-400 dark:text-neutral-700 text-[10px] mt-3 tracking-wider uppercase" style={{ fontFamily: "'Geist Mono', monospace" }}>
              No credit card required
            </p>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full max-w-sm fade-up"
          style={{ animationDelay: "0s" }}
        >
          {/* Logo + terminal label */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00cc6a] dark:bg-[#00d294] mb-4 shadow-[0_0_28px_rgba(0,204,106,0.35)] dark:shadow-[0_0_28px_rgba(0,255,135,0.45)]">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#080808] dark:text-white">
              Pulse
            </h1>
            <p
              className="text-[11px] tracking-[0.14em] uppercase text-[#00cc6a] dark:text-[#00d294] mt-2 font-medium"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              &gt; new account
              <span className="cursor-blink ml-0.5">_</span>
            </p>
          </div>

          <div className="relative bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00d294]/40 to-transparent" />

            <div className="px-6 pt-6 pb-3 border-b border-black/[0.05] dark:border-white/[0.05]">
              <p
                className="text-[10px] tracking-[0.18em] uppercase text-neutral-400 dark:text-neutral-600 font-medium"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Get started
              </p>
              <h2 className="text-xl font-bold text-[#080808] dark:text-white mt-1">Create account</h2>
              <p
                className="text-neutral-500 dark:text-neutral-400 text-xs mt-1"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Start monitoring your APIs in minutes
              </p>
            </div>

            <div className="px-6 pt-5">
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] disabled:opacity-40 border border-black/[0.08] dark:border-white/[0.1] hover:border-black/[0.14] dark:hover:border-white/[0.18] rounded-xl py-3 transition-all duration-200 group"
              >
                {googleLoading ? (
                  <svg className="w-4 h-4 animate-spin text-neutral-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                <span
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-[#080808] dark:group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {googleLoading ? "Redirecting..." : "Continue with Google"}
                </span>
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                <span
                  className="text-[10px] text-neutral-400 dark:text-neutral-600 tracking-widest uppercase"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  or
                </span>
                <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-5 space-y-4">
              {error && (
                <div
                  className="text-red-600 dark:text-[#fb2c36] text-xs bg-[#fb2c36]/10 border border-[#fb2c36]/20 rounded-lg px-3.5 py-3 leading-relaxed"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label
                  className="block text-xs font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-300"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
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
                  className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-xl px-4 py-3 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00d294]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00d294]/10 transition-all duration-200"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block text-xs font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-300"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
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
                  className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.1] dark:border-white/[0.1] rounded-xl px-4 py-3 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00d294]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00d294]/10 transition-all duration-200"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                />
                <p
                  className="text-[11px] text-neutral-400 dark:text-neutral-500 pt-0.5"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  Must be at least 6 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-[#00cc6a] dark:bg-[#00d294] hover:bg-[#00b560] dark:hover:bg-[#00bb7f] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold tracking-[0.1em] uppercase rounded-xl py-3.5 transition-all duration-200 shadow-[0_0_24px_rgba(0,204,106,0.2)] dark:shadow-[0_0_24px_rgba(0,255,135,0.25)] hover:shadow-[0_0_32px_rgba(0,204,106,0.35)] dark:hover:shadow-[0_0_32px_rgba(0,255,135,0.45)] mt-2 overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
              <p className="text-xs text-neutral-500" style={{ fontFamily: "'Geist Mono', monospace" }}>
                Already have an account?{" "}
                <Link href="/login" className="text-[#00cc6a] dark:text-[#00d294] hover:text-[#00b560] dark:hover:text-white font-medium transition-colors duration-150">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p
            className="text-center text-[10px] text-neutral-400 dark:text-neutral-700 mt-5 tracking-[0.1em] uppercase"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Pulse · API Monitor
          </p>
        </div>
      )}
    </div>
  );
}
