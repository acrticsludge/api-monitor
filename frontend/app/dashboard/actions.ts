"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase-server";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// ── Encryption helpers (AES-256-GCM) ─────────────────────────────────────────

const ENC_KEY_HEX = process.env.MONITOR_ENCRYPTION_KEY ?? "";

function getKey(): Buffer {
  if (!ENC_KEY_HEX || ENC_KEY_HEX.length !== 64) {
    throw new Error("MONITOR_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).");
  }
  return Buffer.from(ENC_KEY_HEX, "hex");
}

/** Encrypts a string. Returns "iv:authTag:ciphertext" (all hex). */
function encrypt(plain: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${ct.toString("hex")}`;
}

/** Decrypts a string produced by encrypt(). Returns null if input is null/empty. */
function decrypt(encoded: string | null): string | null {
  if (!encoded) return null;
  try {
    const [ivHex, tagHex, ctHex] = encoded.split(":");
    const key = getKey();
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return decipher.update(Buffer.from(ctHex, "hex")).toString("utf8") + decipher.final("utf8");
  } catch {
    return null;
  }
}

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

  // Get Pro status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  const isPro = profile?.is_pro ?? false;

  // Get user's active project
  const rawProjectId = formData.get("project_id") as string | null;
  let project;

  if (rawProjectId && UUID_RE.test(rawProjectId)) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("id", rawProjectId)
      .eq("user_id", user.id)
      .single();
    project = data;
  } else {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .single();
    project = data;
  }

  if (!project) return { error: "No project found." };

  // Monitor limit: Pro = unlimited, Free = 5 per project
  if (!isPro) {
    const { count } = await supabase
      .from("monitors")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id);

    if ((count ?? 0) >= 5) {
      return { error: "Free plan is limited to 5 monitors per project." };
    }
  }

  const name = (formData.get("name") as string)?.trim().slice(0, 100);
  if (!name) return { error: "Monitor name is required." };

  const url = parseHttpUrl(formData.get("url") as string);
  if (!url) return { error: "URL must be a valid http or https address." };

  // Interval: Pro can use 1–30 min, free fixed at 5 min
  let interval = 5;
  if (isPro) {
    const rawInterval = parseInt(formData.get("check_interval_minutes") as string);
    if (Number.isInteger(rawInterval) && rawInterval >= 1 && rawInterval <= 30) {
      interval = rawInterval;
    }
  }

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

  // Pro-only fields
  let custom_headers: Record<string, string> | null = null;
  if (isPro) {
    const rawHeaders = (formData.get("custom_headers") as string)?.trim();
    if (rawHeaders) {
      try {
        custom_headers = JSON.parse(rawHeaders);
        if (typeof custom_headers !== "object" || Array.isArray(custom_headers)) {
          return { error: "Custom headers must be a JSON object." };
        }
      } catch {
        return { error: "Custom headers must be valid JSON." };
      }
    }
  }

  const auth_type = isPro ? ((formData.get("auth_type") as string) || "none") : "none";
  const raw_auth_value = isPro ? ((formData.get("auth_value") as string) || null) : null;
  const auth_value = raw_auth_value ? encrypt(raw_auth_value) : null;

  const raw_custom_body = isPro ? ((formData.get("custom_body") as string)?.trim() || null) : null;
  const custom_body = raw_custom_body ? encrypt(raw_custom_body) : null;

  let response_validation: { path: string; operator: string; expected: string } | null = null;
  if (isPro) {
    const validationPath = (formData.get("validation_path") as string)?.trim();
    if (validationPath) {
      response_validation = {
        path: validationPath,
        operator: (formData.get("validation_operator") as string) || "equals",
        expected: (formData.get("validation_expected") as string) || "",
      };
    }
  }

  const check_ssl = isPro ? formData.get("check_ssl") === "on" : false;

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
    custom_headers,
    auth_type,
    auth_value,
    response_validation,
    check_ssl,
    custom_body,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function createProject(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  if (!profile?.is_pro) throw new Error("Pro required");

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= 5) throw new Error("Project limit reached (5 max)");

  const trimmedName = name.trim().slice(0, 80) || "New Project";

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    name: trimmedName,
    slug: crypto.randomUUID(),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
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

  // Get Pro status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  const isPro = profile?.is_pro ?? false;

  let interval = 5;
  if (isPro) {
    const rawInterval = parseInt(formData.get("check_interval_minutes") as string);
    if (Number.isInteger(rawInterval) && rawInterval >= 1 && rawInterval <= 30) {
      interval = rawInterval;
    }
  }

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

  // Pro-only fields
  let custom_headers: Record<string, string> | null = null;
  if (isPro) {
    const rawHeaders = (formData.get("custom_headers") as string)?.trim();
    if (rawHeaders) {
      try {
        custom_headers = JSON.parse(rawHeaders);
        if (typeof custom_headers !== "object" || Array.isArray(custom_headers)) {
          return { error: "Custom headers must be a JSON object." };
        }
      } catch {
        return { error: "Custom headers must be valid JSON." };
      }
    }
  }

  const auth_type = isPro ? ((formData.get("auth_type") as string) || "none") : "none";
  const rawAuthValue = isPro ? (formData.get("auth_value") as string) : null;
  // Only update auth_value if a new value was provided (empty = keep existing)
  const updateAuthValue = rawAuthValue !== null && rawAuthValue !== "";

  const raw_custom_body = isPro ? ((formData.get("custom_body") as string)?.trim() || null) : null;
  // Only update custom_body if a new value was provided (empty = keep existing)
  const updateCustomBody = raw_custom_body !== null && raw_custom_body !== "";

  let response_validation: { path: string; operator: string; expected: string } | null = null;
  if (isPro) {
    const validationPath = (formData.get("validation_path") as string)?.trim();
    if (validationPath) {
      response_validation = {
        path: validationPath,
        operator: (formData.get("validation_operator") as string) || "equals",
        expected: (formData.get("validation_expected") as string) || "",
      };
    }
  }

  const check_ssl = isPro ? formData.get("check_ssl") === "on" : false;
  const notify_on_schema_change = formData.get("notify_on_schema_change") === "on";

  const updatePayload: Record<string, unknown> = {
    name,
    url,
    method,
    expected_status_code,
    check_interval_minutes: interval,
    webhook_url,
    notify_on_schema_change,
    ...(isPro && {
      custom_headers,
      auth_type,
      response_validation,
      check_ssl,
      ...(updateAuthValue && { auth_value: encrypt(rawAuthValue!) }),
      ...(updateCustomBody && { custom_body: encrypt(raw_custom_body!) }),
    }),
  };

  const { error } = await supabase
    .from("monitors")
    .update(updatePayload)
    .eq("id", monitorId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/monitors/${monitorId}`);
  return {};
}

