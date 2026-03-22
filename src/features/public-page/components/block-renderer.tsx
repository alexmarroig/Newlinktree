import type { Block, FaqItem, Link, Profile, Settings } from "@/types";

import { AboutBlock } from "./blocks/about-block";
import { CredentialsBlock } from "./blocks/credentials-block";
import { CTAsBlock } from "./blocks/ctas-block";
import { FAQBlock } from "./blocks/faq-block";
import { FooterBlock } from "./blocks/footer-block";
import { HeroBlock } from "./blocks/hero-block";
import { ResourcesBlock } from "./blocks/resources-block";
import { StartHereBlock } from "./blocks/start-here-block";

interface BlockRendererProps {
  block: Block;
  profile: Profile;
  links: Link[];
  faqItems: FaqItem[];
  settings: Settings;
}

/**
 * Motor de renderização de blocos.
 * Interpreta o `type` e renderiza o componente correto.
 */
export function BlockRenderer({
  block,
  profile,
  links,
  faqItems,
  settings,
}: BlockRendererProps) {
  if (!block.is_enabled) return null;

  const commonProps = { block, profile, settings };

  switch (block.type) {
    case "hero":
      return <HeroBlock {...commonProps} />;

    case "credentials":
      return <CredentialsBlock {...commonProps} />;

    case "start_here":
      return <StartHereBlock {...commonProps} links={links} />;

    case "ctas":
      return <CTAsBlock {...commonProps} links={links} />;

    case "about":
      return <AboutBlock {...commonProps} />;

    case "resources":
      return <ResourcesBlock {...commonProps} />;

    case "faq":
      return <FAQBlock {...commonProps} faqItems={faqItems} />;

    case "footer":
      return <FooterBlock {...commonProps} />;

    default:
      return null;
  }
}
