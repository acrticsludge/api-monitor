import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase-server";
import { enforceFreeTierLimits } from "../../../dashboard/actions";

const SIGNING_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "";

const DOWNGRADE_EVENTS = new Set([
  "subscription_expired",
  "subscription_cancelled",
  "subscription_payment_failed",
  "subscription_payment_recovered", // re-check on any payment state change
]);

function verifySignature(rawBody: string, signature: string): boolean {
  if (!SIGNING_SECRET) return false;
  const expected = createHmac("sha256", SIGNING_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: { user_id?: string } };
    data?: {
      attributes?: {
        status?: string;
        user_email?: string;
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload?.meta?.event_name ?? "";
  const status = payload?.data?.attributes?.status ?? "";
  const userEmail = payload?.data?.attributes?.user_email ?? "";
  const customUserId = payload?.meta?.custom_data?.user_id ?? "";

  const supabase = await createClient();

  // Resolve userId — prefer custom_data, fall back to email lookup
  let userId = UUID_RE.test(customUserId) ? customUserId : null;
  if (!userId && userEmail) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();
    userId = profile?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 200 });
  }

  const isActive = status === "active";

  if (DOWNGRADE_EVENTS.has(eventName)) {
    await supabase
      .from("profiles")
      .update({ is_pro: isActive })
      .eq("id", userId);

    if (!isActive) {
      await enforceFreeTierLimits(userId);
    }
  }

  return NextResponse.json({ ok: true });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
