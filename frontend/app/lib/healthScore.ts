export type HealthLabel = 'Healthy' | 'Degraded' | 'Critical' | 'No Data'

export interface HealthScore {
  score: number
  label: HealthLabel
  reasons: string[]
}

export function calculateHealthScore(pings: {
  status: string
  response_time_ms: number | null
  status_code: number | null
  checked_at: string
}[]): HealthScore {
  if (!pings || pings.length < 3) {
    return { score: 0, label: 'No Data', reasons: ['Not enough data yet'] }
  }

  // Use last 20 pings max
  const recent = pings.slice(0, 20)
  let score = 100
  const reasons: string[] = []

  // 1. Uptime penalty
  const downPings = recent.filter(p => p.status === 'down').length
  const downPercent = (downPings / recent.length) * 100
  if (downPercent > 0) {
    const penalty = Math.min(50, downPercent * 2)
    score -= penalty
    reasons.push(`${downPercent.toFixed(0)}% of recent checks failed`)
  }

  // 2. Response time baseline vs recent average
  const validTimes = recent
    .filter(p => p.response_time_ms !== null && p.status === 'up')
    .map(p => p.response_time_ms as number)

  if (validTimes.length >= 3) {
    const avgTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length

    // Absolute response time penalty
    if (avgTime > 3000) {
      score -= 20
      reasons.push(`High avg response time: ${Math.round(avgTime)}ms`)
    } else if (avgTime > 1500) {
      score -= 10
      reasons.push(`Elevated avg response time: ${Math.round(avgTime)}ms`)
    } else if (avgTime > 800) {
      score -= 5
      reasons.push(`Slightly slow avg response time: ${Math.round(avgTime)}ms`)
    }

    // Response time variance penalty (inconsistency)
    const max = Math.max(...validTimes)
    const min = Math.min(...validTimes)
    const variance = max - min
    if (variance > 2000) {
      score -= 10
      reasons.push(`Inconsistent response times (${Math.round(min)}ms - ${Math.round(max)}ms)`)
    } else if (variance > 1000) {
      score -= 5
      reasons.push(`Variable response times detected`)
    }
  }

  // 3. Non-200 status codes even when "up"
  const unexpectedCodes = recent.filter(
    p => p.status === 'up' && p.status_code && p.status_code >= 400
  ).length
  if (unexpectedCodes > 0) {
    score -= unexpectedCodes * 5
    reasons.push(`${unexpectedCodes} unexpected status codes detected`)
  }

  // 4. Recent trend — are last 3 pings worse than overall?
  if (recent.length >= 6) {
    const last3 = recent.slice(0, 3)
    const prev3 = recent.slice(3, 6)
    const last3Avg = last3
      .filter(p => p.response_time_ms !== null)
      .reduce((a, b) => a + (b.response_time_ms ?? 0), 0) / 3
    const prev3Avg = prev3
      .filter(p => p.response_time_ms !== null)
      .reduce((a, b) => a + (b.response_time_ms ?? 0), 0) / 3

    if (last3Avg > prev3Avg * 1.5 && last3Avg - prev3Avg > 200) {
      score -= 10
      reasons.push(`Response time trending up recently`)
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  const label: HealthLabel =
    score >= 80 ? 'Healthy' :
    score >= 50 ? 'Degraded' :
    score > 0 ? 'Critical' : 'No Data'

  if (reasons.length === 0) reasons.push('All systems nominal')

  return { score, label, reasons }
}
