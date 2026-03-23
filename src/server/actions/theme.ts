"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { themeSchema, type ThemeSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function saveTheme(
  profileId: string,
  data: ThemeSchema,
): Promise<ApiResponse> {
  const validation = themeSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Dados de tema inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  const { error } = await supabase
    .from("themes")
    .upsert(
      {
        profile_id: profileId,
        primary_color: validation.data.primaryColor,
        secondary_color: validation.data.secondaryColor,
        background_color: validation.data.backgroundColor,
        text_color: validation.data.textColor,
        accent_color: validation.data.accentColor,
        font_heading: validation.data.fontHeading,
        font_body: validation.data.fontBody,
        border_radius: validation.data.borderRadius,
        shadow_intensity: validation.data.shadowIntensity,
        layout_width: validation.data.layoutWidth,
        card_style: validation.data.cardStyle,
        background_image_url: validation.data.backgroundImageUrl || null,
        background_type: validation.data.backgroundType,
      },
      { onConflict: "profile_id" },
    );

  if (error) {
    return { success: false, error: "Erro ao salvar tema" };
  }

  revalidatePath("/admin/theme");
  // O tema também invalida a página pública via revalidação automática do next/cache
  // quando a função getPublicPageData for chamada novamente

  return { success: true, data: undefined };
}
