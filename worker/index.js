import express from "express";
import cron from "node-cron";
import axios from "axios";
import { randomUUID, createHash, createDecipheriv } from "crypto";
import http from "http";
import https from "https";
import tls from "tls";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";
import webpush from "web-push";

// ── Decryption helper (AES-256-GCM) ──────────────────────────────────────────

const ENC_KEY_HEX = process.env.MONITOR_ENCRYPTION_KEY ?? "";

function decryptField(encoded) {
  if (!encoded) return null;
  try {
    const key = Buffer.from(ENC_KEY_HEX, "hex");
    const [ivHex, tagHex, ctHex] = encoded.split(":");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return decipher.update(Buffer.from(ctHex, "hex")).toString("utf8") + decipher.final("utf8");
  } catch {
    return null;
  }
}

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

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemonitor.dev").replace(/\/$/, "");

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

// ── Pro: schema change detection helpers ─────────────────────────────────────

function extractKeys(obj, prefix = "") {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.keys(obj).flatMap((key) =>
    extractKeys(obj[key], prefix ? `${prefix}.${key}` : key),
  );
}

function hashResponseStructure(body) {
  try {
    const parsed = JSON.parse(body);
    const keys = extractKeys(parsed).sort().join(",");
    return createHash("md5").update(keys).digest("hex");
  } catch {
    return createHash("md5").update(body?.slice(0, 500) ?? "").digest("hex");
  }
}

function hashHeaders(headers) {
  const relevant = ["content-type", "x-powered-by", "server"];
  const str = relevant.map((h) => `${h}:${headers[h] ?? ""}`).join(",");
  return createHash("md5").update(str).digest("hex");
}

// ── Pro: response validation ──────────────────────────────────────────────────

async function validateResponse(body, validation) {
  if (!validation || !validation.path) return { passed: true, detail: null };

  try {
    const parsed = JSON.parse(body);
    const keys = validation.path.split(".");
    let value = parsed;
    for (const key of keys) {
      value = value?.[key];
    }

    const { operator, expected } = validation;

    if (operator === "equals") {
      const passed = String(value) === String(expected);
      return {
        passed,
        detail: passed ? null : `Expected ${expected}, got ${value}`,
      };
    }
    if (operator === "contains") {
      const passed = String(value).includes(expected);
      return {
        passed,
        detail: passed
          ? null
          : `Value "${value}" does not contain "${expected}"`,
      };
    }
    if (operator === "not_empty") {
      const passed =
        value !== null &&
        value !== undefined &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0);
      return {
        passed,
        detail: passed ? null : `Field "${validation.path}" is empty`,
      };
    }

    return { passed: true, detail: null };
  } catch {
    return { passed: false, detail: "Could not parse response body for validation" };
  }
}

// ── Pro: SSL certificate check ────────────────────────────────────────────────

async function checkSSL(url) {
  return new Promise((resolve) => {
    try {
      const { hostname } = new URL(url);
      const socket = tls.connect(443, hostname, { servername: hostname }, () => {
        const cert = socket.getPeerCertificate();
        socket.destroy();

        if (!cert || !cert.valid_to) {
          return resolve({ valid: false, expiresAt: null, daysRemaining: null });
        }

        const expiresAt = new Date(cert.valid_to);
        const daysRemaining = Math.floor(
          (expiresAt.getTime() - Date.now()) / 1000 / 60 / 60 / 24,
        );

        resolve({ valid: true, expiresAt, daysRemaining });
      });

      socket.on("error", () =>
        resolve({ valid: false, expiresAt: null, daysRemaining: null }),
      );
      socket.setTimeout(5000, () => {
        socket.destroy();
        resolve({ valid: false, expiresAt: null, daysRemaining: null });
      });
    } catch {
      resolve({ valid: false, expiresAt: null, daysRemaining: null });
    }
  });
}

// ── Pro: direct push notification (for schema/SSL alerts) ────────────────────

// Returns true if the subscription belongs to this app's origin (or has no origin = legacy)
function isOwnOrigin(subscription) {
  if (!subscription.origin) return true; // legacy sub, keep sending
  return subscription.origin === APP_URL;
}

