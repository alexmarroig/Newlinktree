import { NextRequest, NextResponse } from "next/server";

import {
  fetchMercadoPagoPreapproval,
  mapMercadoPagoStatus,
} from "@/lib/billing/mercado-pago";
import { createAdminClient } from "@/lib/supabase/server";

type WebhookPayload = {
  id?: string | number;
  type?: string;
  action?: string;
  data?: {
    id?: string;
  };
};

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as WebhookPayload;
  const eventId =
    String(payload.id ?? request.nextUrl.searchParams.get("id") ?? crypto.randomUUID());
  const eventType =
    payload.type ?? payload.action ?? request.nextUrl.searchParams.get("type") ?? "unknown";

  const admin = await createAdminClient();

  const { error: eventError } = await admin.from("billing_events").insert({
    provider: "mercado_pago",
    provider_event_id: eventId,
    event_type: eventType,
    payload_json: payload,
  });

  if (eventError?.code === "23505") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const preapprovalId =
    payload.data?.id ?? request.nextUrl.searchParams.get("data.id");

  if (!preapprovalId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const preapproval = await fetchMercadoPagoPreapproval(preapprovalId);
    const profileId =
      preapproval.external_reference ?? preapproval.metadata?.profile_id;

    if (!profileId) {
      return NextResponse.json({ ok: true, ignored: "missing_profile" });
    }

    await admin.from("subscriptions").upsert(
      {
        profile_id: profileId,
        plan_code: preapproval.metadata?.plan_code ?? "professional",
        status: mapMercadoPagoStatus(preapproval.status),
        provider: "mercado_pago",
        provider_subscription_id: preapproval.id,
        provider_customer_id: preapproval.payer_id
          ? String(preapproval.payer_id)
          : null,
        current_period_ends_at: preapproval.next_payment_date ?? null,
      },
      { onConflict: "profile_id" },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Não foi possível processar o webhook." },
      { status: 500 },
    );
  }
}
