"use client";

import { useState } from "react";
import { type IncidentReport, formatIncidentReport } from "../../../lib/generateReport";

function CopyReportButton({ report }: { report: IncidentReport }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(formatIncidentReport(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-center gap-2 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.14] dark:hover:border-white/[0.14] rounded-xl py-2.5 transition-all duration-200"
    >
      {copied ? (
        <span
          className="text-[#00cc6a] dark:text-[#00ff87] text-xs font-medium"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          ✓ Copied to clipboard
        </span>
      ) : (
        <span
          className="text-neutral-500 dark:text-neutral-400 text-xs font-medium"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Copy incident report
        </span>
      )}
    </button>
  );
}

export default function IncidentReportCard({
  report,
  defaultExpanded = false,
}: {
  report: IncidentReport;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }

  return (
    <div className="relative bg-white dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00ff87]/40 to-transparent" />

      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm">📋</span>
          <div>
            <p
              className="text-[#080808] dark:text-white text-sm font-semibold"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Incident Report
            </p>
            <p
              className="text-neutral-500 text-xs mt-0.5"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {formatDate(report.startTime)}
              {report.durationMinutes ? ` · ${report.durationMinutes} min downtime` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${
              report.errorStatusCode && report.errorStatusCode >= 500
                ? "text-red-500 dark:text-red-400 bg-red-400/10 border-red-400/20"
                : "text-yellow-500 dark:text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
            }`}
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {report.errorStatusCode ? `HTTP ${report.errorStatusCode}` : "Timeout"}
          </span>
          <svg
            className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-black/[0.04] dark:border-white/[0.04]">
          {/* Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-4">
            <div>
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Started
              </p>
              <p
                className="text-[#080808] dark:text-white text-xs font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {formatDate(report.startTime)}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Resolved
              </p>
              <p
                className="text-[#080808] dark:text-white text-xs font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.endTime ? formatDate(report.endTime) : "Ongoing"}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Duration
              </p>
              <p
                className="text-red-500 dark:text-red-400 text-xs font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.durationMinutes ? `${report.durationMinutes} min` : "Unknown"}
              </p>
            </div>
          </div>

          {/* Anomaly warning */}
          {report.anomalyDetectedBefore && (
            <div className="bg-yellow-400/[0.04] border border-yellow-400/20 rounded-xl px-3.5 py-2.5 mb-4">
              <p
                className="text-yellow-500 dark:text-yellow-400 text-xs"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                ⚠️ Performance degradation was detected before this incident
              </p>
            </div>
          )}

          {/* Response time comparison */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Baseline
              </p>
              <p
                className="text-[#00cc6a] dark:text-[#00ff87] text-sm font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.baselineResponseMs ? `${report.baselineResponseMs}ms` : "N/A"}
              </p>
            </div>
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                At Failure
              </p>
              <p
                className="text-red-500 dark:text-red-400 text-sm font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.responseAtFailure ? `${report.responseAtFailure}ms` : "N/A"}
              </p>
            </div>
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                At Recovery
              </p>
              <p
                className="text-[#00cc6a] dark:text-[#00ff87] text-sm font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.responseAtRecovery ? `${report.responseAtRecovery}ms` : "N/A"}
              </p>
            </div>
          </div>

          {/* Impact */}
          <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3 mb-4">
            <p
              className="text-[10px] text-neutral-500 dark:text-neutral-600 uppercase tracking-wider mb-2"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Impact
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <p
                className="text-[#080808] dark:text-white text-xs font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.failedChecks} failed checks
              </p>
              {report.estimatedRequestsAffected && (
                <p
                  className="text-neutral-500 dark:text-neutral-400 text-xs"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  ~{report.estimatedRequestsAffected.toLocaleString()} requests affected (est.)
                </p>
              )}
            </div>
          </div>

          <CopyReportButton report={report} />
        </div>
      )}
    </div>
  );
}
