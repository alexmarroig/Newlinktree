"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

interface SaveSettingsParams {
  profileId: string;
  name: string;
  professionalTitle: string;
  crp?: string;
  bio?: string;
  subtitle?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  consentText: string;
  timezone: string;
  locale: string;
  siteUrl?: string;
  contactEmail?: string;
  whatsappDefaultMessage?: string;
  privacyPolicy?: string;
}

export async function saveSettings(
  params: SaveSettingsParams,
): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  // Atualiza profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: params.name,
      professional_title: params.professionalTitle,
      crp: params.crp || null,
      bio: params.bio || null,
      subtitle: params.subtitle || null,
      whatsapp_number: params.whatsappNumber || null,
      instagram_url: params.instagramUrl || null,
      website_url: params.websiteUrl || null,
      linkedin_url: params.linkedinUrl || null,
      youtube_url: params.youtubeUrl || null,
    })
    .eq("id", params.profileId)
    .eq("user_id", user.id);

  if (profileError) {
    return { success: false, error: "Erro ao salvar perfil" };
  }

  // Upsert settings
  const { error: settingsError } = await supabase
    .from("settings")
    .upsert(
      {
        profile_id: params.profileId,
        consent_text: params.consentText,
        timezone: params.timezone,
        locale: params.locale,
        site_url: params.siteUrl || null,
        contact_email: params.contactEmail || null,
        whatsapp_default_message: params.whatsappDefaultMessage || null,
        privacy_policy: params.privacyPolicy || null,
      },
      { onConflict: "profile_id" },
    );

  if (settingsError) {
    return { success: false, error: "Erro ao salvar configurações" };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin");

  return { success: true, data: undefined };
}
