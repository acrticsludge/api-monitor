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
              className="text-neutral-500 dark:text-neutral-300 text-xs mt-0.5"
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
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
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
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
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
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
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
                className="text-yellow-500 dark:text-yellow-400 text-xs font-medium mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                ⚠️ Early warning detected
              </p>
              <p
                className="text-neutral-500 dark:text-neutral-400 text-[11px]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.anomalyLeadTimeMinutes !== null
                  ? `Degradation flagged ${report.anomalyLeadTimeMinutes} min before outage`
                  : "Performance degradation was detected before this incident"}
                {report.anomalyBaselineMs && report.anomalyPeakMs
                  ? ` · ${report.anomalyBaselineMs}ms → ${report.anomalyPeakMs}ms`
                  : ""}
              </p>
            </div>
          )}

          {/* Root cause analysis */}
          {report.rootCause && (
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl px-3.5 py-3 mb-4">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Root Cause Analysis
              </p>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p
                  className="text-[#080808] dark:text-white text-xs font-medium"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {report.rootCause}
                </p>
                {report.confidence !== null && (
                  <span
                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      report.confidence >= 70
                        ? "text-[#00cc6a] dark:text-[#00ff87] bg-[#00cc6a]/10 border-[#00cc6a]/20"
                        : report.confidence >= 40
                          ? "text-yellow-500 dark:text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                          : "text-neutral-400 bg-white/[0.04] border-white/10"
                    }`}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {report.confidence}% confidence
                  </span>
                )}
              </div>
              {report.suggestion && (
                <p
                  className="text-neutral-500 dark:text-neutral-400 text-[11px]"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  → {report.suggestion}
                </p>
              )}
            </div>
          )}

          {/* Response time comparison */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
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
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
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
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
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

          {/* Pre-incident trend */}
          {report.preIncidentTrend.length > 0 && (
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3 mb-4">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Pre-Incident Trend
              </p>
              <div className="flex items-end gap-1.5">
                {report.preIncidentTrend.map((ping, i) => {
                  const isLast = i === report.preIncidentTrend.length - 1;
                  const ms = ping.responseTimeMs;
                  const maxMs = Math.max(...report.preIncidentTrend.map((p) => p.responseTimeMs ?? 0));
                  const height = ms ? Math.max(20, Math.round((ms / (maxMs || 1)) * 48)) : 48;
                  const isDown = ping.status === "down";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                      <span
                        className="text-[9px] text-neutral-500 dark:text-neutral-400 truncate w-full text-center"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {ms ? ms + "ms" : "—"}
                      </span>
                      <div
                        className={`w-full rounded-sm ${isDown ? "bg-red-400/60" : isLast ? "bg-yellow-400/60" : "bg-[#00cc6a]/40 dark:bg-[#00ff87]/40"}`}
                        style={{ height: height + "px" }}
                      />
                    </div>
                  );
                })}
              </div>
              <p
                className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-2"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Last {report.preIncidentTrend.length} pings before incident
              </p>
            </div>
          )}

          {/* Error rate */}
          {report.errorRateBeforeIncident !== null && (
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3 mb-4">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Error Rate (30 min before incident)
              </p>
              <p
                className={`text-sm font-medium ${
                  report.errorRateBeforeIncident > 50
                    ? "text-red-500 dark:text-red-400"
                    : report.errorRateBeforeIncident > 20
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-[#00cc6a] dark:text-[#00ff87]"
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.errorRateBeforeIncident}%
              </p>
            </div>
          )}

          {/* Impact */}
          <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3 mb-4">
            <p
              className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2"
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

          {/* Incident history */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Incidents (30d)
              </p>
              <p
                className="text-[#080808] dark:text-white text-sm font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.incidentFrequency30d}
              </p>
            </div>
            <div className="bg-black/[0.03] dark:bg-black/20 rounded-xl p-3">
              <p
                className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Avg Recovery
              </p>
              <p
                className="text-[#080808] dark:text-white text-sm font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {report.averageHistoricalDowntimeMinutes
                  ? report.averageHistoricalDowntimeMinutes + " min"
                  : "N/A"}
              </p>
            </div>
          </div>

          {report.timeSinceLastIncidentMinutes !== null && (
            <p
              className="text-[10px] text-neutral-400 dark:text-neutral-400 mb-4"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Previous incident:{" "}
              {Math.floor(report.timeSinceLastIncidentMinutes / 60 / 24) > 0
                ? Math.floor(report.timeSinceLastIncidentMinutes / 60 / 24) + " days ago"
                : Math.floor(report.timeSinceLastIncidentMinutes / 60) + " hours ago"}
            </p>
          )}

          <CopyReportButton report={report} />
        </div>
      )}
    </div>
  );
}
