"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editMonitor, deleteMonitor, getDecryptedBody, toggleMonitor } from "../../../../dashboard/actions";
import { Separator } from "@/components/ui/separator";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const inputClass =
  "w-full bg-background border border-input rounded-xl px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-[#00d294]/50 focus:ring-2 focus:ring-[#00d294]/10 placeholder-neutral-500 transition-all";

const labelClass = "block text-[11px] tracking-[0.1em] uppercase text-neutral-500 mb-1.5";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
      <h3
        className="text-sm font-semibold text-foreground mb-4"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

type Monitor = {
  id: string;
  name: string;
  url: string;
  method: string | null;
  expected_status_code: number | null;
  check_interval_minutes: number | null;
  is_active: boolean;
  webhook_url: string | null;
  custom_headers: Record<string, string> | null;
  auth_type: string | null;
  response_validation: { path: string; operator: string; expected: string } | null;
  check_ssl: boolean | null;
  custom_body: string | null;
};

export default function MonitorSettingsForm({
  monitor,
  isPro,
}: {
  monitor: Monitor;
  isPro: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [isActive, setIsActive] = useState(monitor.is_active);
  const [method, setMethod] = useState(monitor.method || "GET");
  const [bodyRevealed, setBodyRevealed] = useState(false);
  const [decryptedBody, setDecryptedBody] = useState<string | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    const result = await editMonitor(monitor.id, formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(formData: FormData) {
    setDeleting(true);
    await deleteMonitor(formData);
    router.push("/dashboard");
  }

  const customHeadersDefault = monitor.custom_headers
    ? JSON.stringify(monitor.custom_headers, null, 2)
    : "";

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
      {/* General */}
      <SectionCard title="General">
        <div>
          <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
            Monitor Name
          </label>
          <input
            name="name"
            defaultValue={monitor.name}
            required
            className={inputClass}
            style={{ fontFamily: "'Geist Mono', monospace" }}
            placeholder="My API"
          />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
            URL
          </label>
          <input
            name="url"
            type="url"
            defaultValue={monitor.url}
            required
            className={inputClass}
            style={{ fontFamily: "'Geist Mono', monospace" }}
            placeholder="https://api.example.com/health"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
              Method
            </label>
            <select
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={inputClass}
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {ALLOWED_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
              Expected Status
            </label>
            <input
              name="expected_status_code"
              type="number"
              defaultValue={monitor.expected_status_code ?? 200}
              min={100}
              max={599}
              required
              className={inputClass}
              style={{ fontFamily: "'Geist Mono', monospace" }}
            />
          </div>
        </div>
      </SectionCard>

      {/* Monitoring */}
      <SectionCard title="Monitoring">
        <div>
          <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
            Check Interval (minutes)
          </label>
          {isPro ? (
            <input
              name="check_interval_minutes"
              type="number"
              defaultValue={monitor.check_interval_minutes ?? 5}
              min={1}
              max={30}
              required
              className={inputClass}
              style={{ fontFamily: "'Geist Mono', monospace" }}
            />
          ) : (
            <div className="relative">
              <input
                name="check_interval_minutes"
                type="number"
                value={5}
                readOnly
                className={`${inputClass} opacity-50 cursor-not-allowed`}
                style={{ fontFamily: "'Geist Mono', monospace" }}
              />
              <p className="text-[11px] text-neutral-600 mt-1" style={{ fontFamily: "'Geist Mono', monospace" }}>
                Free plan is fixed at 5 minutes. Upgrade to Pro for 1–30 min intervals.
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Alerts */}
      <SectionCard title="Alerts">
        <div>
          <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
            Webhook URL{" "}
            <span className="text-neutral-700 normal-case tracking-normal">
              (optional)
            </span>
          </label>
          <input
            name="webhook_url"
            type="url"
            defaultValue={monitor.webhook_url ?? ""}
            className={inputClass}
            style={{ fontFamily: "'Geist Mono', monospace" }}
            placeholder="https://hooks.example.com/alerts"
          />
        </div>
      </SectionCard>

      {/* Pro settings */}
      {isPro && (
        <SectionCard title="Pro Settings">
          {/* Custom headers */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
              Custom Headers{" "}
              <span className="text-neutral-700 normal-case tracking-normal">(JSON)</span>
            </label>
            <textarea
              name="custom_headers"
              rows={3}
              defaultValue={customHeadersDefault}
              className={`${inputClass} resize-none`}
              style={{ fontFamily: "'Geist Mono', monospace" }}
              placeholder={'{"Authorization": "Bearer token"}'}
            />
          </div>

          {/* Auth */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
                Auth Type
              </label>
              <select
                name="auth_type"
                defaultValue={monitor.auth_type ?? "none"}
                className={inputClass}
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                <option value="none">None</option>
                <option value="bearer">Bearer Token</option>
                <option value="api_key">API Key</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
                Auth Value{" "}
                <span className="text-neutral-700 normal-case tracking-normal">
                  (leave blank to keep existing)
                </span>
              </label>
              <input
                name="auth_value"
                type="password"
                className={inputClass}
                style={{ fontFamily: "'Geist Mono', monospace" }}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Request body */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
              Request Body
            </label>
            {!bodyRevealed ? (
              <div className="flex items-center gap-2">
                <p
                  className="text-neutral-600 text-xs"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {monitor.custom_body ? "Body is encrypted" : "No body set"}
                </p>
                {monitor.custom_body && (
                  <button
                    type="button"
                    onClick={async () => {
                      setBodyLoading(true);
                      const val = await getDecryptedBody(monitor.id);
                      setDecryptedBody(val ?? "");
                      setBodyRevealed(true);
                      setBodyLoading(false);
                    }}
                    className="text-[11px] text-[#00d294] hover:underline disabled:opacity-50"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                    disabled={bodyLoading}
                  >
                    {bodyLoading ? "Loading..." : "Edit"}
                  </button>
                )}
                {!monitor.custom_body && (
                  <button
                    type="button"
                    onClick={() => { setDecryptedBody(""); setBodyRevealed(true); }}
                    className="text-[11px] text-[#00d294] hover:underline"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    Add
                  </button>
                )}
              </div>
            ) : (
              <textarea
                name="custom_body"
                rows={4}
                value={decryptedBody ?? ""}
                onChange={(e) => setDecryptedBody(e.target.value)}
                className={`${inputClass} resize-none`}
                style={{ fontFamily: "'Geist Mono', monospace" }}
                placeholder='{"key": "value"}'
              />
            )}
          </div>

          {/* Response validation */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Geist Mono', monospace" }}>
              Response Validation
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                name="validation_path"
                defaultValue={monitor.response_validation?.path ?? ""}
                className={inputClass}
                style={{ fontFamily: "'Geist Mono', monospace" }}
                placeholder="$.status"
              />
              <select
                name="validation_operator"
                defaultValue={monitor.response_validation?.operator ?? "equals"}
                className={inputClass}
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="not_equals">not equals</option>
              </select>
              <input
                name="validation_expected"
                defaultValue={monitor.response_validation?.expected ?? ""}
                className={inputClass}
                style={{ fontFamily: "'Geist Mono', monospace" }}
                placeholder="ok"
              />
            </div>
          </div>

          {/* SSL */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="check_ssl"
              id="check_ssl"
              defaultChecked={monitor.check_ssl ?? false}
              value="on"
              className="w-4 h-4 rounded border-input bg-background accent-[#00d294]"
            />
            <label
              htmlFor="check_ssl"
              className="text-sm text-neutral-300 cursor-pointer"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Enable SSL certificate monitoring
            </label>
          </div>
        </SectionCard>
      )}

      {/* Error / success */}
      {error && (
        <p
          className="text-[#fb2c36] text-xs"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          {error}
        </p>
      )}
      {success && (
        <p
          className="text-[#00d294] text-xs"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          ✓ Settings saved
        </p>
      )}

      {/* Save button */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#00d294] hover:bg-[#00bb7f] text-black text-sm font-bold uppercase tracking-wide rounded-xl px-6 py-2.5 shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_28px_rgba(0,255,135,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontFamily: "'Geist Mono', monospace" }}
      >
        {loading ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </button>
      </form>

      {/* Pause / Resume */}
      <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d294]/40 to-transparent" />
        <h3
          className="text-sm font-semibold text-foreground mb-1"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Monitor Status
        </h3>
        <p
          className="text-neutral-600 text-xs mb-4"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          {isActive
            ? "Pausing stops all pings and alerts for this monitor."
            : "Monitor is paused — no pings or alerts are being sent."}
        </p>
        <form
          action={async (fd) => {
            setToggling(true);
            fd.set("id", monitor.id);
            fd.set("is_active", String(!isActive));
            await toggleMonitor(fd);
            setIsActive((v) => !v);
            setToggling(false);
            router.refresh();
          }}
        >
          <button
            type="submit"
            disabled={toggling}
            className={`text-[11px] border rounded-lg px-4 py-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive
                ? "text-[#f99c00] border-[#f99c00]/30 hover:bg-[#f99c00]/10"
                : "text-[#00d294] border-[#00d294]/30 hover:bg-[#00d294]/10"
            }`}
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            {toggling ? "Updating..." : isActive ? "Pause Monitor" : "Resume Monitor"}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="relative bg-[#fb2c36]/[0.03] border border-[#fb2c36]/20 rounded-2xl p-5 mt-2 overflow-hidden">
        <h3
          className="text-[#fb2c36] font-semibold text-sm mb-1"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Danger Zone
        </h3>
        <p
          className="text-neutral-600 text-xs mb-4"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Permanently delete this monitor and all its ping history. This cannot be undone.
        </p>
        <form action={handleDelete}>
          <input type="hidden" name="id" value={monitor.id} />
          <button
            type="submit"
            disabled={deleting}
            className="text-[11px] text-[#fb2c36] border border-[#fb2c36]/30 hover:bg-[#fb2c36]/10 rounded-lg px-4 py-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Geist Mono', monospace" }}
            onClick={(e) => {
              if (!confirm("Delete this monitor permanently? All ping history will be lost.")) {
                e.preventDefault();
              }
            }}
          >
            {deleting ? "Deleting..." : "Delete Monitor"}
          </button>
        </form>
      </div>
    </div>
  );
}
