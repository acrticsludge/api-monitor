export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase-server";
import { getIsPro } from "../../../../lib/isPro";
import { Separator } from "@/components/ui/separator";
import MonitorSettingsForm from "./MonitorSettingsForm";

export default async function SettingsPage({
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
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!monitor) redirect("/dashboard");

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-[11px] tracking-[0.14em] uppercase text-[#00ff87] mb-1.5 font-medium"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          &gt; settings
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Monitor Settings
        </h2>
        <p
          className="text-neutral-500 text-xs mt-1"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Update configuration and manage this monitor
        </p>
      </div>

      <MonitorSettingsForm monitor={monitor} isPro={isPro} />
    </div>
  );
}
