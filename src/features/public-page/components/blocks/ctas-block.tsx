import type { Block, Link, Profile, Settings } from "@/types";

import { CTAButton } from "../cta-button";

interface CTAsBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
  links: Link[];
}

export function CTAsBlock({ links, profile, settings }: CTAsBlockProps) {
  const enabledLinks = links.filter((l) => l.is_enabled);
  const CTA_HIERARCHY = [
    {
      label: "Quero agendar minha primeira conversa",
      sublabel: "Sem compromisso: vamos no seu ritmo 💛",
      variant: "primary" as const,
    },
    {
      label: "Tenho dúvidas sobre terapia",
      sublabel: "Resposta clara e acolhedora antes de decidir.",
      variant: "secondary" as const,
      type: "scroll",
      url: "#faq",
    },
    {
      label: "Quero entender como funciona",
      sublabel: "Te explico o processo com calma, passo a passo.",
      variant: "soft" as const,
    },
  ];

  if (enabledLinks.length === 0) return null;

  return (
    <section
      className="px-6 py-4"
      id="ctas"
      aria-label="Links e contato"
    >
      <div className="space-y-3">
        {enabledLinks.slice(0, 3).map((link, idx) => {
          const hierarchy = CTA_HIERARCHY[idx];

          return (
            <CTAButton
              key={link.id}
              linkId={link.id}
              label={hierarchy?.label ?? link.label}
              sublabel={hierarchy?.sublabel ?? link.sublabel ?? undefined}
              type={hierarchy?.type ?? link.type}
              variant={hierarchy?.variant ?? (link.variant as "primary" | "secondary" | "ghost" | "outline" | "soft")}
              icon={link.icon ?? undefined}
              url={hierarchy?.url ?? link.url ?? undefined}
              whatsappNumber={profile.whatsapp_number ?? undefined}
              whatsappMessage={link.whatsapp_message ?? undefined}
              openInNewTab={link.open_in_new_tab}
              trackingEnabled={link.tracking_enabled}
              animationDelay={idx * 60}
            />
          );
        })}
      </div>

      <div className="divider-elegant mt-6" />
    </section>
  );
}
