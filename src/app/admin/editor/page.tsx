import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccessBlockedBanner } from "@/components/ui/AccessBlockedBanner";
import { EditorLayout } from "@/features/editor/components/editor-layout";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/server/account";

export const metadata: Metadata = {
  title: "Editor Visual",
  robots: "noindex",
};

type AccessMeta = {
  can_edit?: boolean;
  reason_code?: string | null;
  status?: string | null;
};

export default async function EditorPage() {
  const supabase = await createClient();
  const { user, profile, page } = await getCurrentAccount(supabase);

  if (!user) redirect("/auth/login");
  if (!profile) redirect("/admin");

  const accessMeta = (user.user_metadata?.editor_access ?? {}) as AccessMeta;
  const isBlocked = accessMeta.can_edit === false;

  if (isBlocked) {
    return (
      <div className="mx-auto w-full max-w-3xl py-8">
        <AccessBlockedBanner
          reasonCode={accessMeta.reason_code}
          status={accessMeta.status}
        />
      </div>
    );
  }

  // Carrega a primeira página do perfil
  if (!page) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">
          Nenhuma página encontrada. Configure sua página primeiro.
        </p>
      </div>
    );
  }

  const [{ data: blocks }, { data: links }] = await Promise.all([
    supabase
      .from("blocks")
      .select("*")
      .eq("page_id", page.id)
      .order("position", { ascending: true }),
    supabase
      .from("links")
      .select("*")
      .eq("page_id", page.id)
      .order("position", { ascending: true }),
  ]);

  return (
    <EditorLayout
      page={page}
      initialBlocks={blocks ?? []}
      initialLinks={links ?? []}
    />
  );
}
