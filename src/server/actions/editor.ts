"use server";

import { revalidateTag } from "next/cache";

import {
  logAccessDecision,
  logDegradedFallback,
  logEthosQueryFinished,
  logEthosQueryStarted,
} from "@/lib/helpers/access-logger";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Block } from "@/types";
import { RequireBiohubEditAccess, RequireBiohubPublishAccess } from "@/http/middleware/biohub-access";
import { RequireBiohubEditAccess, RequireBiohubPublishAccess } from "@/http/middleware/biohub-access";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Block } from "@/types";

/**
 * Salva o rascunho do editor — persiste blocos no banco.
 */
export async function saveEditorDraft(pageId: string, blocks: Block[]): Promise<ApiResponse> {
  const correlationId = crypto.randomUUID();
  const supabase = await createClient();

  const access = await RequireBiohubEditAccess(supabase, pageId);
  if (!access.ok) {
    return { success: false, error: access.error ?? "Não autorizado", code: access.code };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logAccessDecision({
      correlation_id: correlationId,
      user_id: null,
      action: "edit",
      status: "denied",
      source: "local_policy",
      reason_code: "AUTH_REQUIRED",
    });
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  const accessCheckStart = Date.now();
  logEthosQueryStarted({ correlation_id: correlationId, user_id: user.id, reason_code: "OWNER_CHECK_REQUESTED" });

  const { data: page, error: accessQueryError } = await supabase
    .from("pages")
    .select("id, slug, profiles!inner(user_id)")
    .eq("id", pageId)
    .single();

  const accessLatencyMs = Date.now() - accessCheckStart;
  if (accessQueryError) {
    logDegradedFallback({
      correlation_id: correlationId,
      user_id: user.id,
      source: "local_policy",
      reason_code: "ETHOS_UNAVAILABLE",
      latency_ms: accessLatencyMs,
    });
  } else {
    logEthosQueryFinished({
      correlation_id: correlationId,
      user_id: user.id,
      reason_code: "OWNER_CHECK_COMPLETED",
      latency_ms: accessLatencyMs,
    });
  }

  if (!page) {
    logAccessDecision({
      correlation_id: correlationId,
      user_id: user.id,
      action: "edit",
      status: "denied",
      source: "local_policy",
      reason_code: "PAGE_NOT_FOUND",
      latency_ms: accessLatencyMs,
    });
    return { success: false, error: "Página não encontrada" };
  }

  const profile = page.profiles as unknown as { user_id: string };
  if (profile.user_id !== user.id) {
    logAccessDecision({
      correlation_id: correlationId,
      user_id: user.id,
      action: "edit",
      status: "denied",
      source: "local_policy",
      reason_code: "OWNER_MISMATCH",
      latency_ms: accessLatencyMs,
    });
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  logAccessDecision({
    correlation_id: correlationId,
    user_id: user.id,
    action: "edit",
    status: "allowed",
    source: "local_policy",
    reason_code: "OWNER_MATCH",
    latency_ms: accessLatencyMs,
  });

    return {
      success: false,
      error: access.error ?? "Não autorizado",
      code: access.code,
    };
  }

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
  const correlationId = crypto.randomUUID();
  const supabase = await createClient();

  const access = await RequireBiohubPublishAccess(supabase, pageId);
  if (!access.ok) {
    return { success: false, error: access.error ?? "Não autorizado", code: access.code };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logAccessDecision({
      correlation_id: correlationId,
      user_id: null,
      action: "publish",
      status: "denied",
      source: "local_policy",
      reason_code: "AUTH_REQUIRED",
    });
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  const accessCheckStart = Date.now();
  logEthosQueryStarted({ correlation_id: correlationId, user_id: user.id, reason_code: "OWNER_CHECK_REQUESTED" });

  const { data: pageOwnerCheck, error: ownerCheckError } = await supabase
    .from("pages")
    .select("id, profiles!inner(user_id)")
    .eq("id", pageId)
    .single();

  const accessLatencyMs = Date.now() - accessCheckStart;
  if (ownerCheckError) {
    logDegradedFallback({
      correlation_id: correlationId,
      user_id: user.id,
      source: "local_policy",
      reason_code: "ETHOS_UNAVAILABLE",
      latency_ms: accessLatencyMs,
    });
  } else {
    logEthosQueryFinished({
      correlation_id: correlationId,
      user_id: user.id,
      reason_code: "OWNER_CHECK_COMPLETED",
      latency_ms: accessLatencyMs,
    });
  }

  if (!pageOwnerCheck) {
    logAccessDecision({
      correlation_id: correlationId,
      user_id: user.id,
      action: "publish",
      status: "denied",
      source: "local_policy",
      reason_code: "PAGE_NOT_FOUND",
      latency_ms: accessLatencyMs,
    });
    return { success: false, error: "Página não encontrada" };
  }

  const ownerProfile = pageOwnerCheck.profiles as unknown as { user_id: string };
  if (ownerProfile.user_id !== user.id) {
    logAccessDecision({
      correlation_id: correlationId,
      user_id: user.id,
      action: "publish",
      status: "denied",
      source: "local_policy",
      reason_code: "OWNER_MISMATCH",
      latency_ms: accessLatencyMs,
    });
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  logAccessDecision({
    correlation_id: correlationId,
    user_id: user.id,
    action: "publish",
    status: "allowed",
    source: "local_policy",
    reason_code: "OWNER_MATCH",
    latency_ms: accessLatencyMs,
  });

    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  const [{ data: page }, { data: blocks }, { data: links }, { data: faqItems }] = await Promise.all([
    supabase.from("pages").select("*").eq("id", pageId).single(),
    supabase.from("blocks").select("*").eq("page_id", pageId).order("position"),
    supabase.from("links").select("*").eq("page_id", pageId).order("position"),
    supabase.from("faq_items").select("*").eq("page_id", pageId).order("position"),
  ]);

  if (!page) return { success: false, error: "Página não encontrada" };

  const { data: lastVersion } = await supabase
    .from("published_versions")
    .select("version_number")
    .eq("page_id", pageId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  const versionNumber = (lastVersion?.version_number ?? 0) + 1;

  await supabase.from("published_versions").insert({
    page_id: pageId,
    version_number: versionNumber,
    snapshot_json: { page, blocks, links, faqItems },
    published_by: user.id,
  });

  await supabase
    .from("pages")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", pageId);

  revalidateTag(`${PAGE_CACHE_TAG_PREFIX}${page.slug}`);
  return { success: true, data: undefined };
}
