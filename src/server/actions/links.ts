"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import { linkSchema } from "@/lib/validations";
import type { ApiResponse, Link } from "@/types";

export async function createLink(
  pageId: string,
  input: unknown,
): Promise<ApiResponse<Link>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  // Verifica propriedade da página
  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, profiles!inner(user_id)")
    .eq("id", pageId)
    .single();

  if (!page) return { success: false, error: "Página não encontrada" };

  const profile = page.profiles as unknown as { user_id: string };
  if (profile.user_id !== user.id) {
    return { success: false, error: "Não autorizado" };
  }

  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { success: false, error: firstError?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;

  // Determina posição — adiciona ao final
  const { count } = await supabase
    .from("links")
    .select("id", { count: "exact", head: true })
    .eq("page_id", pageId);

  const position = count ?? 0;

  const { data: newLink, error } = await supabase
    .from("links")
    .insert({
      page_id: pageId,
      label: data.label,
      sublabel: data.sublabel ?? null,
      type: data.type,
      icon: data.icon ?? null,
      url: data.url ?? null,
      whatsapp_message: data.whatsappMessage ?? null,
      open_in_new_tab: data.openInNewTab,
      variant: data.variant,
      is_enabled: data.isEnabled,
      tracking_enabled: data.trackingEnabled,
      thumbnail_url: data.thumbnailUrl || null,
      position,
      click_count: 0,
    })
    .select()
    .single();

  if (error || !newLink) {
    return { success: false, error: "Erro ao criar link" };
  }

  const { data: pageData } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", pageId)
    .single();

  if (pageData) revalidateTag(`${PAGE_CACHE_TAG_PREFIX}${pageData.slug}`);
  revalidatePath("/admin/links");

  return { success: true, data: newLink as Link };
}

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

export async function updateLink(
  linkId: string,
  input: unknown,
): Promise<ApiResponse<Link>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { success: false, error: firstError?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;

  const { data: updatedLink, error } = await supabase
    .from("links")
    .update({
      label: data.label,
      sublabel: data.sublabel ?? null,
      type: data.type,
      icon: data.icon ?? null,
      url: data.url ?? null,
      whatsapp_message: data.whatsappMessage ?? null,
      open_in_new_tab: data.openInNewTab,
      variant: data.variant,
      is_enabled: data.isEnabled,
      tracking_enabled: data.trackingEnabled,
      thumbnail_url: data.thumbnailUrl || null,
    })
    .eq("id", linkId)
    .select()
    .single();

  if (error || !updatedLink) {
    return { success: false, error: "Erro ao atualizar link" };
  }

  revalidatePath("/admin/links");
  return { success: true, data: updatedLink as Link };
}

export async function setLinkThumbnail(
  linkId: string,
  thumbnailUrl: string | null,
): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  const { error } = await supabase
    .from("links")
    .update({ thumbnail_url: thumbnailUrl })
    .eq("id", linkId);

  if (error) return { success: false, error: "Erro ao atualizar thumbnail" };

  revalidatePath("/admin/links");
  return { success: true, data: undefined };
}

export async function incrementLinkClick(linkId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("increment_link_click", { link_id: linkId });
}
