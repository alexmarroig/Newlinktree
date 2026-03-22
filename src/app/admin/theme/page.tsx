import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ThemeEditor } from "@/components/admin/theme/theme-editor";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tema & Branding",
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
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/admin");

  const { data: theme } = await supabase
    .from("themes")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  return <ThemeEditor profileId={profile.id} theme={theme ?? undefined} />;
}
