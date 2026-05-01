import type { Metadata } from "next";

import { AnalyticsDashboard } from "@/components/admin/analytics/analytics-dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Analytics",
  robots: "noindex",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  // Dados de negócio do Supabase (contagens precisas)
  const [
    { count: totalLeads },
    { count: newLeads },
    { count: contactedLeads },
    { data: leadsByDay },
    { data: topLinks },
    { data: modalityStats },
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
      .select("*", { count: "exact", head: true })
      .eq("status", "contacted"),

    // Leads dos últimos 30 dias agrupados por dia
    supabase
      .rpc("get_leads_by_day", { p_profile_id: profile.id, days_back: 30 })
      .throwOnError(),

    // Links mais clicados
    supabase
      .from("links")
      .select("id, label, type, click_count")
      .eq("page_id", page?.id ?? "")
      .order("click_count", { ascending: false })
      .limit(10),

    // Distribuição por modalidade
    supabase
      .from("form_submissions")
      .select("preferred_modality"),
  ]);

  // Processa modalidade stats
  const modalityCounts =
    modalityStats?.reduce(
      (acc, sub) => {
        const key = sub.preferred_modality ?? "unknown";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) ?? {};

  return (
    <AnalyticsDashboard
      posthogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ""}
      posthogHost={process.env.NEXT_PUBLIC_POSTHOG_HOST ?? ""}
      stats={{
        totalLeads: totalLeads ?? 0,
        newLeads: newLeads ?? 0,
        contactedLeads: contactedLeads ?? 0,
      }}
      leadsByDay={(leadsByDay as Array<{ day: string; count: number }>) ?? []}
      topLinks={topLinks ?? []}
      modalityCounts={modalityCounts}
    />
  );
}
