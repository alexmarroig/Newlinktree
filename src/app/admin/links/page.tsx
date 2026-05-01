import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LinksManager } from "@/components/admin/links/links-manager";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/server/account";

export const metadata: Metadata = {
  title: "Conteúdo",
  robots: "noindex",
};

export default async function LinksPage() {
  const supabase = await createClient();

  const { user, profile, page } = await getCurrentAccount(supabase);

  if (!user) redirect("/auth/login");
  if (!profile) redirect("/admin/settings");
  if (!page) redirect("/admin/settings");

  const [{ data: links }, { data: theme }] = await Promise.all([
    supabase
      .from("links")
      .select("*")
      .eq("page_id", page.id)
      .order("position", { ascending: true }),
    supabase
      .from("themes")
      .select("*")
      .eq("profile_id", profile.id)
      .single(),
  ]);

  return (
    <div className="-m-6">
      <LinksManager
        pageId={page.id}
        pageSlug={page.slug}
        links={links ?? []}
        profile={profile}
        theme={theme ?? undefined}
      />
    </div>
  );
}
