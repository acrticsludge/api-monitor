export interface TimingData {
  dns_lookup_ms: number | null;
  tcp_connect_ms: number | null;
  tls_handshake_ms: number | null;
  ttfb_ms: number | null;
  response_time_ms: number | null;
  status_code: number | null;
  error_detail: string | null;
}

export interface RootCauseAnalysis {
  likelyCause: string;
  confidence: number;
  signals: {
    stage: string;
    value: string;
    status: "normal" | "elevated" | "critical" | "unknown";
  }[];
  suggestion: string;
}

export function analyzeRootCause(
  current: TimingData,
  baseline: Partial<TimingData>,
): RootCauseAnalysis {
  const signals: RootCauseAnalysis["signals"] = [];
  let likelyCause = "Unknown failure";
  let confidence = 40;
  let suggestion = "Check your server logs for more details";

  // DNS
  if (current.dns_lookup_ms !== null) {
    const baselineDns = baseline.dns_lookup_ms ?? 50;
    const ratio = current.dns_lookup_ms / baselineDns;
    signals.push({
      stage: "DNS Lookup",
      value: `${current.dns_lookup_ms}ms`,
      status: ratio > 3 ? "critical" : ratio > 1.5 ? "elevated" : "normal",
    });
    if (ratio > 3) {
      likelyCause = "DNS resolution failure or propagation issue";
      confidence = 75;
      suggestion = "Check your DNS provider or try flushing DNS cache";
    }
  } else {
    signals.push({ stage: "DNS Lookup", value: "N/A", status: "unknown" });
  }

  // TCP
  if (current.tcp_connect_ms !== null) {
    const baselineTcp = baseline.tcp_connect_ms ?? 30;
    const ratio = current.tcp_connect_ms / baselineTcp;
    signals.push({
      stage: "TCP Connect",
      value: `${current.tcp_connect_ms}ms`,
      status: ratio > 3 ? "critical" : ratio > 1.5 ? "elevated" : "normal",
    });
    if (ratio > 3 && confidence < 75) {
      likelyCause = "Network congestion or server unreachable";
      confidence = 70;
      suggestion =
        "Server may be overloaded or network route is congested";
    }
  } else {
    signals.push({
      stage: "TCP Connect",
      value: "Failed",
      status: "critical",
    });
    likelyCause =
      "Server unreachable — connection refused or firewall blocking";
    confidence = 85;
    suggestion = "Server may be down or firewall is blocking connections";
  }

  // TLS
  if (current.tls_handshake_ms !== null) {
    const baselineTls = baseline.tls_handshake_ms ?? 80;
    const ratio = current.tls_handshake_ms / baselineTls;
    signals.push({
      stage: "TLS Handshake",
      value: `${current.tls_handshake_ms}ms`,
      status: ratio > 3 ? "critical" : ratio > 1.5 ? "elevated" : "normal",
    });
    if (ratio > 5 && confidence < 75) {
      likelyCause = "TLS certificate issue or SSL configuration problem";
      confidence = 72;
      suggestion =
        "Check SSL certificate validity and TLS configuration";
    }
  } else {
    signals.push({
      stage: "TLS Handshake",
      value: "N/A",
      status: "unknown",
    });
  }

  // TTFB
  if (current.ttfb_ms !== null) {
    const baselineTtfb = baseline.ttfb_ms ?? 150;
    const ratio = current.ttfb_ms / baselineTtfb;
    signals.push({
      stage: "Time to First Byte",
      value: `${current.ttfb_ms}ms`,
      status: ratio > 5 ? "critical" : ratio > 2 ? "elevated" : "normal",
    });
    if (ratio > 5 && confidence < 75) {
      likelyCause = "Upstream server overload or slow database query";
      confidence = 78;
      suggestion =
        "Server is responding but very slowly — check database queries and server load";
    }
  } else {
    signals.push({
      stage: "Time to First Byte",
      value: "No response",
      status: "critical",
    });
  }

  // Timeout
  if (current.error_detail === "timeout") {
    likelyCause =
      "Request timeout — server did not respond within 10 seconds";
    confidence = 90;
    suggestion = "Server is unreachable or severely overloaded";
  }

  // Status code inference
  if (current.status_code) {
    if (current.status_code === 503) {
      likelyCause =
        "Service unavailable — server overloaded or in maintenance";
      confidence = 92;
      suggestion =
        "Server explicitly reported it cannot handle requests right now";
    } else if (current.status_code === 502) {
      likelyCause =
        "Bad gateway — upstream server returned invalid response";
      confidence = 88;
      suggestion =
        "A proxy or load balancer received a bad response from your server";
    } else if (current.status_code === 504) {
      likelyCause = "Gateway timeout — upstream server too slow";
      confidence = 88;
      suggestion =
        "A proxy is timing out waiting for your server to respond";
    } else if (current.status_code === 429) {
      likelyCause = "Rate limited — too many requests from the monitor";
      confidence = 95;
      suggestion =
        "Consider increasing check interval or whitelisting the monitor IP";
    }
  }

  return { likelyCause, confidence, signals, suggestion };
}
