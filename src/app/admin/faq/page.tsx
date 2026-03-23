import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FaqManager } from "@/components/admin/faq/faq-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "FAQ",
  robots: "noindex",
};

export default async function FaqPage() {
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

  const { data: items } = await supabase
    .from("faq_items")
    .select("*")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  return <FaqManager pageId={page.id} items={items ?? []} />;
}
