"use server";

import { hashString } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";
import { interestFormSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

interface SubmitFormParams {
  name: string;
  whatsapp: string;
  email?: string;
  contactPreference: "whatsapp" | "email" | "either";
  preferredModality: "online" | "presencial" | "either";
  message?: string;
  bestTime: "manha" | "tarde" | "noite" | "qualquer";
  consent: boolean;
  honeypot?: string;
  pageId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Server Action para salvar formulário de interesse.
 * Valida dados, anti-spam, e salva no banco.
 */
export async function submitInterestForm(
  params: SubmitFormParams,
): Promise<ApiResponse<{ id: string }>> {
  // Honeypot check (server-side)
  if (params.honeypot) {
    return { success: false, error: "Bot detected", code: "SPAM" };
  }

  // Validação Zod
  const validation = interestFormSchema.safeParse({
    name: params.name,
    whatsapp: params.whatsapp,
    email: params.email,
    contactPreference: params.contactPreference,
    preferredModality: params.preferredModality,
    message: params.message,
    bestTime: params.bestTime,
    consent: params.consent,
    honeypot: params.honeypot ?? "",
  });

  if (!validation.success) {
    return {
      success: false,
      error: "Dados inválidos. Verifique os campos e tente novamente.",
      code: "VALIDATION_ERROR",
    };
  }

  // Verifica consentimento
  if (!params.consent) {
    return {
      success: false,
      error: "Consentimento obrigatório.",
      code: "NO_CONSENT",
    };
  }

  const supabase = await createClient();

  // Hash do IP para LGPD (sem armazenar IP real)
  // Em Server Actions o IP real não é diretamente acessível — deixamos vazio
  // Em produção, use headers().get('x-forwarded-for') via Route Handler
  const ipHash = undefined;

  const { data, error } = await supabase
    .from("form_submissions")
    .insert({
      page_id: params.pageId,
      name: validation.data.name,
      whatsapp: validation.data.whatsapp,
      email: validation.data.email ?? null,
      contact_preference: validation.data.contactPreference,
      preferred_modality: validation.data.preferredModality,
      message: validation.data.message ?? null,
      best_time: validation.data.bestTime,
      consent: true,
      referrer: params.referrer ?? null,
      utm_source: params.utmSource ?? null,
      utm_medium: params.utmMedium ?? null,
      utm_campaign: params.utmCampaign ?? null,
      ip_hash: ipHash ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[submitInterestForm] DB error:", error.code);
    return {
      success: false,
      error: "Não foi possível salvar sua mensagem. Tente novamente.",
      code: "DB_ERROR",
    };
  }

  return { success: true, data: { id: data.id } };
}
