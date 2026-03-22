import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LinksManager } from "@/components/admin/links/links-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Links & CTAs",
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
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/admin");

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("profile_id", profile.id)
    .limit(1)
    .single();

  if (!page) redirect("/admin");

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  return <LinksManager pageId={page.id} links={links ?? []} />;
}
