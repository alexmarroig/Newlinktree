"use server";

import { revalidateTag } from "next/cache";

import {
  RequireBiohubEditAccess,
  RequireBiohubPublishAccess,
} from "@/http/middleware/biohub-access";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Block } from "@/types";

/**
 * Salva o rascunho do editor — persiste blocos no banco.
 */
export async function saveEditorDraft(
  pageId: string,
  blocks: Block[],
): Promise<ApiResponse> {
  const supabase = await createClient();
  const access = await RequireBiohubEditAccess(supabase, pageId);

  if (!access.ok) {
    return {
      success: false,
      error: access.error ?? "Não autorizado",
      code: access.code,
    };
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
  const access = await RequireBiohubPublishAccess(supabase, pageId);

  if (!access.ok) {
    return {
      success: false,
      error: access.error ?? "Não autorizado",
      code: access.code,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
