import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BillingPanel } from "@/components/admin/billing/billing-panel";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/server/account";

export const metadata: Metadata = {
  title: "Assinatura",
  robots: "noindex",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const { user, profile, subscription } = await getCurrentAccount(supabase);

  if (!user) redirect("/auth/login");
  if (!profile) redirect("/admin");

  return (
    <BillingPanel
      profileName={profile.name}
      subscription={subscription}
    />
  );
}
