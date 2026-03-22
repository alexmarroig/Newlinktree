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

  if (enabledLinks.length === 0) return null;

  return (
    <section
      className="px-6 py-4"
      id="ctas"
      aria-label="Links e contato"
    >
      <div className="space-y-3">
        {enabledLinks.map((link, idx) => (
          <CTAButton
            key={link.id}
            linkId={link.id}
            label={link.label}
            sublabel={link.sublabel ?? undefined}
            type={link.type}
            variant={link.variant as "primary" | "secondary" | "ghost" | "outline" | "soft"}
            icon={link.icon ?? undefined}
            url={link.url ?? undefined}
            whatsappNumber={profile.whatsapp_number ?? undefined}
            whatsappMessage={link.whatsapp_message ?? undefined}
            openInNewTab={link.open_in_new_tab}
            trackingEnabled={link.tracking_enabled}
            animationDelay={idx * 60}
          />
        ))}
      </div>

      <div className="divider-elegant mt-6" />
    </section>
  );
}
