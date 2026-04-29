import type { createClient } from "@/lib/supabase/server";
import { biohubAccessService } from "@/domain/access/BiohubAccessService";
import type { BiohubAccessAction } from "@/types/access";

type ActionCode = "UNAUTHORIZED" | "FORBIDDEN";

interface AccessResult {
  ok: boolean;
  code?: ActionCode;
  error?: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const ACTION_TO_PERMISSION: Record<Exclude<BiohubAccessAction, "read_public">, "can_edit" | "can_publish"> = {
  edit: "can_edit",
  publish: "can_publish",
};

async function requireBiohubAccess(
  supabase: SupabaseServerClient,
  pageId: string,
  action: Exclude<BiohubAccessAction, "read_public">,
): Promise<AccessResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "UNAUTHORIZED", error: "Não autorizado" };
  }

  const access = biohubAccessService.resolveAccess(
    {
      id: user.id,
      plan: user.user_metadata?.biohub_plan,
      status: user.user_metadata?.biohub_status,
    },
    action,
  );

  const { data: page } = await supabase
    .from("pages")
    .select("id, profiles!inner(user_id)")
    .eq("id", pageId)
    .single();

  if (!page) {
    return { ok: false, error: "Página não encontrada" };
  }

  const profile = page.profiles as unknown as { user_id: string };
  if (profile.user_id !== user.id) {
    return { ok: false, code: "UNAUTHORIZED", error: "Não autorizado" };
  }

  const permission = ACTION_TO_PERMISSION[action];
  if (!access[permission]) {
    return { ok: false, code: "FORBIDDEN", error: "Sem permissão para esta ação" };
  }

  return { ok: true };
}

export async function RequireBiohubEditAccess(supabase: SupabaseServerClient, pageId: string): Promise<AccessResult> {
  return requireBiohubAccess(supabase, pageId, "edit");
}

export async function RequireBiohubPublishAccess(
  supabase: SupabaseServerClient,
  pageId: string,
): Promise<AccessResult> {
  return requireBiohubAccess(supabase, pageId, "publish");
}
