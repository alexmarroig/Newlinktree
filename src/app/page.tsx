import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  FileText,
  HeartHandshake,
  Link2,
  MessageCircle,
  Palette,
  QrCode,
  Share2,
  ShieldCheck,
  Smartphone,
  Users,
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
  { label: "Perguntas frequentes", icon: FileText },
  { label: "Conhecer meu site", icon: BadgeCheck },
];

const LINKTREE_FEATURES = [
  {
    title: "Links em uma pagina unica",
    description: "Organize WhatsApp, Instagram, site, materiais e agendamento no mesmo perfil.",
    icon: Link2,
  },
  {
    title: "Visual com a sua marca",
    description: "Escolha cores, foto, botoes, destaque principal e uma bio clara para compartilhar.",
    icon: Palette,
  },
  {
    title: "Formulario de interesse",
    description: "Capture nome, contato, preferencia de atendimento e consentimento antes da conversa.",
    icon: Users,
  },
  {
    title: "Pronto para divulgar",
    description: "Use o link no Instagram, no WhatsApp, em QR Code, anuncios e materiais impressos.",
    icon: Share2,
  },
  {
    title: "Analytics de cliques",
    description: "Veja quais botoes geram mais conversa e quais canais trazem pacientes interessados.",
    icon: BarChart3,
  },
  {
    title: "Mobile-first",
    description: "A pagina foi pensada para abrir bem no celular, onde a maioria das visitas acontece.",
    icon: Smartphone,
  },
];

export default function MarketingHomePage() {
  return (
    <main className="min-h-dvh bg-[#F8F4EE] text-stone-950">
      <section className="relative border-b border-stone-200 bg-[linear-gradient(135deg,#F8F4EE_0%,#EEF7F0_52%,#F8ECEF_100%)]">
        <div className="mx-auto grid max-w-6xl content-center gap-12 px-6 py-16 lg:min-h-[760px] lg:grid-cols-[1fr_0.9fr] lg:items-center">
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

            <dl className="mt-9 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["7 dias", "para configurar"],
                ["1 link", "para divulgar"],
                ["Leads", "no painel"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-xl border border-white/70 bg-white/70 p-4 shadow-soft">
                  <dt className="text-xl font-semibold text-stone-950">{value}</dt>
                  <dd className="mt-1 text-xs font-medium text-stone-600">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-[390px] rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-soft-xl backdrop-blur">
              <div className="overflow-hidden rounded-[1.5rem] bg-[#FDFBF7]">
                <div className="flex h-24 items-start justify-between bg-[linear-gradient(135deg,#0F6B57,#E7838F)] px-5 py-4">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    biohub.ethos
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    online
                  </span>
                </div>
                <div className="-mt-12 px-5 pb-6 text-center">
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
                  <div className="mt-5 space-y-2.5">
                    {PREVIEW_LINKS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex min-h-[50px] items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 text-left text-sm font-semibold shadow-soft"
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
            <div className="mx-auto mt-4 grid max-w-[390px] grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-soft-lg">
                + contatos organizados
              </div>
              <div className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-soft-lg">
                link pronto para compartilhar
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

      <section className="border-t border-stone-200 bg-[#F8F4EE] px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800">
              Inspirado no Linktree
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              So que pensado para a rotina de uma psicologa.
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-700">
              O BioHub funciona como uma bio inteligente: uma unica pagina para
              divulgar seu atendimento, direcionar conversas, capturar interesse
              e acompanhar o que esta funcionando.
            </p>
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <QrCode className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">Um link para todos os canais</p>
                  <p className="mt-1 text-sm text-stone-600">
                    Instagram, WhatsApp, cartao, QR Code, anuncios e assinatura de e-mail.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {LINKTREE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-emerald-800">
                    <Icon className="h-5 w-5" />
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

      <section className="border-t border-stone-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800">
                Painel simples
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
                Edite links, acompanhe leads e ajuste o visual sem depender de ninguem.
              </h2>
              <p className="mt-4 text-base leading-7 text-stone-700">
                O painel centraliza conteudo, design, SEO, analytics e assinatura.
                Assim a profissional consegue atualizar a pagina sempre que mudar
                um servico, material ou canal de atendimento.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-[#FAFAF7] p-4 shadow-soft-lg">
              <div className="rounded-2xl bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-500">Painel BioHub</p>
                    <h3 className="mt-1 font-heading text-2xl font-semibold">Conteudo</h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    publicado
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["WhatsApp", "Botao principal ativo", "128 cliques"],
                    ["Formulario", "Captura com consentimento", "34 leads"],
                    ["Instagram", "Canal social conectado", "89 cliques"],
                  ].map(([name, detail, metric]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="mt-1 text-xs text-stone-600">{detail}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800">
                        {metric}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
