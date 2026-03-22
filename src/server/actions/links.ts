"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export async function toggleLink(linkId: string): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  const { data: link } = await supabase
    .from("links")
    .select("is_enabled, page_id")
    .eq("id", linkId)
    .single();

  if (!link) return { success: false, error: "Link não encontrado" };

  const { error } = await supabase
    .from("links")
    .update({ is_enabled: !link.is_enabled })
    .eq("id", linkId);

  if (error) return { success: false, error: "Erro ao atualizar link" };

  // Invalida cache da página pública
  const { data: page } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", link.page_id)
    .single();

  if (page) revalidateTag(`${PAGE_CACHE_TAG_PREFIX}${page.slug}`);
  revalidatePath("/admin/links");

  return { success: true, data: undefined };
}

export async function deleteLink(linkId: string): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  const { error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId);

  if (error) return { success: false, error: "Erro ao deletar link" };

  revalidatePath("/admin/links");
  return { success: true, data: undefined };
}

export async function incrementLinkClick(linkId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("increment_link_click", { link_id: linkId });
}
