"use client";

import {
  BarChart3,
  CreditCard,
  Link2,
  LogOut,
  Palette,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/helpers";

const PRIMARY_NAV = [
  { label: "Conteúdo", href: "/admin/links", icon: Link2 },
  { label: "Design", href: "/admin/theme", icon: Palette },
  { label: "Configurações", href: "/admin/settings", icon: Settings },
  { label: "Assinatura", href: "/admin/billing", icon: CreditCard },
] as const;

const SECONDARY_NAV = [
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Leads", href: "/admin/leads", icon: Users },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-card shadow-soft-md lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="font-heading text-sm font-bold text-primary-foreground">
            B
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">BioHub</p>
          <p className="text-xs text-muted-foreground">Painel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação admin">
        <ul className="space-y-1">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
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

        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Dados
          </p>
          <ul className="space-y-0.5">
            {SECONDARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
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
        </div>
      </nav>

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
  );
}
