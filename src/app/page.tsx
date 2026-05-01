import { ArrowRight, BadgeCheck, BarChart3, HeartHandshake, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "Bio profissional",
    description: "Página pública com links, apresentação, FAQ, SEO e CTAs.",
    icon: BadgeCheck,
  },
  {
    title: "Leads organizados",
    description: "Formulário com consentimento e painel para acompanhar contatos.",
    icon: HeartHandshake,
  },
  {
    title: "Analytics",
    description: "Cliques, leads e conteúdos que mais geram conversas.",
    icon: BarChart3,
  },
  {
    title: "Base LGPD",
    description: "Consentimento configurável, privacidade e dados por profissional.",
    icon: ShieldCheck,
  },
];

export default function MarketingHomePage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="border-b border-border">
        <div className="mx-auto grid min-h-[88dvh] max-w-6xl content-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              BioHub para psicólogas
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
              Um hub simples para transformar visitas do Instagram em pacientes interessados.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Crie uma página profissional com WhatsApp, formulário, apresentação,
              FAQ, links e analytics. Feito para psicólogas que querem uma
              presença digital clara, ética e fácil de manter.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Ver planos</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft-lg">
            <div className="rounded-xl bg-background p-5">
              <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-primary/15" />
                <h2 className="mt-5 font-heading text-2xl font-semibold">
                  Dra. Ana Silva
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Psicóloga Clínica | CRP 00/00000
                </p>
                <div className="mt-6 w-full space-y-3">
                  {["Conversar pelo WhatsApp", "Tenho interesse em terapia", "Perguntas frequentes"].map(
                    (label) => (
                      <div
                        key={label}
                        className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium"
                      >
                        {label}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="rounded-xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 font-heading text-lg font-semibold">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
