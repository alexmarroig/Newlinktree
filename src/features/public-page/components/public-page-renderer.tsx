import type { PageData } from "@/types";

import { BlockRenderer } from "./block-renderer";
import { InterestFormModal } from "./interest-form-modal";
import { ThemeApplier } from "./theme-applier";
import { TrackingProvider } from "./tracking-provider";

interface PublicPageRendererProps {
  data: PageData;
}

/**
 * Componente raiz da página pública.
 * Server Component — sem lógica de cliente aqui.
 */
export function PublicPageRenderer({ data }: PublicPageRendererProps) {
  const { profile, theme, page, blocks, links, faqItems, settings } = data;

  return (
    <>
      {/* Injeta CSS variables do tema */}
      <ThemeApplier theme={theme} />

      {/* Provider de tracking (client) */}
      <TrackingProvider slug={page.slug}>
        {/* Container principal */}
        <main
          className="mx-auto min-h-dvh w-full pb-safe"
          style={{ maxWidth: "var(--content-width)" }}
          id="main-content"
        >
          {/* Renderiza blocos em ordem */}
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              profile={profile}
              links={links.filter(
                (l) => l.block_id === block.id || block.type === "ctas",
              )}
              faqItems={block.type === "faq" ? faqItems : []}
              settings={settings}
            />
          ))}
        </main>

        {/* Modal de formulário de interesse (global) */}
        <InterestFormModal pageId={page.id} settings={settings} />
      </TrackingProvider>

      {/* JSON-LD estruturado */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.name,
            jobTitle: profile.professional_title,
            description: profile.bio,
            url: profile.website_url ?? undefined,
            sameAs: [
              profile.instagram_url,
              profile.website_url,
            ].filter(Boolean),
          }),
        }}
      />
    </>
  );
}
