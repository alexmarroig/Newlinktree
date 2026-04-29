import type { createClient } from "@/lib/supabase/server";
import { BiohubAccessService } from "@/server/services/biohub-access-service";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface AdminWriteAccessResult {
  ok: boolean;
  userId?: string;
  code?: "UNAUTHORIZED" | "FORBIDDEN";
  error?: string;
}

export async function requireAdminWriteAccess(
  supabase: SupabaseServerClient,
): Promise<AdminWriteAccessResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "UNAUTHORIZED", error: "Não autorizado" };
  }

  try {
    await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });
  } catch {
    return { ok: false, code: "FORBIDDEN", error: "Sem permissão para escrita" };
  }

  return { ok: true, userId: user.id };
}
