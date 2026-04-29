"use server";

import { revalidateTag } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { BiohubAccessService } from "@/server/services/biohub-access-service";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import type { ApiResponse, Block } from "@/types";

/**
 * Salva o rascunho do editor — persiste blocos no banco.
 */
export async function saveEditorDraft(
  pageId: string,
  blocks: Block[],
): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  // Verifica que o usuário autenticado é dono da página
  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, profiles!inner(user_id)")
    .eq("id", pageId)
    .single();

  if (!page) {
    return { success: false, error: "Página não encontrada" };
  }

  // Garante que o perfil vinculado pertence ao usuário autenticado
  const profile = page.profiles as unknown as { user_id: string };
  if (profile.user_id !== user.id) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  // Atualiza cada bloco com position e content_json
  const updates = blocks.map((block) =>
    supabase
      .from("blocks")
      .update({
        position: block.position,
        is_enabled: block.is_enabled,
        title: block.title,
        subtitle: block.subtitle,
        content_json: block.content_json as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("id", block.id)
      .eq("page_id", pageId),
  );

  await Promise.all(updates);

  return { success: true, data: undefined };
}

/**
 * Publica a página — cria snapshot e atualiza status.
 */
export async function publishPage(pageId: string): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  // Verifica que o usuário autenticado é dono da página antes do snapshot
  const { data: pageOwnerCheck } = await supabase
    .from("pages")
    .select("id, profiles!inner(user_id)")
    .eq("id", pageId)
    .single();

  if (!pageOwnerCheck) {
    return { success: false, error: "Página não encontrada" };
  }

  const ownerProfile = pageOwnerCheck.profiles as unknown as { user_id: string };
  if (ownerProfile.user_id !== user.id) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  // Carrega dados atuais para snapshot
  const [{ data: page }, { data: blocks }, { data: links }, { data: faqItems }] =
    await Promise.all([
      supabase.from("pages").select("*").eq("id", pageId).single(),
      supabase
        .from("blocks")
        .select("*")
        .eq("page_id", pageId)
        .order("position"),
      supabase
        .from("links")
        .select("*")
        .eq("page_id", pageId)
        .order("position"),
      supabase
        .from("faq_items")
        .select("*")
        .eq("page_id", pageId)
        .order("position"),
    ]);

  if (!page) return { success: false, error: "Página não encontrada" };

  // Determina próximo número de versão
  const { data: lastVersion } = await supabase
    .from("published_versions")
    .select("version_number")
    .eq("page_id", pageId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  const versionNumber = (lastVersion?.version_number ?? 0) + 1;

  // Cria snapshot
  await supabase.from("published_versions").insert({
    page_id: pageId,
    version_number: versionNumber,
    snapshot_json: { page, blocks, links, faqItems },
    published_by: user.id,
  });

  // Atualiza status da página para published
  await supabase
    .from("pages")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  // Invalida cache da página pública
  revalidateTag(`${PAGE_CACHE_TAG_PREFIX}${page.slug}`);

  return { success: true, data: undefined };
}
