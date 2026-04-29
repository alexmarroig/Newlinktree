"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { BiohubAccessService } from "@/server/services/biohub-access-service";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import { faqItemSchema } from "@/lib/validations";
import type { ApiResponse, FaqItem } from "@/types";

async function getPageAndVerifyOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pageId: string,
  userId: string,
): Promise<boolean> {
  const { data: page } = await supabase
    .from("pages")
    .select("id, profiles!inner(user_id)")
    .eq("id", pageId)
    .single();

  if (!page) return false;
  const profile = page.profiles as unknown as { user_id: string };
  return profile.user_id === userId;
}

export async function createFaqItem(
  pageId: string,
  input: unknown,
): Promise<ApiResponse<FaqItem>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  const isOwner = await getPageAndVerifyOwner(supabase, pageId, user.id);
  if (!isOwner) return { success: false, error: "Não autorizado" };

  const parsed = faqItemSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { success: false, error: firstError?.message ?? "Dados inválidos" };
  }

  const { count } = await supabase
    .from("faq_items")
    .select("id", { count: "exact", head: true })
    .eq("page_id", pageId);

  const position = count ?? 0;

  const { data: item, error } = await supabase
    .from("faq_items")
    .insert({
      page_id: pageId,
      question: parsed.data.question,
      answer: parsed.data.answer,
      is_enabled: parsed.data.isEnabled,
      position,
    })
    .select()
    .single();

  if (error || !item) {
    return { success: false, error: "Erro ao criar pergunta" };
  }

  await revalidateFaqCache(supabase, pageId);

  return { success: true, data: item as FaqItem };
}

export async function updateFaqItem(
  itemId: string,
  pageId: string,
  input: unknown,
): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  const isOwner = await getPageAndVerifyOwner(supabase, pageId, user.id);
  if (!isOwner) return { success: false, error: "Não autorizado" };

  const parsed = faqItemSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { success: false, error: firstError?.message ?? "Dados inválidos" };
  }

  const { error } = await supabase
    .from("faq_items")
    .update({
      question: parsed.data.question,
      answer: parsed.data.answer,
      is_enabled: parsed.data.isEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("page_id", pageId);

  if (error) return { success: false, error: "Erro ao atualizar pergunta" };

  await revalidateFaqCache(supabase, pageId);

  return { success: true, data: undefined };
}

export async function deleteFaqItem(
  itemId: string,
  pageId: string,
): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  const isOwner = await getPageAndVerifyOwner(supabase, pageId, user.id);
  if (!isOwner) return { success: false, error: "Não autorizado" };

  const { error } = await supabase
    .from("faq_items")
    .delete()
    .eq("id", itemId)
    .eq("page_id", pageId);

  if (error) return { success: false, error: "Erro ao deletar pergunta" };

  await revalidateFaqCache(supabase, pageId);

  return { success: true, data: undefined };
}

export async function toggleFaqItem(
  itemId: string,
  pageId: string,
): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  const isOwner = await getPageAndVerifyOwner(supabase, pageId, user.id);
  if (!isOwner) return { success: false, error: "Não autorizado" };

  const { data: item } = await supabase
    .from("faq_items")
    .select("is_enabled")
    .eq("id", itemId)
    .single();

  if (!item) return { success: false, error: "Pergunta não encontrada" };

  const { error } = await supabase
    .from("faq_items")
    .update({ is_enabled: !item.is_enabled })
    .eq("id", itemId);

  if (error) return { success: false, error: "Erro ao atualizar pergunta" };

  await revalidateFaqCache(supabase, pageId);

  return { success: true, data: undefined };
}

export async function reorderFaqItems(
  pageId: string,
  orderedIds: string[],
): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Não autorizado" };

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  const isOwner = await getPageAndVerifyOwner(supabase, pageId, user.id);
  if (!isOwner) return { success: false, error: "Não autorizado" };

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("faq_items")
      .update({ position: index })
      .eq("id", id)
      .eq("page_id", pageId),
  );

  await Promise.all(updates);

  await revalidateFaqCache(supabase, pageId);

  return { success: true, data: undefined };
}

async function revalidateFaqCache(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pageId: string,
) {
  const { data: page } = await supabase
    .from("pages")
    .select("slug")
    .eq("id", pageId)
    .single();

  if (page) revalidateTag(`${PAGE_CACHE_TAG_PREFIX}${page.slug}`);
  revalidatePath("/admin/faq");
}
