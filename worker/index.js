import express from "express";
import cron from "node-cron";
import axios from "axios";
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

// Ping a single monitor
async function pingMonitor(monitor) {
  try {
    const start = Date.now();
    let status = "up";
    let statusCode = null;
    let responseTime = null;

    try {
      const response = await axios({
        method: monitor.method || "GET",
        url: monitor.url,
        timeout: 10000,
      });
      statusCode = response.status;
      responseTime = Date.now() - start;
      status = statusCode === monitor.expected_status_code ? "up" : "down";
    } catch (error) {
      status = "down";
      statusCode = error.response?.status || null;
      responseTime = Date.now() - start;
    }

    // Save ping result
    await supabase.from("pings").insert({
      monitor_id: monitor.id,
      status,
      response_time_ms: responseTime,
      status_code: statusCode,
    });

    // Check if we need to send an alert
    await handleAlert(monitor, status);

    console.log(
      `[${new Date().toISOString()}] ${monitor.name} — ${status} (${statusCode}) ${responseTime}ms`,
    );
  } catch (err) {
    console.error(`[pingMonitor] Failed for ${monitor.name}:`, err.message);
  }
}

// Handle alerting logic
async function handleAlert(monitor, currentStatus) {
  try {
    const { data: lastPings } = await supabase
      .from("pings")
      .select("status")
      .eq("monitor_id", monitor.id)
      .order("checked_at", { ascending: false })
      .limit(2);

    if (!lastPings || lastPings.length < 2) return;

    const previousStatus = lastPings[1].status;

    if (previousStatus === "up" && currentStatus === "down") {
      await sendAlert(monitor, "down");
    }

    if (previousStatus === "down" && currentStatus === "up") {
      await sendAlert(monitor, "recovered");
    }
  } catch (err) {
    console.error(`[handleAlert] Failed for ${monitor.name}:`, err.message);
  }
}

// Send email alert via Resend
async function sendAlert(monitor, type) {
  try {
    // Always record the alert first regardless of email/push success
    await supabase.from("alerts").insert({
      monitor_id: monitor.id,
      type,
    });

    // Then try email — failure won't affect alert recording
    const { data: user } = await supabase.auth.admin.getUserById(monitor.user_id);
    if (user?.user?.email) {
      const subject =
        type === "down"
          ? `🔴 ${monitor.name} is down`
          : `🟢 ${monitor.name} has recovered`;

      const html =
        type === "down"
          ? `<p>Your monitor <strong>${monitor.name}</strong> (<code>${monitor.url}</code>) is currently returning an unexpected response.</p>`
          : `<p>Your monitor <strong>${monitor.name}</strong> (<code>${monitor.url}</code>) has recovered and is responding normally.</p>`;

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
    if (monitor.webhook_url) {
      try {
        const isDown = type === "down";

        // Detect if it's a Discord webhook
        const isDiscord = monitor.webhook_url.includes(
          "discord.com/api/webhooks",
        );

        const body = isDiscord
          ? {
              embeds: [
                {
                  title: isDown
                    ? `🔴 ${monitor.name} is down`
                    : `🟢 ${monitor.name} recovered`,
                  color: isDown ? 15158332 : 5763719,
                  fields: [
                    { name: "URL", value: monitor.url, inline: true },
                    {
                      name: "Status",
                      value: isDown ? "DOWN" : "RECOVERED",
                      inline: true,
                    },
                    {
                      name: "Time",
                      value: new Date().toUTCString(),
                      inline: false,
                    },
                  ],
                  footer: { text: "Pulse API Monitor" },
                },
              ],
            }
          : {
              monitor_id: monitor.id,
              monitor_name: monitor.name,
              monitor_url: monitor.url,
              type,
              timestamp: new Date().toISOString(),
            };

        await axios.post(monitor.webhook_url, body);
        console.log(`Webhook sent to ${monitor.webhook_url}`);
      } catch (err) {
        console.error(`Webhook failed:`, err.message);
      }
    }

    // Push notification
    await sendPushNotification(monitor, type);
  } catch (err) {
    console.error(`[sendAlert] Failed for ${monitor.name}:`, err.message);
  }
}

// Send browser push notification to all subscribed devices for this monitor's owner
async function sendPushNotification(monitor, type) {
  try {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", monitor.user_id);

    if (!subs || subs.length === 0) return;

    const isDown = type === "down";
    const payload = JSON.stringify({
      title: isDown
        ? `🔴 ${monitor.name} is down`
        : `🟢 ${monitor.name} recovered`,
      body: isDown
        ? `${monitor.url} is not responding`
        : `${monitor.url} is back online`,
      url: "/dashboard",
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

// RAILWAY DEPLOYMENT NOTE:
// Set WORKER_URL env var to your Railway public URL (e.g. https://your-worker.railway.app)
// This is used by the keep-alive cron to prevent Railway from hibernating the service.
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
