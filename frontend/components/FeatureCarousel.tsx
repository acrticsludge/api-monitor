'use client'

import { useState, useEffect, useRef } from 'react'

const SLIDE_DURATION = 3500

export default function FeatureCarousel() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const slides = [
    { label: 'Health Score', component: <HealthScoreSlide /> },
    { label: 'Anomaly Detection', component: <AnomalySlide /> },
    { label: 'Root Cause Analysis', component: <RootCauseSlide /> },
    { label: 'Response Time', component: <ResponseTimeSlide /> },
    { label: 'Incident Report', component: <IncidentReportSlide /> },
  ]

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearTimeout(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
      return
    }

    setProgress(0)

    const progressStep = 100 / (SLIDE_DURATION / 50)
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + progressStep, 100))
    }, 50)

    intervalRef.current = setTimeout(() => {
      setActive(a => (a + 1) % slides.length)
    }, SLIDE_DURATION)

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [active, paused])

  function goTo(i: number) {
    setActive(i)
    setProgress(0)
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative bg-white dark:bg-[#0d0d0d] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_64px_rgba(0,0,0,0.6)]">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/60 dark:via-[#00d294]/60 to-transparent" />

        {/* Progress bar */}
        <div className="absolute inset-x-0 top-0 h-[2px] z-10">
          <div
            className="h-full bg-[#00cc6a] dark:bg-[#00d294] transition-none"
            style={{ width: `${progress}%`, opacity: paused ? 0.3 : 1 }}
          />
        </div>

        {/* Slide label */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cc6a] dark:bg-[#00d294] opacity-50" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00cc6a] dark:bg-[#00d294]" />
            </span>
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-neutral-500 font-medium"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {slides[active].label}
            </span>
          </div>
          {paused && (
            <span
              className="text-[9px] text-neutral-400 dark:text-neutral-700"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              paused
            </span>
          )}
        </div>

        {/* Slide content */}
        <div className="px-4 pb-4 min-h-[280px] flex flex-col justify-center">
          <div
            key={active}
            className="animate-in fade-in slide-in-from-bottom-2 duration-400"
          >
            {slides[active].component}
          </div>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-200 rounded-full ${
                i === active
                  ? 'w-4 h-1.5 bg-[#00cc6a] dark:bg-[#00d294]'
                  : 'w-1.5 h-1.5 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Shared card classes ───────────────────────────────────────────────────────
const card = 'relative bg-[#f4f4f4] dark:bg-[#0f0f0f] border border-black/[0.06] dark:border-white/[0.06]'
const innerCard = 'bg-black/[0.04] dark:bg-black/20'

// ─── Slide 1: Health Score ────────────────────────────────────────────────────
function HealthScoreSlide() {
  return (
    <div className="space-y-2.5">
      {/* Monitor header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p
            className="text-[11px] tracking-[0.14em] uppercase text-[#00cc6a] dark:text-[#00d294] mb-0.5 font-medium"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            &gt; overview
          </p>
          <p className="text-[#080808] dark:text-white text-sm font-extrabold tracking-tight" style={{ fontFamily: "'Geist', sans-serif" }}>
            api.prod.com
          </p>
          <p className="text-neutral-500 text-[10px] mt-0.5" style={{ fontFamily: "'Geist Mono', monospace" }}>
            https://api.prod.com/health
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#00cc6a] dark:text-[#00d294] shrink-0"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          <span className="relative flex w-1.5 h-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00cc6a] dark:bg-[#00d294] opacity-50" />
            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00cc6a] dark:bg-[#00d294]" />
          </span>
          UP · 200
        </span>
      </div>

      {/* Health Score card */}
      <div className={`${card} rounded-2xl px-4 py-4 overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00d294]/40 to-transparent" />
        <p
          className="text-[10px] tracking-[0.15em] uppercase text-neutral-500 mb-2"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Health Score
        </p>
        <p
          className="text-3xl font-extrabold tabular-nums text-[#00cc6a] dark:text-[#00d294]"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          81/100
        </p>
        <p
          className="text-xs font-semibold mt-1 text-[#00cc6a] dark:text-[#00d294]"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Healthy
        </p>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Uptime', value: '99.8%', sub: '100 pings', color: 'text-[#00cc6a] dark:text-[#00d294]' },
          { label: 'Avg Response', value: '112ms', sub: null, color: 'text-[#00cc6a] dark:text-[#00d294]' },
          { label: 'Last Response', value: '89ms', sub: null, color: 'text-[#00cc6a] dark:text-[#00d294]' },
        ].map((c) => (
          <div
            key={c.label}
            className={`${card} rounded-2xl px-3 py-3 overflow-hidden transition-all duration-200`}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00d294]/40 to-transparent" />
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {c.label}
            </p>
            <p
              className={`text-xl font-extrabold tabular-nums ${c.color}`}
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
              {c.value}
            </p>
            {c.sub && (
              <p
                className="text-[10px] text-neutral-500 mt-0.5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {c.sub}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Slide 2: Anomaly Detection ───────────────────────────────────────────────
function AnomalySlide() {
  return (
    <div className="space-y-2.5">
      {/* Anomaly banner */}
      <div className="relative bg-[#f99c00]/[0.06] border border-[#f99c00]/20 rounded-2xl p-4 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f99c00]/40 to-transparent" />
        <div className="flex items-start gap-3">
          <span className="text-[#f99c00] text-lg">⚠️</span>
          <div>
            <p
              className="text-[#f99c00] text-xs font-bold uppercase tracking-wider mb-1"
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
              Performance Degradation Detected
            </p>
            <p
              className="text-neutral-500 text-xs leading-relaxed"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              payments.api/status — averaging 1240ms (3x slower than usual baseline of 360ms)
            </p>
          </div>
        </div>
      </div>

      {/* Metric breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Baseline', value: '360ms', color: '#00cc6a' },
          { label: 'Current Avg', value: '1240ms', color: '#fb2c36' },
          { label: 'Slowdown', value: '3.4x', color: '#f99c00' },
        ].map((m) => (
          <div key={m.label} className={`${card} rounded-2xl p-2.5`}>
            <p
              className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {m.label}
            </p>
            <p
              className="text-sm font-medium tabular-nums"
              style={{ color: m.color, fontFamily: "'Geist Mono', monospace" }}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Uptime bar */}
      <div className={`flex items-center gap-4 ${card} rounded-2xl px-4 py-3`}>
        <div className="flex flex-col gap-0.5">
          <p
            className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 whitespace-nowrap"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Overall Uptime
          </p>
          <p
            className="text-xs text-neutral-500"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Current session
          </p>
        </div>
        <div className="flex-1 h-1.5 bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00cc6a] dark:bg-[#00d294] rounded-full shadow-[0_0_8px_rgba(0,255,135,0.5)] transition-all duration-700"
            style={{ width: '97%' }}
          />
        </div>
        <p
          className="text-sm font-bold text-[#00cc6a] dark:text-[#00d294] tabular-nums"
        >
          97%
        </p>
      </div>

      {/* Dashboard StatCards row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: '4', color: 'text-[#080808] dark:text-white' },
          { label: 'Online', value: '3', color: 'text-[#00cc6a] dark:text-[#00d294]' },
          { label: 'Down', value: '1', color: 'text-[#fb2c36]' },
          { label: 'Pending', value: '0', color: 'text-[#f99c00]' },
        ].map((s) => (
          <div
            key={s.label}
            className={`${card} rounded-2xl px-3 py-3 transition-all duration-200`}
          >
            <p
              className="text-[10px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {s.label}
            </p>
            <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Slide 3: Root Cause Analysis ────────────────────────────────────────────
function RootCauseSlide() {
  const trend = [
    { ms: 112, status: 'up' },
    { ms: 98, status: 'up' },
    { ms: 340, status: 'up' },
    { ms: 890, status: 'up' },
    { ms: 1240, status: 'up' },
    { ms: null, status: 'down' },
  ]
  const maxMs = Math.max(...trend.map((p) => p.ms ?? 0))

  return (
    <div className="space-y-2.5">
      {/* Root cause analysis box */}
      <div className={`${innerCard} rounded-xl px-3.5 py-3`}>
        <p
          className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Root Cause Analysis
        </p>
        <div className="flex items-start justify-between gap-3 mb-2">
          <p
            className="text-[#080808] dark:text-white text-xs font-medium"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Upstream server overload
          </p>
          <span
            className="shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium text-[#f99c00] bg-[#f99c00]/10 border-[#f99c00]/20"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            82% confidence
          </span>
        </div>
        <p
          className="text-neutral-500 text-[11px]"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          → Check database queries and server load
        </p>
      </div>

      {/* Pre-incident trend */}
      <div className={`${innerCard} rounded-xl p-3`}>
        <p
          className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Pre-Incident Trend
        </p>
        <div className="flex items-end gap-1.5">
          {trend.map((ping, i) => {
            const isLast = i === trend.length - 1
            const ms = ping.ms
            const height = ms ? Math.max(20, Math.round((ms / (maxMs || 1)) * 48)) : 48
            const isDown = ping.status === 'down'
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <span
                  className="text-[9px] text-neutral-500 truncate w-full text-center"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {ms ? ms + 'ms' : '—'}
                </span>
                <div
                  className={`w-full rounded-sm ${
                    isDown
                      ? 'bg-[#fb2c36]/60'
                      : isLast
                        ? 'bg-[#f99c00]/60'
                        : 'bg-[#00cc6a]/40 dark:bg-[#00d294]/40'
                  }`}
                  style={{ height: height + 'px' }}
                />
              </div>
            )
          })}
        </div>
        <p
          className="text-[9px] text-neutral-500 mt-2"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Last 6 pings before incident
        </p>
      </div>

      {/* Response time comparison */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Baseline', value: '360ms', color: '#00cc6a' },
          { label: 'At Failure', value: 'N/A', color: '#fb2c36' },
          { label: 'At Recovery', value: '287ms', color: '#00cc6a' },
        ].map((r) => (
          <div key={r.label} className={`${innerCard} rounded-xl p-2.5`}>
            <p
              className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              {r.label}
            </p>
            <p
              className="text-sm font-medium tabular-nums"
              style={{ color: r.color, fontFamily: "'Geist Mono', monospace" }}
            >
              {r.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Slide 4: Response Time ───────────────────────────────────────────────────
function ResponseTimeSlide() {
  const data = [112, 98, 134, 110, 125, 890, 1240, 340, 118, 102, 95, 108, 115, 122, 98, 104, 110, 118, 95, 101]
  const minMs = Math.min(...data)
  const maxMs = Math.max(...data)
  const avgMs = Math.round(data.reduce((a, b) => a + b, 0) / data.length)

  const svgPoints = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 60 - ((v - minMs) / (maxMs - minMs)) * 60
      return `${x},${y}`
    })
    .join(' ')
  const avgY = 60 - ((avgMs - minMs) / (maxMs - minMs)) * 60

  return (
    <div>
      <div className={`${card} rounded-2xl p-3 overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00d294]/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              className="text-[10px] tracking-[0.15em] uppercase text-neutral-500 font-medium"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Response Time
            </p>
            <p
              className="text-base font-bold text-[#080808] dark:text-white mt-0.5"
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
              Performance Trends
            </p>
          </div>
          <div className="flex items-center gap-1">
            {(['7d', '30d', '90d'] as const).map((r, i) => (
              <span
                key={r}
                className={`text-[10px] px-2 py-1 rounded-md ${
                  i === 0
                    ? 'bg-[#00cc6a]/10 dark:bg-[#00d294]/10 text-[#00cc6a] dark:text-[#00d294] font-semibold'
                    : 'text-neutral-500'
                }`}
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-5 mb-3">
          {[
            { label: 'Min', value: `${minMs}ms` },
            { label: 'Avg', value: `${avgMs}ms` },
            { label: 'Max', value: `${maxMs}ms` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                className="text-[10px] tracking-[0.1em] uppercase text-neutral-500 mb-0.5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {label}
              </p>
              <p
                className="text-sm font-semibold text-[#080808] dark:text-neutral-200 tabular-nums"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Tab toggle */}
        <div className="flex gap-4 mb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <span
            className="text-xs font-semibold text-[#00cc6a] dark:text-[#00d294] border-b-2 border-[#00cc6a] dark:border-[#00d294] pb-2 px-1 -mb-px"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Timeline
          </span>
          <span
            className="text-xs text-neutral-500 pb-2 px-1 border-b-2 border-transparent"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Daily Average
          </span>
        </div>

        {/* SVG chart */}
        <svg viewBox="0 0 100 60" className="w-full h-[90px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="rtAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d294" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#00d294" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 15, 30, 45, 60].map((y) => (
            <line
              key={y}
              x1="0" y1={y} x2="100" y2={y}
              stroke="rgba(128,128,128,0.1)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          ))}
          <line
            x1="0" y1={avgY} x2="100" y2={avgY}
            stroke="rgba(0,210,148,0.25)"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
          <polygon
            points={`0,60 ${svgPoints} 100,60`}
            fill="url(#rtAreaGrad)"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={svgPoints}
            fill="none"
            stroke="#00d294"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

// ─── Slide 5: Incident Report ─────────────────────────────────────────────────
function IncidentReportSlide() {
  return (
    <div>
      <div className={`${card} rounded-2xl overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00cc6a]/40 dark:via-[#00d294]/40 to-transparent" />

        {/* Collapsed header */}
        <div className="w-full flex items-center justify-between px-4 py-3.5 border-b border-black/[0.05] dark:border-white/[0.04]">
          <div className="flex items-center gap-3">
            <span className="text-sm">📋</span>
            <div>
              <p
                className="text-[#080808] dark:text-white text-sm font-semibold"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Incident Report
              </p>
              <p
                className="text-neutral-500 text-xs mt-0.5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Mar 14, 2026, 02:14 AM · 5 min downtime
              </p>
            </div>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-lg border font-medium text-[#fb2c36] bg-[#fb2c36]/10 border-[#fb2c36]/20"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            HTTP 503
          </span>
        </div>

        {/* Expanded content */}
        <div className="px-4 py-3 space-y-2.5">
          {/* Timeline grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Started', value: '02:14 AM', cls: 'text-[#080808] dark:text-white' },
              { label: 'Resolved', value: '02:19 AM', cls: 'text-[#080808] dark:text-white' },
              { label: 'Duration', value: '5 min', cls: 'text-[#fb2c36]' },
            ].map((t) => (
              <div key={t.label}>
                <p
                  className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {t.label}
                </p>
                <p
                  className={`text-xs font-medium ${t.cls}`}
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {t.value}
                </p>
              </div>
            ))}
          </div>

          {/* Response time comparison */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Baseline', value: '360ms', color: '#00cc6a' },
              { label: 'At Failure', value: 'N/A', color: '#fb2c36' },
              { label: 'At Recovery', value: '287ms', color: '#00cc6a' },
            ].map((r) => (
              <div key={r.label} className={`${innerCard} rounded-xl p-2.5`}>
                <p
                  className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {r.label}
                </p>
                <p
                  className="text-sm font-medium tabular-nums"
                  style={{ color: r.color, fontFamily: "'Geist Mono', monospace" }}
                >
                  {r.value}
                </p>
              </div>
            ))}
          </div>

          {/* Impact */}
          <div className={`${innerCard} rounded-xl p-2.5`}>
            <p
              className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Impact
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <p
                className="text-[#080808] dark:text-white text-xs font-medium"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                1 failed check
              </p>
              <p
                className="text-neutral-500 text-xs"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                ~500 requests affected (est.)
              </p>
            </div>
          </div>

          {/* CopyReportButton */}
          <button className="w-full flex items-center justify-center gap-2 bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.07] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.14] dark:hover:border-white/[0.14] rounded-xl py-2.5 transition-all duration-200">
            <span
              className="text-neutral-500 text-xs font-medium"
              style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Copy incident report
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
