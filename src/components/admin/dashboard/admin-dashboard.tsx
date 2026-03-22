"use client";

import {
  ArrowRight,
  MessageCircle,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants";
import { formatDateTime } from "@/lib/helpers";

interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: string;
  color?: string;
}

interface AdminDashboardProps {
  profileName: string;
  stats: {
    totalLeads: number;
    newLeads: number;
  };
  recentLeads: Array<{
    id: string;
    name: string;
    whatsapp: string;
    status: string;
    created_at: string;
  }>;
  topLinks: Array<{
    id: string;
    label: string;
    type: string;
    click_count: number;
  }>;
}

export function AdminDashboard({
  profileName,
  stats,
  recentLeads,
  topLinks,
}: AdminDashboardProps) {
  const statCards: StatCard[] = [
    {
      title: "Total de leads",
      value: stats.totalLeads,
      description: "Formulários recebidos",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Novos leads",
      value: stats.newLeads,
      description: "Aguardando contato",
      icon: MessageCircle,
      color: "text-emerald-600",
    },
    {
      title: "Taxa de conversão",
      value: "—",
      description: "Via PostHog",
      icon: TrendingUp,
      color: "text-amber-600",
    },
    {
      title: "Cliques totais",
      value: topLinks.reduce((sum, l) => sum + l.click_count, 0),
      description: "Em todos os CTAs",
      icon: MousePointerClick,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Olá, {profileName.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui está um resumo do seu hub
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2 ${stat.color?.replace("text-", "bg-").replace("-600", "-100")}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-foreground">{stat.title}</p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads recentes */}
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Leads recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/leads">
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Nenhum lead ainda
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Leads aparecerão aqui quando o formulário for preenchido
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {lead.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(lead.created_at)}
                      </p>
                    </div>
                    <Badge variant={LEAD_STATUS_COLORS[lead.status] ?? "default"}>
                      {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Top links */}
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Links mais clicados</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/links">
                Gerenciar
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {topLinks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <MousePointerClick className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Nenhum clique registrado
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {topLinks.map((link, idx) => (
                  <li key={link.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {link.label}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {link.type}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {link.click_count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base">Ações rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Editor Visual", href: "/admin/editor", icon: "🎨" },
              { label: "Gerenciar Links", href: "/admin/links", icon: "🔗" },
              { label: "Ver Leads", href: "/admin/leads", icon: "📋" },
              { label: "Configurações", href: "/admin/settings", icon: "⚙️" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center transition-all hover:border-primary/30 hover:bg-muted/50"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-medium text-foreground">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
