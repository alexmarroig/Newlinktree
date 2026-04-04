import type { Block, Link, Profile, Settings } from "@/types";
import { FileText, HeartPulse, ShieldCheck } from "lucide-react";

import { CTAButton } from "../cta-button";

interface CTAsBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
  links: Link[];
}

export function CTAsBlock({ links, profile, settings }: CTAsBlockProps) {
  const enabledLinks = links.filter((l) => l.is_enabled);
  const privacyPolicyHref = settings.privacy_policy?.trim() || "#footer";

  if (enabledLinks.length === 0) return null;

  return (
    <section className="px-6 py-4" id="ctas" aria-label="Links e contato">
      <div className="space-y-3">
        {enabledLinks.map((link, idx) => (
          <div key={link.id}>
            {idx === enabledLinks.length - 1 && (
              <aside className="mb-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
                <ul className="space-y-2 text-left text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Sigilo e ética profissional: seu atendimento segue normas
                      de confidencialidade e conduta ética.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HeartPulse className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Em crise ou emergência, este canal não substitui pronto
                      atendimento. Procure o SAMU (192) ou o serviço de urgência
                      mais próximo.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Leia nossa{" "}
                      <a
                        href={privacyPolicyHref}
                        target={
                          privacyPolicyHref.startsWith("http")
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          privacyPolicyHref.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        Política de Privacidade (LGPD) em linguagem simples
                      </a>
                      .
                    </span>
                  </li>
                </ul>
              </aside>
            )}
            <CTAButton
              linkId={link.id}
              label={link.label}
              sublabel={link.sublabel ?? undefined}
              type={link.type}
              variant={
                link.variant as
                  | "primary"
                  | "secondary"
                  | "ghost"
                  | "outline"
                  | "soft"
              }
              icon={link.icon ?? undefined}
              url={link.url ?? undefined}
              whatsappNumber={profile.whatsapp_number ?? undefined}
              whatsappMessage={link.whatsapp_message ?? undefined}
              openInNewTab={link.open_in_new_tab}
              trackingEnabled={link.tracking_enabled}
              animationDelay={idx * 60}
            />
          </div>
        ))}
      </div>

      <div className="divider-elegant mt-6" />
    </section>
  );
}
