import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsForm } from "@/components/admin/settings/settings-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Configurações",
  robots: "noindex",
};

export default async function SettingsPage() {
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

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  return (
    <SettingsForm
      profile={profile}
      settings={settings ?? undefined}
    />
  );
}
