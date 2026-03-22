"use client";

import {
  BarChart3,
  Blocks,
  FileUp,
  HelpCircle,
  LayoutDashboard,
  Link2,
  LogOut,
  Palette,
  Search,
  Settings,
  Users,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/helpers";
import { useAuth } from "@/features/auth/hooks/use-auth";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Editor Visual",
    href: "/admin/editor",
    icon: Wand2,
  },
  {
    label: "Links & CTAs",
    href: "/admin/links",
    icon: Link2,
  },
  {
    label: "Blocos",
    href: "/admin/blocks",
    icon: Blocks,
  },
  {
    label: "FAQ",
    href: "/admin/faq",
    icon: HelpCircle,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Users,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Arquivos",
    href: "/admin/assets",
    icon: FileUp,
  },
  {
    label: "SEO",
    href: "/admin/seo",
    icon: Search,
  },
  {
    label: "Tema",
    href: "/admin/theme",
    icon: Palette,
  },
  {
    label: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-card shadow-soft-md lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-heading text-sm font-bold text-primary-foreground">
              T
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Therapy Bio Hub
            </p>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação admin">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, "exact" in item ? item.exact : undefined);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer sidebar */}
        <div className="border-t border-border p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
