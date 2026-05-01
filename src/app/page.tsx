import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  HeartHandshake,
  MessageCircle,
  Palette,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const CAMILA_PHOTO = "/camila-freitas.png";

const FEATURES = [
  {
    title: "Bio profissional",
    description: "Pagina publica com apresentacao, links, FAQ, SEO e CTAs.",
    icon: BadgeCheck,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    title: "Leads organizados",
    description: "Formulario com consentimento e painel para acompanhar contatos.",
    icon: HeartHandshake,
    color: "text-rose-700",
    bg: "bg-rose-50",
  },
  {
    title: "Analytics",
    description: "Cliques, leads e conteudos que mais geram conversas.",
    icon: BarChart3,
    color: "text-sky-700",
    bg: "bg-sky-50",
  },
  {
    title: "Base LGPD",
    description: "Consentimento configuravel, privacidade e dados por profissional.",
    icon: ShieldCheck,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
];

const PREVIEW_LINKS = [
  { label: "Conversar pelo WhatsApp", icon: MessageCircle },
  { label: "Tenho interesse em terapia", icon: CalendarCheck },
  { label: "Conhecer meu site", icon: BadgeCheck },
];

export default function MarketingHomePage() {
  return (
    <main className="min-h-dvh bg-[#F8F4EE] text-stone-950">
      <section className="relative overflow-hidden border-b border-stone-200 bg-[linear-gradient(135deg,#F8F4EE_0%,#EEF7F0_52%,#F8ECEF_100%)]">
        <div className="mx-auto grid min-h-[88dvh] max-w-6xl content-center gap-12 px-6 py-14 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 shadow-soft">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              BioHub por ETHOS
            </div>
            <h1 className="mt-5 max-w-2xl font-heading text-4xl font-semibold leading-[0.98] sm:text-5xl lg:text-6xl">
              Uma pagina profissional para psicologas virarem visitas em contatos.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-stone-700">
              Crie uma presenca digital clara, bonita e facil de manter, com
              WhatsApp, formulario de interesse, leads, analytics e visual
              personalizado. Tudo em um painel simples.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-emerald-800 text-white hover:bg-emerald-900">
                <Link href="/auth/register">
                  Criar meu BioHub
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-stone-300 bg-white/80 hover:bg-white"
              >
                <Link href="/pricing">Ver planos</Link>
              </Button>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["7 dias", "para configurar"],
                ["20+", "links e CTAs"],
                ["LGPD", "por padrao"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-xl border border-white/70 bg-white/70 p-4 shadow-soft">
                  <dt className="text-xl font-semibold text-stone-950">{value}</dt>
                  <dd className="mt-1 text-xs font-medium text-stone-600">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-10 hidden rounded-2xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-soft-lg lg:block">
              + novos contatos no painel
            </div>
            <div className="absolute -right-2 bottom-12 hidden rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-soft-lg lg:block">
              visual pronto para compartilhar
            </div>

            <div className="mx-auto max-w-[430px] rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-soft-xl backdrop-blur">
              <div className="overflow-hidden rounded-[1.5rem] bg-[#FDFBF7]">
                <div className="h-24 bg-[linear-gradient(135deg,#0F6B57,#E7838F)]" />
                <div className="-mt-12 px-6 pb-7 text-center">
                  <img
                    src={CAMILA_PHOTO}
                    alt="Psicologa Camila Freitas"
                    className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover object-top shadow-soft-lg"
                  />
                  <h2 className="mt-4 font-heading text-2xl font-semibold">
                    Psicologa Camila Freitas
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Psicologa Clinica | CRP 06/201444
                  </p>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-stone-600">
                    Atendimentos online e presenciais em Sao Paulo.
                  </p>
                  <div className="mt-6 space-y-3">
                    {PREVIEW_LINKS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex min-h-[54px] items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 text-left text-sm font-semibold shadow-soft"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-3 text-xs font-semibold text-stone-500">
                    <span>@psi.cavfreitas</span>
                    <span className="h-1 w-1 rounded-full bg-stone-300" />
                    <span>psicavfreitas.com.br</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800">
              Tudo no mesmo painel
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              Da primeira visita ao acompanhamento dos leads.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft transition-transform hover:-translate-y-1 hover:shadow-soft-lg"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg}`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-[#0F2F2A] px-6 py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <Palette className="h-4 w-4" />
              Personalizavel, simples e pronto para vender seu atendimento.
            </div>
            <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold">
              Comece com uma pagina bonita hoje e evolua seu BioHub no painel.
            </h2>
          </div>
          <Button size="lg" asChild className="bg-white text-emerald-950 hover:bg-emerald-50">
            <Link href="/auth/register">
              Criar conta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
