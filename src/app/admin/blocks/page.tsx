import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BlocksManager } from "@/components/admin/blocks/blocks-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blocos",
  robots: "noindex",
};

export default async function BlocksPage() {
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
    .select("id, slug")
    .eq("profile_id", profile.id)
    .limit(1)
    .single();

  if (!page) redirect("/admin");

  const { data: blocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  return <BlocksManager pageId={page.id} pageSlug={page.slug} blocks={blocks ?? []} />;
}