async function sendPushNotificationDirect(userId, title, body) {
  try {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", userId);

    if (!subs || subs.length === 0) return;

    const payload = JSON.stringify({ title, body, url: `${APP_URL}/dashboard` });

    await Promise.allSettled(
      subs.filter(({ subscription }) => isOwnOrigin(subscription)).map(({ id, subscription }) =>
        webpush.sendNotification(subscription, payload).catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            return supabase.from("push_subscriptions").delete().eq("id", id);
          }
        }),
      ),
    );
  } catch (err) {
    console.error("[sendPushNotificationDirect] Failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function pingWithTiming(url, method = "GET", timeoutMs = 10000, options = {}) {
  const {
    customHeaders = {},
    customBody = null,
    authType = "none",
    authValue = null,
  } = options;

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

    const headers = {
      "User-Agent": "Pulse-Monitor/1.0",
      ...customHeaders,
    };

    if (authType === "bearer" && authValue) {
      headers["Authorization"] = `Bearer ${authValue}`;
    } else if (authType === "api_key" && authValue) {
      headers["X-API-Key"] = authValue;
    } else if (authType === "basic" && authValue) {
      headers["Authorization"] = `Basic ${Buffer.from(authValue).toString("base64")}`;
    }

    const methodUpper = method.toUpperCase();
    const bodyStr =
      customBody &&
      ["POST", "PUT", "PATCH"].includes(methodUpper)
        ? String(customBody)
        : null;

    if (bodyStr) {
      headers["Content-Length"] = Buffer.byteLength(bodyStr);
    }

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: methodUpper,
      timeout: timeoutMs,
      headers,
    };

    const req = transport.request(reqOptions, (res) => {
      timings.ttfb = Date.now() - startTime;

      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        timings.total = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          timings,
          body,
          responseHeaders: res.headers,
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
        body: "",
        responseHeaders: {},
        error: "timeout",
      });
    });

    req.on("error", (err) => {
      timings.total = Date.now() - startTime;
      resolve({
        statusCode: null,
        timings,
        body: "",
        responseHeaders: {},
        error: err.message,
      });
    });

    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

// Profile map — refreshed on each cron cycle
let profileMap = {};

