import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SAAS_PLANS } from "@/lib/constants";

const PLAN_FEATURES = [
  "Página pública por slug",
  "Links e CTA para WhatsApp",
  "Formulário de interesse com consentimento",
  "Leads e analytics no painel",
  "Editor visual e tema personalizável",
];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PricingPage() {
  const plan = SAAS_PLANS.professional;

  return (
    <main className="min-h-dvh bg-background px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Planos
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold">
            Comece com uma estrutura completa para sua presença profissional.
          </h1>
          <p className="mt-4 text-muted-foreground">
            A primeira versão comercial nasce com um plano principal para
            psicólogas, checkout pelo Mercado Pago e 7 dias para configurar.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="rounded-2xl border border-primary/25 bg-card p-7 shadow-soft-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-semibold">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Para psicólogas que querem captar e organizar contatos.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Recomendado
              </span>
            </div>

            <div className="mt-8">
              <span className="font-heading text-5xl font-semibold">
                {formatPrice(plan.monthlyPriceCents)}
              </span>
              <span className="text-muted-foreground">/mês</span>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatPrice(plan.annualPriceCents)} no anual.
              </p>
            </div>

            <ul className="mt-7 space-y-3">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="mt-8 w-full" size="lg" asChild>
              <Link href="/auth/register">
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>

          <aside className="rounded-2xl border border-border bg-card p-7">
            <h2 className="font-heading text-xl font-semibold">
              O que entra na próxima etapa
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
              <p>Domínio próprio, templates extras e automações podem virar diferenciais de plano premium.</p>
              <p>O painel já fica preparado para billing, status de assinatura e webhooks.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
