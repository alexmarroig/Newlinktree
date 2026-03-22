import type { Metadata } from "next";

import { LeadsManager } from "@/components/admin/leads/leads-manager";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Leads",
  robots: "noindex",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("form_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return <LeadsManager leads={leads ?? []} />;
}
