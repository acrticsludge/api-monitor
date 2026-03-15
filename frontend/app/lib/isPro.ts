import { createClient } from "./supabase-server";

// Toggle: when true, every logged-in user is treated as Pro.
const PRO_FOR_ALL = true;

export async function getIsPro(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  if (PRO_FOR_ALL) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  return profile?.is_pro ?? false;
}
