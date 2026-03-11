import express from "express";
import cron from "node-cron";
import axios from "axios";
import { randomUUID } from "crypto";
import http from "http";
import https from "https";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";
import webpush from "web-push";

// Global error handlers — prevent silent crashes from killing cron
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[FATAL] Unhandled rejection at:", promise, "reason:", reason);
});

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// ── Sanitization helpers ──────────────────────────────────────────────────────

const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

/** Returns true if the URL is a valid http/https URL. */
function isValidHttpUrl(raw) {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Escape HTML special chars to prevent XSS in email bodies. */
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─────────────────────────────────────────────────────────────────────────────

async function pingWithTiming(url, method = "GET", timeoutMs = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const timings = {
      dnsLookup: null,
      tcpConnect: null,
      tlsHandshake: null,
      ttfb: null,
      total: null,
    };

    let socketConnectTime = null;
    let dnsTime = null;

    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const transport = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method.toUpperCase(),
      timeout: timeoutMs,
      headers: {
        "User-Agent": "Pulse-Monitor/1.0",
      },
    };

    const req = transport.request(options, (res) => {
      timings.ttfb = Date.now() - startTime;

      res.on("data", () => {});
      res.on("end", () => {
        timings.total = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          timings,
          error: null,
        });
      });
    });

    req.on("socket", (socket) => {
      socket.on("lookup", () => {
        dnsTime = Date.now() - startTime;
        timings.dnsLookup = dnsTime;
      });

      socket.on("connect", () => {
        socketConnectTime = Date.now() - startTime;
        timings.tcpConnect = socketConnectTime - (dnsTime ?? 0);
      });

      socket.on("secureConnect", () => {
        timings.tlsHandshake =
          Date.now() - startTime - (socketConnectTime ?? 0);
      });
    });

    req.on("timeout", () => {
      req.destroy();
      timings.total = timeoutMs;
      resolve({
        statusCode: null,
        timings,
        error: "timeout",
      });
    });

    req.on("error", (err) => {
      timings.total = Date.now() - startTime;
      resolve({
        statusCode: null,
        timings,
        error: err.message,
      });
    });

    req.end();
  });
}

// Ping a single monitor
async function pingMonitor(monitor) {
  try {
    const method = ALLOWED_METHODS.includes(
      (monitor.method || "").toUpperCase(),
    )
      ? monitor.method.toUpperCase()
      : "GET";

    if (!isValidHttpUrl(monitor.url)) {
      console.warn(`[pingMonitor] Skipping ${monitor.name}: invalid URL`);
      return;
    }

    const result = await pingWithTiming(monitor.url, method, 10000);

    const status =
      result.statusCode === monitor.expected_status_code ? "up" : "down";

    // Save ping result with timing breakdown
    await supabase.from("pings").insert({
      monitor_id: monitor.id,
      status,
      response_time_ms: result.timings.total,
      status_code: result.statusCode,
      dns_lookup_ms: result.timings.dnsLookup,
      tcp_connect_ms: result.timings.tcpConnect,
      tls_handshake_ms: result.timings.tlsHandshake,
      ttfb_ms: result.timings.ttfb,
      error_detail: result.error,
    });

    // Check if we need to send an alert
    await handleAlert(monitor, status);

    // Fetch last 20 pings for anomaly detection
    const { data: recentPings } = await supabase
      .from("pings")
      .select("status, response_time_ms, checked_at")
      .eq("monitor_id", monitor.id)
      .order("checked_at", { ascending: false })
      .limit(20);

    await checkForAnomaly(monitor, recentPings);

    console.log(
      `[${new Date().toISOString()}] ${monitor.name} — ${status} (${result.statusCode}) ${result.timings.total}ms`,
    );
  } catch (err) {
    console.error(`[pingMonitor] Failed for ${monitor.name}:`, err.message);
  }
}