async function refreshProfileMap(monitors) {
  try {
    const userIds = [...new Set((monitors ?? []).map((m) => m.user_id))];
    if (userIds.length === 0) return;

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, is_pro")
      .in("id", userIds);

    profileMap = Object.fromEntries(
      (profilesData ?? []).map((p) => [p.id, p]),
    );
  } catch (err) {
    console.error("[refreshProfileMap] Failed:", err.message);
  }
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

    const isPro = profileMap[monitor.user_id]?.is_pro ?? false;

    const pingOptions = isPro
      ? {
          customHeaders: monitor.custom_headers ?? {},
          customBody: decryptField(monitor.custom_body),
          authType: monitor.auth_type ?? "none",
          authValue: decryptField(monitor.auth_value),
        }
      : {};

    const result = await pingWithTiming(monitor.url, method, 10000, pingOptions);

    let status =
      result.statusCode === monitor.expected_status_code ? "up" : "down";

    // ── Pro: response validation ──────────────────────────────────────────────
    let validationPassed = null;
    let validationDetail = null;

    if (isPro && monitor.response_validation) {
      const validation = await validateResponse(
        result.body,
        monitor.response_validation,
      );
      validationPassed = validation.passed;
      validationDetail = validation.detail;

      if (!validationPassed) {
        status = "down";
      }
    }

    // Build pingData object — extra Pro fields added below
    const pingData = {
      monitor_id: monitor.id,
      status,
      response_time_ms: result.timings.total,
      status_code: result.statusCode,
      dns_lookup_ms: result.timings.dnsLookup,
      tcp_connect_ms: result.timings.tcpConnect,
      tls_handshake_ms: result.timings.tlsHandshake,
      ttfb_ms: result.timings.ttfb,
      error_detail: result.error,
    };

    // ── Pro: schema change detection ──────────────────────────────────────────
    if (isPro) {
      const bodyHash = hashResponseStructure(result.body);
      const headersHash = hashHeaders(result.responseHeaders ?? {});

      const { data: lastPing } = await supabase
        .from("pings")
        .select("response_body_hash, response_headers_hash")
        .eq("monitor_id", monitor.id)
        .eq("status", "up")
        .order("checked_at", { ascending: false })
        .limit(1)
        .single();

      const schemaChanged =
        lastPing &&
        lastPing.response_body_hash &&
        lastPing.response_body_hash !== bodyHash;

      const headersChanged =
        lastPing &&
        lastPing.response_headers_hash &&
        lastPing.response_headers_hash !== headersHash;

      if (schemaChanged || headersChanged) {
        await supabase.from("schema_alerts").insert({
          monitor_id: monitor.id,
          type: "schema_change",
          detail: schemaChanged
            ? "Response structure changed"
            : "Response headers changed",
        });

        if (monitor.notify_on_schema_change !== false) {
          await sendPushNotificationDirect(
            monitor.user_id,
            `🔄 ${monitor.name} — API structure changed`,
            schemaChanged
              ? "Response body structure has changed"
              : "Response headers changed",
          );
        }

        console.log(`[SCHEMA CHANGE] ${monitor.name}`);
      }

      pingData.response_body_hash = bodyHash;
      pingData.response_headers_hash = headersHash;
      pingData.schema_changed = schemaChanged ?? false;
      pingData.validation_passed = validationPassed;
      pingData.validation_detail = validationDetail;
    }

    // ── Pro: SSL monitoring ───────────────────────────────────────────────────
    if (isPro && monitor.check_ssl && monitor.url.startsWith("https")) {
      const ssl = await checkSSL(monitor.url);

      pingData.ssl_valid = ssl.valid;
      pingData.ssl_expires_at = ssl.expiresAt?.toISOString() ?? null;
      pingData.ssl_days_remaining = ssl.daysRemaining;

      if (ssl.valid && ssl.daysRemaining !== null && ssl.daysRemaining <= 30) {
        const { data: recentSSLAlert } = await supabase
          .from("schema_alerts")
          .select("id")
          .eq("monitor_id", monitor.id)
          .eq("type", "ssl_expiry")
          .gte(
            "triggered_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          )
          .limit(1);

        if (!recentSSLAlert?.length) {
          await supabase.from("schema_alerts").insert({
            monitor_id: monitor.id,
            type: "ssl_expiry",
            detail: `SSL certificate expires in ${ssl.daysRemaining} days`,
          });

          await sendPushNotificationDirect(
            monitor.user_id,
            `🔒 ${monitor.name} — SSL expiring soon`,
            `Certificate expires in ${ssl.daysRemaining} days`,
          );
        }
      }

      if (!ssl.valid) {
        await sendPushNotificationDirect(
          monitor.user_id,
          `🔴 ${monitor.name} — SSL certificate invalid`,
          "Certificate may be expired or misconfigured",
        );
      }
    }

    // Save ping result
    await supabase.from("pings").insert(pingData);

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
      url: `${APP_URL}/dashboard`,
    });

    await Promise.allSettled(
      subs.filter(({ subscription }) => isOwnOrigin(subscription)).map(({ id, subscription }) =>
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
    if (currentStatus === "down") {
      const twoConsecutiveDown =
        latest.status === "down" && previous.status === "down";
      const wasUpBefore = beforeThat ? beforeThat.status === "up" : true;
      if (!twoConsecutiveDown || !wasUpBefore) return;
    }

    // For RECOVERED alert: current is up, previous was down
    if (currentStatus === "up" && previous.status !== "down") return;

    const alertType = currentStatus === "up" ? "recovered" : "down";
    await sendAlert(monitor, alertType, lastPings);
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

    await supabase.from("alerts").insert({
      monitor_id: monitor.id,
      type,
      status_code: statusCode ?? null,
      response_time_ms: lastResponseTime ?? null,
      downtime_minutes: downtimeMinutes,
      incident_id: incidentId,
    });

    const isPro = profileMap[monitor.user_id]?.is_pro ?? false;

    if (isPro) {
      const { data: user } = await supabase.auth.admin.getUserById(
        monitor.user_id,
      );
      if (user?.user?.email) {
        const safeName = escapeHtml(monitor.name);
        const safeUrl = escapeHtml(monitor.url);
        const isDown = type === "down";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pulsemonitor.dev";

        const subject = isDown
          ? `🔴 ${monitor.name} is down`
          : `🟢 ${monitor.name} has recovered`;

        const html = isDown
          ? `
            <div style="font-family: monospace; max-width: 520px; margin: 0 auto; background: #0f0f0f; color: #d4d4d4; padding: 32px; border-radius: 12px;">
              <h2 style="color: #ff4444; margin-top: 0;">🔴 ${safeName} is down</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #737373;">URL</td><td>${safeUrl}</td></tr>
                <tr><td style="padding: 6px 0; color: #737373;">Status Code</td><td>${statusCode ?? "No response (timeout)"}</td></tr>
                <tr><td style="padding: 6px 0; color: #737373;">Last Response Time</td><td>${lastResponseTime ? lastResponseTime + "ms" : "N/A"}</td></tr>
                <tr><td style="padding: 6px 0; color: #737373;">Expected Status</td><td>${monitor.expected_status_code}</td></tr>
                <tr><td style="padding: 6px 0; color: #737373;">Time</td><td>${new Date().toUTCString()}</td></tr>
              </table>
              <a href="${appUrl}/dashboard/monitors/${monitor.id}" style="display: inline-block; margin-top: 24px; background: #00ff87; color: #000; font-weight: bold; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                View Monitor →
              </a>
              <p style="margin-top: 24px; color: #525252; font-size: 11px;">Pulse API Monitor · pulsemonitor.dev</p>
            </div>
          `
          : `
            <div style="font-family: monospace; max-width: 520px; margin: 0 auto; background: #0f0f0f; color: #d4d4d4; padding: 32px; border-radius: 12px;">
              <h2 style="color: #00ff87; margin-top: 0;">🟢 ${safeName} has recovered</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #737373;">URL</td><td>${safeUrl}</td></tr>
                <tr><td style="padding: 6px 0; color: #737373;">Status Code</td><td>${statusCode ?? "N/A"}</td></tr>
                <tr><td style="padding: 6px 0; color: #737373;">Response Time</td><td>${lastResponseTime ? lastResponseTime + "ms" : "N/A"}</td></tr>
                <tr><td style="padding: 6px 0; color: #737373;">Time</td><td>${new Date().toUTCString()}</td></tr>
              </table>
              <a href="${appUrl}/dashboard/monitors/${monitor.id}" style="display: inline-block; margin-top: 24px; background: #00ff87; color: #000; font-weight: bold; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                View Monitor →
              </a>
              <p style="margin-top: 24px; color: #525252; font-size: 11px;">Pulse API Monitor · pulsemonitor.dev</p>
            </div>
          `;

        const { error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "alerts@pulsemonitor.dev",
          to: user.user.email,
          subject,
          html,
        });

        if (error) {
          console.error(`Failed to send email alert:`, error);
        } else {
          console.log(`Email sent to ${user.user.email} — ${type}`);
        }
      }
    } else {
      console.log(`[EMAIL SKIPPED] ${monitor.name} — user is on free tier`);
    }

    if (monitor.webhook_url && isValidHttpUrl(monitor.webhook_url)) {
      await sendWebhook(monitor, type, statusCode, lastResponseTime);
    }

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
      url: `${APP_URL}/dashboard/monitors/${monitor.id}/incidents`,
    });

    await Promise.allSettled(
      subs.filter(({ subscription }) => isOwnOrigin(subscription)).map(({ id, subscription }) =>
        webpush.sendNotification(subscription, payload).catch((err) => {
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

// ── Pro: extended ping history cleanup ────────────────────────────────────────

async function cleanOldPings() {
  try {
    const { data: proProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_pro", true);

    const proUserIds = proProfiles?.map((p) => p.id) ?? [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (proUserIds.length > 0) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Delete old pings for Pro users (90 days)
      const { data: proMonitors } = await supabase
        .from("monitors")
        .select("id")
        .in("user_id", proUserIds);

      const proMonitorIds = proMonitors?.map((m) => m.id) ?? [];

      if (proMonitorIds.length > 0) {
        await supabase
          .from("pings")
          .delete()
          .in("monitor_id", proMonitorIds)
          .lt("checked_at", ninetyDaysAgo.toISOString());
      }

      // Delete old pings for free users (7 days)
      if (proMonitorIds.length > 0) {
        await supabase
          .from("pings")
          .delete()
          .not("monitor_id", "in", `(${proMonitorIds.map((id) => `'${id}'`).join(",")})`)
          .lt("checked_at", sevenDaysAgo.toISOString());
      } else {
        await supabase
          .from("pings")
          .delete()
          .lt("checked_at", sevenDaysAgo.toISOString());
      }
    } else {
      await supabase
        .from("pings")
        .delete()
        .lt("checked_at", sevenDaysAgo.toISOString());
    }

    console.log("[CLEANUP] Old pings deleted");
  } catch (err) {
    console.error("[CLEANUP] Failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

const WORKER_URL =
  process.env.WORKER_URL || `http://localhost:${process.env.PORT || 3001}`;

let lastPingTime = null;

// Main job — runs every minute, filters by each monitor's interval
cron.schedule("* * * * *", async () => {
  try {
    lastPingTime = new Date().toISOString();
    console.log("Running monitor checks...");

    const { data: monitors, error } = await supabase
      .from("monitors")
      .select("*, projects(id, name, slug)")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching monitors:", error);
      return;
    }

    if (!monitors || monitors.length === 0) {
      console.log("No active monitors found.");
      return;
    }

    await refreshProfileMap(monitors);

    const now = new Date();

    const monitorsToRun = monitors.filter((monitor) => {
      const isPro = profileMap[monitor.user_id]?.is_pro ?? false;
      const interval = monitor.check_interval_minutes ?? 5;
      // Pro users can have 1-min intervals; free users minimum 5 min
      const effectiveInterval = isPro ? interval : Math.max(5, interval);
      return now.getMinutes() % effectiveInterval === 0;
    });

    await Promise.allSettled(monitorsToRun.map(pingMonitor));
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

// Daily job — delete old pings (respects Pro 90-day vs free 7-day retention)
cron.schedule("0 0 * * *", async () => {
  await cleanOldPings();
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
