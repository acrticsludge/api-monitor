"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase-server";

// ── Validation helpers ────────────────────────────────────────────────────────

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the normalized URL string if valid http/https, otherwise null. */
function parseHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function addMonitor(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get user's project
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!project) return { error: "No project found." };

  // Free tier: max 5 monitors per project
  const { count } = await supabase
    .from("monitors")
    .select("id", { count: "exact", head: true })
    .eq("project_id", project.id);

  if ((count ?? 0) >= 5) {
    return { error: "Free plan is limited to 5 monitors." };
  }

  const name = (formData.get("name") as string)?.trim().slice(0, 100);
  if (!name) return { error: "Monitor name is required." };

  const url = parseHttpUrl(formData.get("url") as string);
  if (!url) return { error: "URL must be a valid http or https address." };

  const interval = 5;

  const method = (formData.get("method") as string)?.toUpperCase();
  if (!ALLOWED_METHODS.includes(method)) {
    return { error: "Invalid HTTP method." };
  }

  const expected_status_code = parseInt(formData.get("expected_status_code") as string);
  if (!Number.isInteger(expected_status_code) || expected_status_code < 100 || expected_status_code > 599) {
    return { error: "Expected status code must be between 100 and 599." };
  }

  const rawWebhook = formData.get("webhook_url") as string;
  const webhook_url = rawWebhook ? parseHttpUrl(rawWebhook) : null;
  if (rawWebhook && !webhook_url) {
    return { error: "Webhook URL must be a valid http or https address." };
  }

  const { error } = await supabase.from("monitors").insert({
    project_id: project.id,
    name,
    url,
    method,
    expected_status_code,
    check_interval_minutes: interval,
    user_id: user.id,
    is_active: true,
    webhook_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function updateProjectName(projectId: string, name: string) {
  if (!UUID_RE.test(projectId)) return { error: "Invalid project ID." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (!name.trim()) return { error: "Name cannot be empty." };

  const { error } = await supabase
    .from("projects")
    .update({ name: name.trim() })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function toggleMonitor(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const id = formData.get("id") as string;
  if (!UUID_RE.test(id)) return;

  const isActive = formData.get("is_active") === "true";

  await supabase
    .from("monitors")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}

export async function editMonitor(monitorId: string, formData: FormData) {
  if (!UUID_RE.test(monitorId)) return { error: "Invalid monitor ID." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("monitors")
    .select("id")
    .eq("id", monitorId)
    .eq("user_id", user.id)
    .single();

  if (!existing) return { error: "Monitor not found" };

  const interval = 5;

  const name = (formData.get("name") as string)?.trim().slice(0, 100);
  if (!name) return { error: "Monitor name is required." };

  const url = parseHttpUrl(formData.get("url") as string);
  if (!url) return { error: "URL must be a valid http or https address." };

  const method = (formData.get("method") as string)?.toUpperCase();
  if (!ALLOWED_METHODS.includes(method)) return { error: "Invalid HTTP method." };

  const expected_status_code = parseInt(formData.get("expected_status_code") as string);
  if (!Number.isInteger(expected_status_code) || expected_status_code < 100 || expected_status_code > 599) {
    return { error: "Expected status code must be between 100 and 599." };
  }

  const rawWebhook = formData.get("webhook_url") as string;
  const webhook_url = rawWebhook ? parseHttpUrl(rawWebhook) : null;
  if (rawWebhook && !webhook_url) {
    return { error: "Webhook URL must be a valid http or https address." };
  }

  const { error } = await supabase
    .from("monitors")
    .update({
      name,
      url,
      method,
      expected_status_code,
      check_interval_minutes: interval,
      webhook_url,
    })
    .eq("id", monitorId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/monitors/${monitorId}`);
  return {};
}

export async function deleteMonitor(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const id = formData.get("id") as string;
  if (!UUID_RE.test(id)) return;

  await supabase
    .from("monitors")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}
