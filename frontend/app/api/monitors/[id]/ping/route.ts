import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase-server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid monitor ID" }, { status: 400 });
  }

  const { data: monitor } = await supabase
    .from("monitors")
    .select("id, url, method, expected_status_code")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }

  const start = Date.now();
  let status = "up";
  let statusCode: number | null = null;
  let responseTime: number | null = null;

  try {
    const res = await fetch(monitor.url, {
      method: monitor.method || "GET",
      signal: AbortSignal.timeout(10000),
    });
    statusCode = res.status;
    responseTime = Date.now() - start;
    status = statusCode === (monitor.expected_status_code ?? 200) ? "up" : "down";
  } catch {
    status = "down";
    responseTime = Date.now() - start;
  }

  await supabase.from("pings").insert({
    monitor_id: monitor.id,
    status,
    response_time_ms: responseTime,
    status_code: statusCode,
  });

  return NextResponse.json({ status, response_time_ms: responseTime, status_code: statusCode });
}
