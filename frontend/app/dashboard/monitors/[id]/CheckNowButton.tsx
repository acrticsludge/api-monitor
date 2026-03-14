"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PingResult = {
  status: string;
  response_time_ms: number | null;
  status_code: number | null;
};

export default function CheckNowButton({ monitorId }: { monitorId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PingResult | null>(null);
  const router = useRouter();

  async function handleCheck() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/monitors/${monitorId}/ping`, {
        method: "POST",
      });
      const data: PingResult = await res.json();
      setResult(data);
      router.refresh();
    } catch {
      // network error — ignore, page will still refresh
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span
          className={`text-[11px] font-medium ${result.status === "up" ? "text-[#00d294]" : "text-[#fb2c36]"}`}
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          {result.status.toUpperCase()}
          {result.response_time_ms != null ? ` · ${result.response_time_ms}ms` : ""}
          {result.status_code != null ? ` · ${result.status_code}` : ""}
        </span>
      )}
      <button
        onClick={handleCheck}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-[#00d294] hover:bg-[#00e87a] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold tracking-[0.06em] uppercase px-3.5 py-2 rounded-lg transition-all duration-150 shadow-[0_0_16px_rgba(0,255,135,0.25)] hover:shadow-[0_0_24px_rgba(0,255,135,0.4)]"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        {loading ? (
          <>
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
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Checking...
          </>
        ) : (
          <>
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
            Check Now
          </>
        )}
      </button>
    </div>
  );
}
