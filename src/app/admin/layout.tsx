import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/layout/admin-header";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccountOrCreate } from "@/server/account";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const account = await getCurrentAccountOrCreate();

  return (
    <div className="flex min-h-dvh bg-background">
      <AdminSidebar />

      <div className="flex flex-1 flex-col lg:pl-64">
        <AdminHeader
          userName={account.profile?.name ?? user.email ?? "Admin"}
          userAvatar={account.profile?.avatar_url ?? undefined}
          pageSlug={account.page?.slug}
          subscriptionStatus={account.subscription?.status}
        />
        <main className="flex-1 overflow-auto">
          <div className="admin-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
