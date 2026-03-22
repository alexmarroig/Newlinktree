import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SeoForm } from "@/components/admin/seo/seo-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "SEO",
  robots: "noindex",
};

export default async function SeoPage() {
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

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("profile_id", profile.id)
    .limit(1)
    .single();

  if (!page) redirect("/admin");

  return <SeoForm page={page} />;
}