// Send anomaly push notification
async function sendAnomalyPushNotification(monitor, baselineMs, currentMs) {
  try {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", monitor.user_id);

    if (!subs || subs.length === 0) return;

    const payload = JSON.stringify({
      title: `⚠️ ${monitor.name} is degrading`,
      body: `Response time is ${currentMs}ms — ${Math.round(currentMs / baselineMs)}x slower than usual (baseline: ${baselineMs}ms)`,
      url: "/dashboard",
    });

    await Promise.allSettled(
      subs.map(({ id, subscription }) =>
        webpush.sendNotification(subscription, payload).catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            return supabase.from("push_subscriptions").delete().eq("id", id);
          }
        }),
      ),
    );
  } catch (err) {
    console.error(`[sendAnomalyPushNotification] Failed:`, err.message);
  }
}

// Check for response time anomaly — fires when recent avg is 2x+ above 7-day baseline
async function checkForAnomaly(monitor, currentPings) {
  try {
    if (!currentPings || currentPings.length < 3) return;

    const last3 = currentPings
      .slice(0, 3)
      .filter((p) => p.status === "up" && p.response_time_ms !== null);

    if (last3.length < 3) return;

    const recentAvg = last3.reduce((a, b) => a + b.response_time_ms, 0) / 3;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: baselinePings } = await supabase
      .from("pings")
      .select("response_time_ms")
      .eq("monitor_id", monitor.id)
      .eq("status", "up")
      .gte("checked_at", sevenDaysAgo.toISOString())
      .not("response_time_ms", "is", null)
      .order("checked_at", { ascending: false })
      .range(3, 200);

    if (!baselinePings || baselinePings.length < 10) return;

    const baseline =
      baselinePings.reduce((a, b) => a + b.response_time_ms, 0) /
      baselinePings.length;

    if (recentAvg < baseline * 2) return;
    if (recentAvg - baseline < 300) return;

    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const { data: recentAlert } = await supabase
      .from("anomaly_alerts")
      .select("id")
      .eq("monitor_id", monitor.id)
      .gte("triggered_at", thirtyMinutesAgo.toISOString())
      .limit(1);

    if (recentAlert && recentAlert.length > 0) return;

    await supabase.from("anomaly_alerts").insert({
      monitor_id: monitor.id,
      type: "degradation",
      baseline_ms: Math.round(baseline),
      current_avg_ms: Math.round(recentAvg),
    });

    await sendAnomalyPushNotification(
      monitor,
      Math.round(baseline),
      Math.round(recentAvg),
    );

    console.log(
      `[ANOMALY] ${monitor.name} — avg ${Math.round(recentAvg)}ms vs baseline ${Math.round(baseline)}ms`,
    );
  } catch (err) {
    console.error(`[checkForAnomaly] Failed for ${monitor.name}:`, err.message);
  }
}

// Handle alerting logic
async function handleAlert(monitor, currentStatus) {
  try {
    const { data: lastPings } = await supabase
      .from("pings")
      .select("status, response_time_ms, status_code")
      .eq("monitor_id", monitor.id)
      .order("checked_at", { ascending: false })
      .limit(3);

    if (!lastPings || lastPings.length < 2) return;

    const [latest, previous, beforeThat] = lastPings;

    // For DOWN alert: require 2 consecutive down pings before alerting
    // This prevents false alerts from single network hiccups
    if (currentStatus === "down") {
      const twoConsecutiveDown =
        latest.status === "down" && previous.status === "down";
      const wasUpBefore = beforeThat ? beforeThat.status === "up" : true;
      if (!twoConsecutiveDown || !wasUpBefore) return;
    }

    // For RECOVERED alert: current is up, previous was down
    if (currentStatus === "up" && previous.status !== "down") return;

    await sendAlert(monitor, currentStatus, lastPings);
  } catch (err) {
    console.error(`[handleAlert] Failed for ${monitor.name}:`, err.message);
  }
}

