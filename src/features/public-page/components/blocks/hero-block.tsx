import { BadgeCheck } from "lucide-react";
import Image from "next/image";

import type { Block, Profile, Settings } from "@/types";
import type { HeroContent } from "@/types";

import { CTAButton } from "../cta-button";

interface HeroBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
}

export function HeroBlock({ block, profile }: HeroBlockProps) {
  const content = block.content_json as HeroContent;

  return (
    <section
      className="px-6 pb-2 pt-10 text-center"
      id="hero"
      aria-label="Apresentação"
    >
      <div className="flex flex-col items-center gap-5">
        {/* Avatar */}
        {profile.avatar_url ? (
          <div className="relative">
            <div className="h-28 w-28 overflow-hidden rounded-full shadow-soft-lg ring-4 ring-accent/60">
              <Image
                src={profile.avatar_url}
                alt={`Foto de ${profile.name}`}
                width={112}
                height={112}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {profile.crp && (
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-soft">
                <BadgeCheck className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted shadow-soft-lg ring-4 ring-accent/60">
            <span className="font-heading text-4xl font-semibold text-muted-foreground">
              {profile.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Nome e título */}
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-semibold text-foreground hero-name-glow">
            {profile.name}
          </h1>
          <p className="text-sm font-medium text-primary">
            {profile.professional_title}
          </p>
          {profile.crp && (
            <p className="text-xs text-muted-foreground">{profile.crp}</p>
          )}
        </div>

        {/* Tagline */}
        {content.tagline && (
          <div className="max-w-[320px] space-y-1">
            <p className="text-balance text-base font-medium text-foreground/90 leading-relaxed">
              {content.tagline}
            </p>
            {content.highlightText && (
              <p className="text-balance text-sm text-muted-foreground">
                {content.highlightText}
              </p>
            )}
          </div>
        )}

        {/* Bio */}
        {profile.subtitle && (
          <p className="text-balance text-xs text-muted-foreground">
            {profile.subtitle}
          </p>
        )}

        {/* CTAs do Hero */}
        <div className="flex w-full max-w-xs flex-col gap-2.5 sm:flex-row">
          {content.ctaPrimary?.label && (
            <CTAButton
              variant="primary"
              label={content.ctaPrimary.label}
              type="form"
              icon="MessageCircle"
              trackingEvent="hero_cta_click"
              className="flex-1"
            />
          )}
          {content.ctaSecondary?.label && (
            <CTAButton
              variant="outline"
              label={content.ctaSecondary.label}
              type="scroll"
              url="#faq"
              icon="ChevronDown"
              trackingEvent="hero_cta_click"
              className="flex-1"
            />
          )}
        </div>
      </div>

      {/* Separador elegante */}
      <div className="divider-elegant mt-8" />
    </section>
  );
}
