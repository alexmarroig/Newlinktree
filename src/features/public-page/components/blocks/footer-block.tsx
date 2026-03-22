import { Instagram, Globe, Mail, Shield } from "lucide-react";

import type { Block, Profile, Settings } from "@/types";
import type { FooterContent } from "@/types";

interface FooterBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
}

export function FooterBlock({ block, profile, settings }: FooterBlockProps) {
  const content = block.content_json as FooterContent;
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="px-6 pb-10 pt-4"
      id="footer"
      aria-label="Rodapé"
    >
      {/* Links sociais */}
      {content.showSocials !== false && (
        <div className="mb-6 flex items-center justify-center gap-3">
          {profile.instagram_url && (
            <a
              href={profile.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="Site"
            >
              <Globe className="h-4 w-4" />
            </a>
          )}
          {settings.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="E-mail"
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      {/* Copyright */}
      <div className="space-y-3 text-center">
        <p className="text-xs text-muted-foreground">
          {content.copyrightText ??
            `© ${currentYear} ${profile.name}. Todos os direitos reservados.`}
        </p>

        {/* Links legais */}
        {content.showPrivacy !== false && (
          <div className="flex items-center justify-center gap-4">
            <button
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Política de privacidade"
            >
              <Shield className="h-3 w-3" />
              Privacidade
            </button>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] text-muted-foreground">
              LGPD Compliant
            </span>
          </div>
        )}

        {/* CRP e aviso ético */}
        {profile.crp && (
          <p className="text-[10px] text-muted-foreground/70">
            {profile.crp} · Atendimento sigiloso conforme o CFP
          </p>
        )}
      </div>
    </footer>
  );
}
