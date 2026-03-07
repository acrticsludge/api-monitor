"use client";

import { useRef, useState } from "react";
import { addMonitor } from "./actions";

const FREE_TIER_LIMIT = 5;

export default function AddMonitorForm({
  monitorCount,
}: {
  monitorCount: number;
}) {
  const [open, setOpen] = useState(false);
  const atLimit = monitorCount >= FREE_TIER_LIMIT;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await addMonitor(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      formRef.current?.reset();
      setOpen(false);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => !atLimit && setOpen(true)}
        disabled={atLimit}
        title={
          atLimit ? `Free plan limit: ${FREE_TIER_LIMIT} monitors` : undefined
        }
        className="inline-flex items-center gap-1.5 bg-[#00ff87] hover:bg-[#00f080] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold tracking-[0.06em] uppercase px-3.5 py-2 rounded-lg transition-all duration-150 shadow-[0_0_16px_rgba(0,255,135,0.25)] hover:shadow-[0_0_24px_rgba(0,255,135,0.4)]"
      >
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Monitor
      </button>

      {atLimit && (
        <p
          className="text-[10px] text-neutral-500 mt-1 text-right"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Free limit reached ·{" "}
          <span className="text-[#00ff87]">Upgrade for more</span>
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-sm bg-[#111111] border border-white/[0.08] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent" />

            <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-[10px] tracking-[0.18em] uppercase text-[#00ff87] font-medium"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    New Endpoint
                  </p>
                  <h3
                    className="text-base font-bold text-white mt-0.5"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Add Monitor
                  </h3>
                  <p
                    className="text-xs text-neutral-400 mt-0.5"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {FREE_TIER_LIMIT - monitorCount} slot
                    {FREE_TIER_LIMIT - monitorCount !== 1 ? "s" : ""} remaining
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-white transition-all"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="px-5 py-4 space-y-3.5"
            >
              {error && (
                <p
                  className="text-red-300 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 leading-relaxed"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {error}
                </p>
              )}

              <Field label="Name">
                <input
                  name="name"
                  required
                  placeholder="Production API"
                  className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10 transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              <Field label="URL">
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://api.example.com/health"
                  className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10 transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Method">
                  <select
                    name="method"
                    defaultValue="GET"
                    className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10 transition-all duration-200"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="HEAD">HEAD</option>
                    <option value="PUT">PUT</option>
                  </select>
                </Field>

                <Field label="Expected Status">
                  <input
                    name="expected_status_code"
                    type="number"
                    defaultValue={200}
                    min={100}
                    max={599}
                    className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10 transition-all duration-200"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </Field>
              </div>

              <Field label="Check Interval (minutes)">
                <input
                  name="interval"
                  type="number"
                  defaultValue={5}
                  min={5}
                  max={60}
                  className="w-full bg-[#0a0a0a] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10 transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-xs font-semibold tracking-[0.06em] uppercase text-neutral-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] rounded-xl py-2.5 transition-all duration-150"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative flex-1 bg-[#00ff87] hover:bg-[#00f080] disabled:opacity-40 text-black text-xs font-bold tracking-[0.06em] uppercase rounded-xl py-2.5 transition-all duration-150 shadow-[0_0_16px_rgba(0,255,135,0.2)] hover:shadow-[0_0_24px_rgba(0,255,135,0.35)] overflow-hidden group"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="inline-flex items-center gap-1.5 justify-center">
                        <svg
                          className="w-3 h-3 animate-spin"
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
                        Adding...
                      </span>
                    ) : (
                      "Add Monitor"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-xs font-semibold tracking-[0.08em] uppercase text-neutral-300"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
