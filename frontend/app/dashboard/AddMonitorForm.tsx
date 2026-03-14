"use client";

import { useRef, useState } from "react";
import { addMonitor } from "./actions";

const FREE_TIER_LIMIT = 5;

export default function AddMonitorForm({
  monitorCount,
  isPro,
  projectId,
}: {
  monitorCount: number;
  isPro: boolean;
  projectId?: string;
}) {
  const [open, setOpen] = useState(false);
  const atLimit = !isPro && monitorCount >= FREE_TIER_LIMIT;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
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
      setUrl("");
      setMethod("GET");
      setOpen(false);
      setLoading(false);
    }
  }

  const slotsText = isPro
    ? "Unlimited monitors"
    : `${FREE_TIER_LIMIT - monitorCount} slot${FREE_TIER_LIMIT - monitorCount !== 1 ? "s" : ""} remaining`;

  return (
    <>
      {atLimit ? (
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-3 py-2"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {FREE_TIER_LIMIT}/{FREE_TIER_LIMIT} used ·{" "}
          <span className="text-[#00cc6a] dark:text-[#00ff87]">Upgrade</span>
        </span>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#00cc6a] dark:bg-[#00ff87] hover:bg-[#00b85f] dark:hover:bg-[#00f080] text-black text-xs font-bold tracking-[0.06em] uppercase px-3.5 py-2 rounded-lg transition-all duration-150 shadow-[0_0_16px_rgba(0,204,106,0.25)] dark:shadow-[0_0_16px_rgba(0,255,135,0.25)] hover:shadow-[0_0_24px_rgba(0,204,106,0.4)] dark:hover:shadow-[0_0_24px_rgba(0,255,135,0.4)]"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Monitor
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
                    New Endpoint
                  </p>
                  <h3
                    className="text-base font-bold text-[#080808] dark:text-white mt-0.5"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Add Monitor
                  </h3>
                  <p
                    className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {slotsText}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
              {projectId && <input type="hidden" name="project_id" value={projectId} />}

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
                  placeholder="https://api.example.com/health"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Method">
                  <select
                    name="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="HEAD">HEAD</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </Field>

                <Field label="Expected Status">
                  <input
                    name="expected_status_code"
                    type="number"
                    defaultValue={200}
                    min={100}
                    max={599}
                    className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </Field>
              </div>

              <Field label="Check Interval">
                {isPro ? (
                  <select
                    name="check_interval_minutes"
                    defaultValue="5"
                    className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    <option value="1">Every 1 minute</option>
                    <option value="2">Every 2 minutes</option>
                    <option value="5">Every 5 minutes</option>
                    <option value="10">Every 10 minutes</option>
                    <option value="30">Every 30 minutes</option>
                  </select>
                ) : (
                  <input
                    name="check_interval_minutes"
                    type="number"
                    value={5}
                    readOnly
                    disabled
                    className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm opacity-50 cursor-not-allowed"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                )}
              </Field>

              <Field label="Webhook URL (optional)">
                <input
                  name="webhook_url"
                  type="url"
                  placeholder="https://your-app.com/webhook"
                  className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </Field>

              {/* ── Pro-only fields ─────────────────────────────────────────── */}
              {isPro && (
                <>
                  <div className="pt-1 pb-0.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                      <span
                        className="text-[10px] text-[#00cc6a] dark:text-[#00ff87] tracking-[0.14em] uppercase font-medium"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        Pro features
                      </span>
                      <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                    </div>
                  </div>

                  <Field label="Custom Headers (JSON)">
                    <textarea
                      name="custom_headers"
                      placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
                      rows={3}
                      className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200 resize-none"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    />
                    <p className="text-[10px] text-neutral-500 mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                      Enter as JSON object
                    </p>
                  </Field>

                  {["POST", "PUT", "PATCH"].includes(method) && (
                    <Field label="Request Body">
                      <textarea
                        name="custom_body"
                        placeholder='{"username": "user", "password": "pass"}'
                        rows={3}
                        className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200 resize-none"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      />
                      <p className="text-[10px] text-neutral-500 mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                        Sent as raw body — add Content-Type header above if needed
                      </p>
                    </Field>
                  )}

                  <Field label="Authentication">
                    <select
                      name="auth_type"
                      defaultValue="none"
                      className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200 mb-2"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      <option value="none">None</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth (user:pass)</option>
                      <option value="api_key">API Key Header</option>
                    </select>
                    <input
                      name="auth_value"
                      type="password"
                      placeholder="Token or credentials"
                      className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                      autoComplete="off"
                    />
                    <p className="flex items-center gap-1 text-[10px] text-[#00cc6a] dark:text-[#00ff87] mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Encrypted with AES-256-GCM before storage
                    </p>
                  </Field>

                  <Field label="Response Validation">
                    <div className="space-y-2">
                      <input
                        name="validation_path"
                        placeholder="data.status (dot-notation path)"
                        className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="validation_operator"
                          defaultValue="equals"
                          className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3 py-2.5 text-[#080808] dark:text-white text-sm focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="not_empty">Not empty</option>
                        </select>
                        <input
                          name="validation_expected"
                          placeholder="ok"
                          className="w-full bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3 py-2.5 text-[#080808] dark:text-white text-sm placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-[#00cc6a]/50 dark:focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00cc6a]/10 dark:focus:ring-[#00ff87]/10 transition-all duration-200"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500" style={{ fontFamily: "'DM Mono', monospace" }}>
                        Alert if JSON field fails this check (leave path empty to skip)
                      </p>
                    </div>
                  </Field>

                  {url.startsWith("https") && (
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="check_ssl"
                        className="w-4 h-4 rounded accent-[#00cc6a] dark:accent-[#00ff87]"
                      />
                      <span
                        className="text-xs text-neutral-600 dark:text-neutral-400"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        Monitor SSL certificate expiry
                      </span>
                    </label>
                  )}
                </>
              )}

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
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
        className="block text-xs font-semibold tracking-[0.08em] uppercase text-neutral-500 dark:text-neutral-300"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
