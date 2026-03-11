import { redirect } from "next/navigation";
import { createClient } from "./lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import LandingClient from "./LandingClient";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");
  redirect("/signup");

  // Fetch unique user count using service role key (never exposed to client)
  // Requires SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local and Vercel env vars
  let uniqueUsers = 0;
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: userRows } = await supabaseAdmin
      .from("monitors")
      .select("user_id");
    uniqueUsers = new Set(userRows?.map((r) => r.user_id)).size;
  } catch {
    // Silently fall back to 0 if env var is missing or query fails
  }

  return <LandingClient uniqueUsers={uniqueUsers} />;
}
