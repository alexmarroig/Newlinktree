import Image from "next/image";
import type { PageData } from "@/types";

import { InterestFormModal } from "./interest-form-modal";
import { TrackingProvider } from "./tracking-provider";
import { LinktreeLinkCard } from "./linktree-link-card";
import { ThemeApplier } from "./theme-applier";
import { FloatingCta } from "./floating-cta";

interface PublicPageRendererProps {
  data: PageData;
}

/**
 * Componente raiz da página pública — layout Linktree mobile-first.
 * Server Component.
 */
export function PublicPageRenderer({ data }: PublicPageRendererProps) {
  const { profile, page, links, settings, theme } = data;

  const enabledLinks = links
    .filter((l) => l.is_enabled)
    .sort((a, b) => a.position - b.position);

  const primaryLink = enabledLinks.find((l) => l.variant === "primary" && l.type !== "divider") ?? null;

  const bgStyle =
    theme?.background_type === "image" && theme.background_image_url
      ? {
          backgroundImage: `url(${theme.background_image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : undefined;

  const isLargeTitle = theme?.title_size === "large";

  return (
    <>
      {theme && <ThemeApplier theme={theme} />}
      <TrackingProvider slug={page.slug}>
        {/* ── PAGE WRAPPER ── */}
        <div
          className="public-bg-img relative min-h-dvh bg-[#F5F5F5]"
          style={bgStyle}
        >
          <main className="mx-auto max-w-[480px] px-4 py-10">

            {/* ── HEADER ── */}
            <header className="mb-6 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="mb-4 h-[96px] w-[96px] shrink-0 overflow-hidden rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.12)]">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover object-top"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-200">
                    <span className="select-none text-2xl font-semibold text-stone-500">
                      {profile.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0]!.toUpperCase())
                        .join("")}
                    </span>
                  </div>
                )}
              </div>

              {/* Name */}
              <h1 className={`public-title font-bold leading-snug text-gray-900 ${isLargeTitle ? "text-[26px]" : "text-[20px]"}`}>
                {profile.name}
                {profile.professional_title
                  ? ` | ${profile.professional_title}`
                  : ""}
              </h1>

              {/* CRP badge */}
              {profile.crp && (
                <p className="mt-1 text-[13px] font-medium text-gray-500">
                  {profile.crp}
                </p>
              )}

              {/* Subtitle — specialties */}
              {profile.subtitle && (
                <p className="mt-1.5 text-[13px] font-medium text-gray-700">
                  {profile.subtitle}
                </p>
              )}

              {/* Availability badge */}
              {theme?.profile_badge_text && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[12px] font-medium text-green-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  {theme.profile_badge_text}
                </span>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="mt-2 max-w-[320px] text-[13px] leading-relaxed text-gray-500">
                  {profile.bio}
                </p>
              )}
            </header>

            {/* ── LINK CARDS ── */}
            <div className="flex flex-col gap-3">
              {enabledLinks.map((link) => (
                <div key={link.id} className="reveal-item">
                  <LinktreeLinkCard
                    link={link}
                    whatsappNumber={profile.whatsapp_number ?? ""}
                    defaultWhatsappMessage={settings.whatsapp_default_message ?? ""}
                    avatarUrl={profile.avatar_url}
                  />
                </div>
              ))}
            </div>

            {/* ── FOOTER SOCIAL ICONS ── */}
            <footer className="mt-8 flex items-center justify-center gap-5">
              {/* Instagram */}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}

              {/* WhatsApp */}
              {profile.whatsapp_number && (
                <a
                  href={`https://wa.me/${profile.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              )}

              {/* LinkedIn */}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}

              {/* Email */}
              {settings.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  aria-label="E-mail"
                  className="text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </a>
              )}

              {/* YouTube */}
              {profile.youtube_url && (
                <a
                  href={profile.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-gray-500 transition-colors hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </footer>
          </main>
        </div>

        {/* Form modal — global */}
        <InterestFormModal pageId={page.id} settings={settings} />

        {/* Floating CTA */}
        <FloatingCta
          primaryLink={primaryLink}
          whatsappNumber={profile.whatsapp_number ?? ""}
          defaultMessage={settings.whatsapp_default_message ?? ""}
        />
      </TrackingProvider>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.name,
            jobTitle: profile.professional_title,
            url: profile.website_url ?? undefined,
            sameAs: [profile.instagram_url, profile.website_url].filter(Boolean),
          }),
        }}
      />
    </>
  );
}
