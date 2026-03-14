export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase-server";
import ResponseTimeGraph from "../ResponseTimeGraph";
import { getIsPro } from "../../../../lib/isPro";

export default async function GraphsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isPro = await getIsPro();

  const { data: monitor } = await supabase
    .from("monitors")
    .select("id, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: graphPings } = await supabase
    .from("pings")
    .select("status, response_time_ms, checked_at")
    .eq("monitor_id", id)
    .gte("checked_at", sevenDaysAgo.toISOString())
    .order("checked_at", { ascending: false })
    .limit(2000);

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-[11px] tracking-[0.14em] uppercase text-[#00d294] mb-1.5 font-medium"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          &gt; response time
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Performance
        </h2>
        <p
          className="text-neutral-500 text-xs mt-1"
          style={{ fontFamily: "'Geist Mono', monospace" }}
        >
          Historical response time trends for this monitor
        </p>
      </div>
      <ResponseTimeGraph
        pings={graphPings ?? []}
        monitorName={monitor.name}
        monitorId={id}
        isPro={isPro}
      />
    </div>
  );
}
