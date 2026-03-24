import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LinksManager } from "@/components/admin/links/links-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Conteúdo",
  robots: "noindex",
};

export default async function LinksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/admin/settings");

  const { data: page } = await supabase
    .from("pages")
    .select("id, slug")
    .eq("profile_id", profile.id)
    .limit(1)
    .single();

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
