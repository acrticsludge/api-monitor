import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // Verify monitor belongs to user
  const { data: monitor } = await supabase
    .from("monitors")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) return new NextResponse("Not found", { status: 404 });

  // Pro check for extended ranges
  if (days > 7) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single();

    if (!profile?.is_pro) {
      return new NextResponse("Pro required for extended history", { status: 403 });
    }
  }

  const clampedDays = Math.min(Math.max(days, 1), 90);
  const since = new Date();
  since.setDate(since.getDate() - clampedDays);

  const { data: pings } = await supabase
    .from("pings")
    .select("status, response_time_ms, checked_at")
    .eq("monitor_id", id)
    .gte("checked_at", since.toISOString())
    .order("checked_at", { ascending: false })
    .limit(5000);

  return NextResponse.json(pings ?? []);
}
