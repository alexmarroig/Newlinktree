import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FaqManager } from "@/components/admin/faq/faq-manager";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/server/account";

export const metadata: Metadata = {
  title: "FAQ",
  robots: "noindex",
};

export default async function FaqPage() {
  const supabase = await createClient();
  const { user, profile, page } = await getCurrentAccount(supabase);

  if (!user) redirect("/auth/login");
  if (!profile || !page) redirect("/admin");

  const { data: items } = await supabase
    .from("faq_items")
    .select("*")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  return <FaqManager pageId={page.id} items={items ?? []} />;
}
