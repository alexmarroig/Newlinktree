"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExternalLink, MessageCircle, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsDashboardProps {
  posthogKey: string;
  posthogHost: string;
  stats: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
  };
  leadsByDay: Array<{ day: string; count: number }>;
  topLinks: Array<{
    id: string;
    label: string;
    type: string;
    click_count: number;
  }>;
  modalityCounts: Record<string, number>;
}

const MODALITY_LABELS: Record<string, string> = {
  online: "Online",
  presencial: "Presencial",
  either: "Sem preferência",
  unknown: "Não informado",
};

const COLORS = ["#7C6B5E", "#C5A98E", "#E8D5C4", "#4A3F38"];

export function AnalyticsDashboard({
  posthogKey,
  posthogHost,
  stats,
  leadsByDay,
  topLinks,
  modalityCounts,
}: AnalyticsDashboardProps) {
  const pieData = Object.entries(modalityCounts).map(([key, value]) => ({
    name: MODALITY_LABELS[key] ?? key,
    value,
  }));

  const totalClicks = topLinks.reduce((sum, l) => sum + l.click_count, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dados de leads e engajamento do hub
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            title: "Total de leads",
            value: stats.totalLeads,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            title: "Novos leads",
            value: stats.newLeads,
            icon: MessageCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
          },
          {
            title: "Contatados",
            value: stats.contactedLeads,
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            title: "Cliques totais",
            value: totalClicks,
            icon: ExternalLink,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} variant="elevated">
              <CardContent className="pt-6">
                <div className={`inline-flex rounded-xl p-2 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium text-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads por dia */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Leads por dia (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsByDay.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum dado ainda
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leadsByDay}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    }
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v) => [`${v} leads`, "Leads"]}
                    labelFormatter={(l) =>
                      new Date(l).toLocaleDateString("pt-BR")
                    }
                  />
                  <Bar dataKey="count" fill="hsl(28, 18%, 42%)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Preferência de modalidade */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Modalidade preferida</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum dado ainda
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Links */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base">Links mais clicados</CardTitle>
        </CardHeader>
        <CardContent>
          {topLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Nenhum clique registrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {topLinks.map((link, idx) => {
                const pct =
                  totalClicks > 0
                    ? Math.round((link.click_count / totalClicks) * 100)
                    : 0;
                return (
                  <div key={link.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium">
                          {link.label}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="muted" className="text-[10px]">
                            {link.type}
                          </Badge>
                          <span className="text-sm font-semibold">
                            {link.click_count}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PostHog embed link */}
      {posthogKey && (
        <Card variant="elevated" className="border-primary/20">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm font-semibold">Analytics avançado</p>
              <p className="text-xs text-muted-foreground">
                Acesse o PostHog para dados comportamentais detalhados —
                funis, sessões, heatmaps e muito mais.
              </p>
            </div>
            <a
              href={`${posthogHost}/project`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Badge variant="default" className="gap-1.5 cursor-pointer hover:opacity-90">
                <ExternalLink className="h-3 w-3" />
                PostHog
              </Badge>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
