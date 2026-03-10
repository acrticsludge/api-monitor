"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editMonitor } from "../app/dashboard/actions";

type MonitorData = {
  id: string;
  name: string;
  url: string;
  method: string | null;
  expected_status_code: number | null;
  check_interval_minutes: number | null;
  webhook_url: string | null;
};

export default function EditMonitorModal({
  monitor,
  variant = "icon",
}: {
  monitor: MonitorData;
  variant?: "icon" | "button";
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await editMonitor(monitor.id, formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setOpen(true)}
          title="Edit monitor"
          className="text-xs font-medium text-neutral-400 dark:text-neutral-600 hover:text-[#080808] dark:hover:text-white transition-colors duration-150"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.06em] uppercase text-neutral-500 dark:text-neutral-400 border border-black/[0.08] dark:border-white/[0.08] rounded-lg px-3 py-2 hover:text-[#080808] dark:hover:text-white hover:border-black/[0.16] dark:hover:border-white/[0.16] transition-all duration-150"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111111] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00ff87]/40 to-transparent" />

            <div className="px-5 pt-5 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-[10px] tracking-[0.18em] uppercase text-[#00cc6a] dark:text-[#00ff87] font-medium"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    Edit Endpoint
                  </p>
                  <h3
                    className="text-base font-bold text-[#080808] dark:text-white mt-0.5"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {monitor.name}
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-all"
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

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
              {error && (
                <p
                  className="text-red-500 dark:text-red-300 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 leading-relaxed"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {error}
                </p>
              )}

              <Field label="Name">
                <input
                  name="name"
                  required
                  defaultValue={monitor.name}
                  placeholder="Production API"
                  className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              <Field label="URL">
                <input
                  name="url"
                  type="url"
                  required
                  defaultValue={monitor.url}
                  placeholder="https://api.example.com/health"
                  className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Method">
                  <select
                    name="method"
                    defaultValue={monitor.method || "GET"}
                    className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
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
                    defaultValue={monitor.expected_status_code ?? 200}
                    min={100}
                    max={599}
                    className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </Field>
              </div>

              <Field label="Check Interval (minutes)">
                <input
                  name="interval"
                  type="number"
                  value={5}
                  readOnly
                  disabled
                  className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm opacity-50 cursor-not-allowed"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              <Field label="Webhook URL (optional)">
                <input
                  name="webhook_url"
                  type="url"
                  defaultValue={monitor.webhook_url || ""}
                  placeholder="https://your-app.com/webhook"
                  className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-xs font-semibold tracking-[0.06em] uppercase text-neutral-500 dark:text-neutral-400 hover:text-[#080808] dark:hover:text-white border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.16] dark:hover:border-white/[0.16] rounded-xl py-2.5 transition-all duration-150"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative flex-1 bg-[#00cc6a] dark:bg-[#00ff87] hover:bg-[#00b85f] dark:hover:bg-[#00f080] disabled:opacity-40 text-black text-xs font-bold tracking-[0.06em] uppercase rounded-xl py-2.5 transition-all duration-150 shadow-[0_0_16px_rgba(0,204,106,0.2)] dark:shadow-[0_0_16px_rgba(0,255,135,0.2)] hover:shadow-[0_0_24px_rgba(0,204,106,0.35)] dark:hover:shadow-[0_0_24px_rgba(0,255,135,0.35)] overflow-hidden group"
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
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
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
        className="block text-xs font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-300"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