export async function getDecryptedBody(monitorId: string): Promise<string | null> {
  if (!UUID_RE.test(monitorId)) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("monitors")
    .select("custom_body")
    .eq("id", monitorId)
    .eq("user_id", user.id)
    .single();

  return decrypt(data?.custom_body ?? null);
}

/**
 * Called when a user's Pro subscription ends.
 * Resets all monitors to free-tier constraints:
 *   - check_interval_minutes → 5
 *   - clears Pro-only fields (custom_headers, auth_type/value, response_validation, check_ssl, custom_body)
 *   - pauses monitors beyond the 5-per-project limit
 */
export async function enforceFreeTierLimits(userId: string) {
  if (!UUID_RE.test(userId)) return;

  const supabase = await createClient();

  // Fetch all projects for this user
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId);

  for (const project of projects ?? []) {
    const { data: monitors } = await supabase
      .from("monitors")
      .select("id, is_active")
      .eq("project_id", project.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    const monitorList = monitors ?? [];

    for (let i = 0; i < monitorList.length; i++) {
      const monitor = monitorList[i];
      const overLimit = i >= 5;

      await supabase
        .from("monitors")
        .update({
          check_interval_minutes: 5,
          custom_headers: null,
          auth_type: "none",
          auth_value: null,
          response_validation: null,
          check_ssl: false,
          custom_body: null,
          ...(overLimit && { is_active: false }),
        })
        .eq("id", monitor.id)
        .eq("user_id", userId);
    }
  }

  revalidatePath("/dashboard");
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
