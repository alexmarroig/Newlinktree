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
    supabase.from("pages").select("slug").eq("profile_id", profile.id).single(),
    supabase.from("settings").select("*").eq("profile_id", profile.id).single(),
  ]);

  return (
    // Break out of admin-container padding so the editor fills the full area
    <div className="-m-6">
      <AppearanceEditor
        profileId={profile.id}
        profile={profile}
        theme={theme ?? undefined}
        pageSlug={page?.slug ?? ""}
        settings={settings ?? undefined}
      />
    </div>
  );
}
