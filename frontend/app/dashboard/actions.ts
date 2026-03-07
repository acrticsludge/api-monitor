"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase-server";

export async function addMonitor(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Free tier: max 5 monitors
  const { count } = await supabase
    .from("monitors")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= 5) {
    return { error: "Free plan is limited to 5 monitors." };
  }

  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  // Free tier: minimum 5-minute interval
  const interval = Math.max(5, parseInt(formData.get("interval") as string) || 5);

  const method = (formData.get("method") as string) || "GET";
  const expected_status_code = parseInt(formData.get("expected_status_code") as string) || 200;

  const { error } = await supabase.from("monitors").insert({
    name,
    url,
    method,
    expected_status_code,
    check_interval_minutes: interval,
    user_id: user.id,
    is_active: true,
  });

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
  const isActive = formData.get("is_active") === "true";

  await supabase
    .from("monitors")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}

export async function deleteMonitor(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("monitors")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}
