import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppearanceEditor } from "@/components/admin/theme/appearance-editor";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Aparência",
  robots: "noindex",
};

export default async function ThemePage() {
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

  if (!profile) redirect("/admin");

  const [{ data: theme }, { data: page }, { data: settings }] = await Promise.all([
    supabase.from("themes").select("*").eq("profile_id", profile.id).single(),
    supabase.from("pages").select("id, slug").eq("profile_id", profile.id).single(),
    supabase.from("settings").select("*").eq("profile_id", profile.id).single(),
  ]);

  const { data: links } = page?.id
    ? await supabase
        .from("links")
        .select("*")
        .eq("page_id", page.id)
        .eq("is_enabled", true)
        .order("position", { ascending: true })
    : { data: [] };

  return (
    // Break out of admin-container padding so the editor fills the full area
    <div className="-m-6">
      <AppearanceEditor
        profileId={profile.id}
        profile={profile}
        theme={theme ?? undefined}
        pageSlug={page?.slug ?? ""}
        settings={settings ?? undefined}
        links={links ?? []}
      />
    </div>
  );
}
