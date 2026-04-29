import type { createClient } from "@/lib/supabase/server";

type ActionCode = "UNAUTHORIZED" | "FORBIDDEN";

interface AccessResult {
  ok: boolean;
  code?: ActionCode;
  error?: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function requireBiohubAccess(
  supabase: SupabaseServerClient,
  pageId: string,
  permission: "can_edit" | "can_publish",
): Promise<AccessResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "UNAUTHORIZED", error: "Não autorizado" };
  }

  const { data: page } = await supabase
    .from("pages")
    .select(`id, profiles!inner(user_id, ${permission})`)
    .eq("id", pageId)
    .single();

  if (!page) {
    return { ok: false, error: "Página não encontrada" };
  }

  const profile = page.profiles as unknown as {
    user_id: string;
    can_edit?: boolean | null;
    can_publish?: boolean | null;
  };

  if (profile.user_id !== user.id) {
    return { ok: false, code: "UNAUTHORIZED", error: "Não autorizado" };
  }

  if (profile[permission] !== true) {
    return { ok: false, code: "FORBIDDEN", error: "Sem permissão para esta ação" };
  }

  return { ok: true };
}

export async function RequireBiohubEditAccess(
  supabase: SupabaseServerClient,
  pageId: string,
): Promise<AccessResult> {
  return requireBiohubAccess(supabase, pageId, "can_edit");
}

export async function RequireBiohubPublishAccess(
  supabase: SupabaseServerClient,
  pageId: string,
): Promise<AccessResult> {
  return requireBiohubAccess(supabase, pageId, "can_publish");
}
