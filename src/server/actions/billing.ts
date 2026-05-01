"use server";

import { revalidatePath } from "next/cache";

import { createMercadoPagoCheckout, isMercadoPagoConfigured } from "@/lib/billing/mercado-pago";
import { SAAS_PLANS } from "@/lib/constants";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/server/account";
import type { ApiResponse } from "@/types";

type PlanCode = keyof typeof SAAS_PLANS;
type BillingCycle = "monthly" | "annual";

export async function createBillingCheckout(
  planCode: PlanCode = "professional",
  cycle: BillingCycle = "monthly",
): Promise<ApiResponse<{ checkoutUrl: string }>> {
  const supabase = await createClient();
  const account = await getCurrentAccount(supabase);

  if (!account.user || !account.profile) {
    return { success: false, error: "Faça login para assinar." };
  }

  if (!isMercadoPagoConfigured()) {
    return {
      success: false,
      error:
        "Mercado Pago ainda não está configurado. Defina MERCADO_PAGO_ACCESS_TOKEN na Vercel.",
      code: "BILLING_NOT_CONFIGURED",
    };
  }

  try {
    const checkout = await createMercadoPagoCheckout({
      profileId: account.profile.id,
      email: account.user.email ?? "",
      name: account.profile.name,
      planCode,
      cycle,
    });

    const admin = await createAdminClient();
    await admin.from("subscriptions").upsert(
      {
        profile_id: account.profile.id,
        plan_code: planCode,
        status: "pending",
        provider: "mercado_pago",
        provider_subscription_id: checkout.providerSubscriptionId,
        checkout_url: checkout.checkoutUrl,
      },
      { onConflict: "profile_id" },
    );

    revalidatePath("/admin/billing");

    if (!checkout.checkoutUrl) {
      return {
        success: false,
        error: "Mercado Pago não retornou uma URL de checkout.",
      };
    }

    return { success: true, data: { checkoutUrl: checkout.checkoutUrl } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o checkout.",
    };
  }
}
