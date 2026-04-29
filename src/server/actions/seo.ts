"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { BiohubAccessService } from "@/server/services/biohub-access-service";
import { seoSchema, type SeoSchema } from "@/lib/validations";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export async function saveSeo(
  pageId: string,
  data: SeoSchema,
): Promise<ApiResponse> {
  const validation = seoSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  const { data: page, error } = await supabase
    .from("pages")
    .update({
      seo_title: validation.data.seoTitle || null,
      seo_description: validation.data.seoDescription || null,
      og_image_url: validation.data.ogImageUrl || null,
      canonical_url: validation.data.canonicalUrl || null,
      robots: validation.data.robots,
    })
    .eq("id", pageId)
    .select("slug")
    .single();

  if (error) {
    return { success: false, error: "Erro ao salvar SEO" };
  }

  revalidateTag(`${PAGE_CACHE_TAG_PREFIX}${page.slug}`);
  revalidatePath("/admin/seo");

  return { success: true, data: undefined };
}
