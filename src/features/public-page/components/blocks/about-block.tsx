import { Check } from "lucide-react";

import type { Block, Profile, Settings } from "@/types";
import type { AboutContent } from "@/types";

interface AboutBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
}

export function AboutBlock({ block }: AboutBlockProps) {
  const content = block.content_json as AboutContent;

  return (
    <section
      className="px-6 py-4"
      id="about"
      aria-label="Sobre o trabalho"
    >
      {/* Título do bloco */}
      <div className="mb-5">
        <p className="public-section-title">{block.title ?? "Sobre o meu trabalho"}</p>
        {block.subtitle && (
          <p className="text-xs text-muted-foreground">{block.subtitle}</p>
        )}
      </div>

      {/* Corpo do texto */}
      {content.body && (
        <div className="space-y-4">
          {content.body.split("\n\n").map((paragraph, idx) => (
            <p
              key={idx}
              className="text-sm text-foreground/85 leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Lista de bullet points */}
      {content.bulletPoints && content.bulletPoints.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {content.bulletPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary stroke-[2.5]" />
              </div>
              <span className="text-sm text-foreground/85">{point}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="divider-elegant mt-6" />
    </section>
  );
}
