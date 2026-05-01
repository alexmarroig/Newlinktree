import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BlocksManager } from "@/components/admin/blocks/blocks-manager";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/server/account";

export const metadata: Metadata = {
  title: "Blocos",
  robots: "noindex",
};

export default async function BlocksPage() {
  const supabase = await createClient();
  const { user, profile, page } = await getCurrentAccount(supabase);

  if (!user) redirect("/auth/login");
  if (!profile || !page) redirect("/admin");

  const { data: blocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  return (
    <BlocksManager pageId={page.id} pageSlug={page.slug} blocks={blocks ?? []} />
  );
}
