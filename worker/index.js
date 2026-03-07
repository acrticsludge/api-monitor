import express from "express";
import cron from "node-cron";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Ping a single monitor
async function pingMonitor(monitor) {
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
}

// Handle alerting logic
async function handleAlert(monitor, currentStatus) {
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
}

// Send email alert via Resend
async function sendAlert(monitor, type) {
  const { data: user } = await supabase.auth.admin.getUserById(monitor.user_id);
  if (!user?.user?.email) return;

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
    console.error(`Failed to send alert:`, error);
    return;
  }

  await supabase.from("alerts").insert({
    monitor_id: monitor.id,
    type,
  });

  console.log(`Alert sent to ${user.user.email} — ${type}`);
}

// Main job — runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
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

  await Promise.all(monitors.map(pingMonitor));
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "worker running" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Worker running on port ${PORT}`);
});
