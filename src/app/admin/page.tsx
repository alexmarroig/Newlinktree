import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: "noindex",
};

export default async function AdminPage() {
  const supabase = await createClient();

  // Carrega dados do dashboard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  // Estatísticas básicas
  const [
    { count: totalLeads },
    { count: newLeads },
    { data: recentLeads },
    { data: topLinks },
  ] = await Promise.all([
    supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),

    supabase
      .from("form_submissions")
      .select("id, name, whatsapp, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("links")
      .select("id, label, type, click_count")
      .order("click_count", { ascending: false })
      .limit(5),
  ]);

  return (
    <AdminDashboard
      profileName={profile.name}
      stats={{
        totalLeads: totalLeads ?? 0,
        newLeads: newLeads ?? 0,
      }}
      recentLeads={recentLeads ?? []}
      topLinks={topLinks ?? []}
    />
  );
}
