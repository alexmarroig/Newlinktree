import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AssetsManager } from "@/components/admin/assets/assets-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Arquivos",
  robots: "noindex",
};

export default async function AssetsPage() {
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

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <AssetsManager profileId={profile.id} assets={assets ?? []} />
  );
}
