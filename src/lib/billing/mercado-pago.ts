import { APP_URL, SAAS_PLANS } from "@/lib/constants";

type PlanCode = keyof typeof SAAS_PLANS;
type BillingCycle = "monthly" | "annual";

interface CreateCheckoutParams {
  profileId: string;
  email: string;
  name: string;
  planCode: PlanCode;
  cycle: BillingCycle;
}

interface MercadoPagoPreapprovalResponse {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  status?: string;
  reason?: string;
  payer_id?: number;
}

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);
}

export async function createMercadoPagoCheckout({
  profileId,
  email,
  name,
  planCode,
  cycle,
}: CreateCheckoutParams) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
  }

  const plan = SAAS_PLANS[planCode];
  const amount =
    cycle === "annual"
      ? plan.annualPriceCents / 100
      : plan.monthlyPriceCents / 100;

  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: `BioHub ${plan.name} ${cycle === "annual" ? "Anual" : "Mensal"}`,
      external_reference: profileId,
      payer_email: email,
      back_url: `${APP_URL}/admin/billing?checkout=return`,
      status: "pending",
      auto_recurring: {
        frequency: cycle === "annual" ? 12 : 1,
        frequency_type: "months",
        transaction_amount: amount,
        currency_id: "BRL",
      },
      metadata: {
        profile_id: profileId,
        plan_code: planCode,
        billing_cycle: cycle,
        billing_source: "biohub",
        product_code: "biohub",
        customer_name: name,
      },
    }),
  });

  const payload = (await response.json()) as MercadoPagoPreapprovalResponse;

  if (!response.ok || !payload.id) {
    throw new Error(payload.reason ?? "Erro ao criar checkout no Mercado Pago.");
  }

  return {
    providerSubscriptionId: payload.id,
    checkoutUrl: payload.init_point ?? payload.sandbox_init_point ?? null,
    status: payload.status ?? "pending",
  };
}

export async function fetchMercadoPagoPreapproval(preapprovalId: string) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
  }

  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao consultar assinatura no Mercado Pago.");
  }

  return (await response.json()) as {
    id: string;
    status: string;
    external_reference?: string;
    payer_id?: number;
    next_payment_date?: string;
    date_created?: string;
    summarized?: {
      charged_quantity?: number;
    };
    metadata?: {
      profile_id?: string;
      plan_code?: PlanCode;
    };
  };
}

export function mapMercadoPagoStatus(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "authorized") return "active";
  if (normalized === "pending") return "pending";
  if (normalized === "paused") return "paused";
  if (normalized === "cancelled" || normalized === "canceled") return "canceled";
  if (normalized === "finished") return "expired";

  return "past_due";
}