// Send email alert via Resend
async function sendAlert(monitor, type, lastPings = []) {
  try {
    const latestPing = lastPings[0];
    const statusCode = latestPing?.status_code ?? null;
    const lastResponseTime =
      lastPings.find((p) => p.response_time_ms)?.response_time_ms ?? null;

    // Determine incident_id and downtime for this alert
    let incidentId;
    let downtimeMinutes = null;

    if (type === "down") {
      incidentId = randomUUID();
    } else {
      const { data: lastDownAlert } = await supabase
        .from("alerts")
        .select("incident_id, sent_at")
        .eq("monitor_id", monitor.id)
        .eq("type", "down")
        .order("sent_at", { ascending: false })
        .limit(1);
      incidentId = lastDownAlert?.[0]?.incident_id ?? randomUUID();
      if (lastDownAlert?.[0]?.sent_at) {
        const downAt = new Date(lastDownAlert[0].sent_at);
        downtimeMinutes = Math.round((Date.now() - downAt.getTime()) / 1000 / 60);
      }
    }

    // Always record the alert first regardless of email/push success
    await supabase.from("alerts").insert({
      monitor_id: monitor.id,
      type,
      status_code: statusCode ?? null,
      response_time_ms: lastResponseTime ?? null,
      downtime_minutes: downtimeMinutes,
      incident_id: incidentId,
    });

    // Then try email — failure won't affect alert recording
    const { data: user } = await supabase.auth.admin.getUserById(
      monitor.user_id,
    );
    if (user?.user?.email) {
      const safeName = escapeHtml(monitor.name);
      const safeUrl = escapeHtml(monitor.url);
      const isDown = type === "down";

      const subject = isDown
        ? `🔴 ${monitor.name} is down`
        : `🟢 ${monitor.name} has recovered`;

      const html = isDown
        ? `
          <h2>${safeName} is down</h2>
          <p><strong>URL:</strong> ${safeUrl}</p>
          <p><strong>Status Code:</strong> ${statusCode ?? "No response (timeout)"}</p>
          <p><strong>Last Response Time:</strong> ${lastResponseTime ? lastResponseTime + "ms" : "N/A"}</p>
          <p><strong>Expected Status:</strong> ${monitor.expected_status_code}</p>
          <p><strong>Time:</strong> ${new Date().toUTCString()}</p>
          <p>Check your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/monitors/${monitor.id}">monitor dashboard</a> for more details.</p>
        `
        : `
          <h2>${safeName} has recovered</h2>
          <p><strong>URL:</strong> ${safeUrl}</p>
          <p><strong>Status Code:</strong> ${statusCode ?? "N/A"}</p>
          <p><strong>Response Time:</strong> ${lastResponseTime ? lastResponseTime + "ms" : "N/A"}</p>
          <p><strong>Time:</strong> ${new Date().toUTCString()}</p>
        `;

      const { error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.user.email,
        subject,
        html,
      });

      if (error) {
        console.error(`Failed to send email alert:`, error);
      } else {
        console.log(`Alert sent to ${user.user.email} — ${type}`);
      }
    }

    // Webhook
    if (monitor.webhook_url && isValidHttpUrl(monitor.webhook_url)) {
      await sendWebhook(monitor, type, statusCode, lastResponseTime);
    }

    // Push notification
    await sendPushNotification(monitor, type, statusCode, lastResponseTime);
  } catch (err) {
    console.error(`[sendAlert] Failed for ${monitor.name}:`, err.message);
  }
}

// Send webhook — supports Discord, Slack, and generic JSON
async function sendWebhook(monitor, type, statusCode, lastResponseTime) {
  try {
    const isDown = type === "down";
    const isDiscord = monitor.webhook_url.includes("discord.com/api/webhooks");
    const isSlack = monitor.webhook_url.includes("hooks.slack.com");

    let body;

    if (isDiscord) {
      body = {
        embeds: [
          {
            title: isDown
              ? `🔴 ${monitor.name} is down`
              : `🟢 ${monitor.name} recovered`,
            color: isDown ? 15158332 : 5763719,
            fields: [
              { name: "URL", value: monitor.url, inline: true },
              {
                name: "Status Code",
                value: statusCode?.toString() ?? "Timeout",
                inline: true,
              },
              {
                name: "Last Response Time",
                value: lastResponseTime ? `${lastResponseTime}ms` : "N/A",
                inline: true,
              },
              {
                name: "Expected Status",
                value: monitor.expected_status_code.toString(),
                inline: true,
              },
              { name: "Time", value: new Date().toUTCString(), inline: false },
            ],
            footer: { text: "Pulse API Monitor" },
          },
        ],
      };
    } else if (isSlack) {
      body = {
        text: isDown
          ? `🔴 *${monitor.name}* is down`
          : `🟢 *${monitor.name}* recovered`,
        attachments: [
          {
            color: isDown ? "danger" : "good",
            fields: [
              { title: "URL", value: monitor.url, short: true },
              {
                title: "Status Code",
                value: statusCode?.toString() ?? "Timeout",
                short: true,
              },
              {
                title: "Response Time",
                value: lastResponseTime ? `${lastResponseTime}ms` : "N/A",
                short: true,
              },
              {
                title: "Expected Status",
                value: monitor.expected_status_code.toString(),
                short: true,
              },
              { title: "Time", value: new Date().toUTCString(), short: false },
            ],
            footer: "Pulse API Monitor",
          },
        ],
      };
    } else {
      body = {
        monitor_id: monitor.id,
        monitor_name: monitor.name,
        monitor_url: monitor.url,
        type,
        status_code: statusCode,
        last_response_time_ms: lastResponseTime,
        expected_status_code: monitor.expected_status_code,
        timestamp: new Date().toISOString(),
      };
    }

    await axios.post(monitor.webhook_url, body);
    console.log(`Webhook sent to ${monitor.webhook_url} — ${type}`);
  } catch (err) {
    console.error(`Webhook failed:`, err.message);
  }
}

