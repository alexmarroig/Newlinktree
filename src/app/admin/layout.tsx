import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";
import { createClient } from "@/lib/supabase/server";

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

  // Busca o perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Área principal */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <AdminHeader
          userName={profile?.name ?? user.email ?? "Admin"}
          userAvatar={profile?.avatar_url ?? undefined}
        />
        <main className="flex-1 overflow-auto">
          <div className="admin-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
