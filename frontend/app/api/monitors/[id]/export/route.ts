import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  if (!profile?.is_pro) return new NextResponse("Pro required", { status: 403 });

  const { data: monitor } = await supabase
    .from("monitors")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) return new NextResponse("Not found", { status: 404 });

  const { data: pings } = await supabase
    .from("pings")
    .select("checked_at, status, response_time_ms, status_code, dns_lookup_ms, tcp_connect_ms, tls_handshake_ms, ttfb_ms, ssl_days_remaining, schema_changed, validation_passed, error_detail")
    .eq("monitor_id", id)
    .order("checked_at", { ascending: false })
    .limit(10000);

  const headers = [
    "checked_at",
    "status",
    "response_time_ms",
    "status_code",
    "dns_lookup_ms",
    "tcp_connect_ms",
    "tls_handshake_ms",
    "ttfb_ms",
    "ssl_days_remaining",
    "schema_changed",
    "validation_passed",
    "error_detail",
  ];

  const rows =
    pings?.map((p) =>
      headers
        .map((h) => {
          const v = (p as Record<string, unknown>)[h];
          return v === null || v === undefined ? "" : String(v);
        })
        .join(","),
    ) ?? [];

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="pings.csv"`,
    },
  });
}
