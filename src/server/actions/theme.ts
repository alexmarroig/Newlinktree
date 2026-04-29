"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { BiohubAccessService } from "@/server/services/biohub-access-service";
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

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

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
        wallpaper_effect: validation.data.wallpaperEffect,
        wallpaper_tint: validation.data.wallpaperTint,
        wallpaper_noise: validation.data.wallpaperNoise,
        page_font: validation.data.pageFont,
        page_text_color: validation.data.pageFontColor || null,
        title_font_color: validation.data.titleFontColor || null,
        title_size: validation.data.titleSize,
        avatar_layout: validation.data.avatarLayout,
        button_style: validation.data.buttonStyle,
        button_color: validation.data.buttonColor || null,
        button_text_color: validation.data.buttonTextColor || null,
        button_shadow: validation.data.buttonShadow,
        button_roundness: validation.data.buttonRoundness,
        button_animation: validation.data.buttonAnimation,
        profile_badge_text: validation.data.profileBadgeText || null,
      },
      { onConflict: "profile_id" },
    );

  if (error) {
    return { success: false, error: "Erro ao salvar tema" };
  }

  revalidatePath("/admin/theme");
  revalidatePath("/[slug]", "page");

  return { success: true, data: undefined };
}
