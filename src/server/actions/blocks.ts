"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { BiohubAccessService } from "@/server/services/biohub-access-service";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export async function toggleBlockEnabled(blockId: string): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  const { data: block } = await supabase
    .from("blocks")
    .select("is_enabled, page_id")
    .eq("id", blockId)
    .single();

  if (!block) return { success: false, error: "Bloco não encontrado" };

  const { error } = await supabase
    .from("blocks")
    .update({ is_enabled: !block.is_enabled })
    .eq("id", blockId);

  if (error) return { success: false, error: "Erro ao atualizar bloco" };

  const { data: page } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", block.page_id)
    .single();

  if (page) revalidateTag(`${PAGE_CACHE_TAG_PREFIX}${page.slug}`);
  revalidatePath("/admin/blocks");

  return { success: true, data: undefined };
}
