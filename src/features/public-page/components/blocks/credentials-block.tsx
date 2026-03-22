import {
  BadgeCheck,
  Brain,
  Clock,
  Compass,
  Globe,
  Heart,
  Languages,
  MapPin,
  Monitor,
  Sparkles,
  Users,
} from "lucide-react";

import type { Block, Profile, Settings } from "@/types";
import type { CredentialsContent } from "@/types";

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Sparkles,
  Compass,
  Heart,
  BadgeCheck,
  Globe,
  Users,
  Clock,
};

interface CredentialsBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
}

export function CredentialsBlock({ block }: CredentialsBlockProps) {
  const content = block.content_json as CredentialsContent;

  const credentials = [
    content.modality && {
      icon: Monitor,
      label: content.modality,
      description: "Modalidade",
    },
    content.location && {
      icon: MapPin,
      label: content.location,
      description: "Localização",
    },
    content.audience && {
      icon: Users,
      label: content.audience,
      description: "Público",
    },
    content.approach && {
      icon: Brain,
      label: content.approach,
      description: "Abordagem",
    },
    content.sessionDuration && {
      icon: Clock,
      label: content.sessionDuration,
      description: "Duração",
    },
    content.languages && {
      icon: Languages,
      label: content.languages,
      description: "Idiomas",
    },
  ].filter(Boolean) as Array<{
    icon: React.ElementType;
    label: string;
    description: string;
  }>;

  return (
    <section
      className="px-6 py-6"
      id="credentials"
      aria-label="Credenciais profissionais"
    >
      {/* Grid de info */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {credentials.map((cred) => {
          const Icon = cred.icon;
          return (
            <div
              key={cred.description}
              className="card-elevated group flex flex-col gap-2 p-4 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {cred.description}
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground leading-snug">
                  {cred.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges de especialidades */}
      {content.badges && content.badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {content.badges.map((badge) => {
            const Icon = badge.icon
              ? (ICON_MAP[badge.icon] ?? Sparkles)
              : Sparkles;
            return (
              <span key={badge.label} className="badge-elegant">
                <Icon className="h-3 w-3" />
                {badge.label}
              </span>
            );
          })}
        </div>
      )}

      <div className="divider-elegant mt-6" />
    </section>
  );
}
