import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SeoForm } from "@/components/admin/seo/seo-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/server/account";

export const metadata: Metadata = {
  title: "SEO",
  robots: "noindex",
};

export default async function SeoPage() {
  const supabase = await createClient();
  const { user, profile, page } = await getCurrentAccount(supabase);

  if (!user) redirect("/auth/login");
  if (!profile || !page) redirect("/admin");

  return <SeoForm page={page} />;
}
