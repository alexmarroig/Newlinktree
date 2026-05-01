"use client";

import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SAAS_PLANS } from "@/lib/constants";
import { createBillingCheckout } from "@/server/actions/billing";
import type { Subscription } from "@/types/database";

interface BillingPanelProps {
  subscription: Subscription | null;
  profileName: string;
}

const STATUS_LABELS: Record<string, string> = {
  trialing: "Teste ativo",
  pending: "Pagamento pendente",
  active: "Assinatura ativa",
  past_due: "Pagamento atrasado",
  paused: "Assinatura pausada",
  canceled: "Assinatura cancelada",
  expired: "Assinatura expirada",
};

function formatDate(value?: string | null) {
  if (!value) return "Não definido";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function BillingPanel({ subscription, profileName }: BillingPanelProps) {
  const [loading, setLoading] = useState(false);
  const plan = SAAS_PLANS.professional;

  async function startCheckout() {
    setLoading(true);
    const result = await createBillingCheckout("professional", "monthly");
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    window.location.href = result.data.checkoutUrl;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Assinatura</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plano, checkout e status de pagamento de {profileName}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="mt-1 text-xl font-semibold">
                {STATUS_LABELS[subscription?.status ?? ""] ?? "Sem assinatura"}
              </p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Plano</p>
                <p className="font-medium">{plan.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Teste até</p>
                <p className="font-medium">
                  {formatDate(subscription?.trial_ends_at)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Renovação</p>
                <p className="font-medium">
                  {formatDate(subscription?.current_period_ends_at)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Provedor</p>
                <p className="font-medium">Mercado Pago</p>
              </div>
            </div>
            <Button onClick={startCheckout} disabled={loading} size="lg">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Ativar assinatura
            </Button>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">R$ 49</p>
            <p className="mt-1 text-sm text-muted-foreground">por mês</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>Até {plan.linkLimit} links ativos</li>
              <li>Até {plan.assetLimit} arquivos</li>
              <li>Leads, analytics e editor visual</li>
              <li>Checkout e status via Mercado Pago</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