// Send browser push notification to all subscribed devices for this monitor's owner
// Note: NEXT_PUBLIC_APP_URL must be set in worker environment (e.g. https://api-monitor-seven.vercel.app)
async function sendPushNotification(
  monitor,
  type,
  statusCode,
  lastResponseTime,
) {
  try {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", monitor.user_id);

    if (!subs || subs.length === 0) return;

    const isDown = type === "down";
    const contextLine = isDown
      ? `${statusCode ? "Status: " + statusCode : "No response (timeout)"}${lastResponseTime ? " · Was " + lastResponseTime + "ms" : ""}`
      : `Back online${lastResponseTime ? " · Responding in " + lastResponseTime + "ms" : ""}`;

    const payload = JSON.stringify({
      title: isDown
        ? `🔴 ${monitor.name} is down`
        : `🟢 ${monitor.name} recovered`,
      body: contextLine.trim(),
      url: `/dashboard/monitors/${monitor.id}`,
    });

    await Promise.allSettled(
      subs.map(({ id, subscription }) =>
        webpush.sendNotification(subscription, payload).catch((err) => {
          // Subscription is expired or invalid — clean it up
          if (err.statusCode === 404 || err.statusCode === 410) {
            return supabase.from("push_subscriptions").delete().eq("id", id);
          }
        }),
      ),
    );

    console.log(`Push notification sent — ${type} for ${monitor.name}`);
  } catch (err) {
    console.error(`[sendPushNotification] Failed:`, err.message);
  }
}

const WORKER_URL =
  process.env.WORKER_URL || `http://localhost:${process.env.PORT || 3001}`;

let lastPingTime = null;

// Main job — runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    lastPingTime = new Date().toISOString();
    console.log("Running monitor checks...");

    const { data: monitors, error } = await supabase
      .from("monitors")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching monitors:", error);
      return;
    }

    if (!monitors || monitors.length === 0) {
      console.log("No active monitors found.");
      return;
    }

    await Promise.allSettled(monitors.map(pingMonitor));
  } catch (err) {
    console.error("[CRON ERROR] Monitor check failed:", err);
  }
});

// Keep-alive ping to prevent Railway hibernation
cron.schedule("*/4 * * * *", async () => {
  try {
    await axios.get(`${WORKER_URL}/`);
    console.log("[keep-alive] Worker pinged successfully");
  } catch (err) {
    console.error("[keep-alive] Self-ping failed:", err.message);
  }
});

// Daily job — delete pings older than 7 days
cron.schedule("0 0 * * *", async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const { error } = await supabase
    .from("pings")
    .delete()
    .lt("checked_at", cutoff.toISOString());

  if (error) {
    console.error("Failed to clean old pings:", error);
  } else {
    console.log("Old pings cleaned up");
  }
});

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({
    status: "worker running",
    lastPingCycle: lastPingTime,
    uptime: process.uptime(),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Worker running on port ${PORT}`);
});
