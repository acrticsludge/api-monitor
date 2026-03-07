"use client";

import { useState, useEffect } from "react";

export default function StatusPageLink({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const displayUrl = `${origin || ""}/status/${userId}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/status/${userId}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 bg-[#0f0f0f] border border-white/[0.06] rounded-2xl px-5 py-4">
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Status Page
        </p>
        <p
          className="text-xs text-neutral-300 truncate"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {displayUrl}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase border rounded-lg px-3 py-1.5 transition-all duration-150 shrink-0"
        style={{
          fontFamily: "'DM Mono', monospace",
          color: copied ? "#00ff87" : undefined,
          borderColor: copied ? "rgba(0,255,135,0.3)" : "rgba(255,255,255,0.08)",
        }}
      >
        {copied ? (
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied
          </>
        ) : (
          <>
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy URL
          </>
        )}
      </button>
    </div>
  );
}
