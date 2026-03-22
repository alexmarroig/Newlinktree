"use client";

import {
  BookOpen,
  Compass,
  Download,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

import type { Block, Link, Profile, Settings } from "@/types";
import type { StartHereContent } from "@/types";

import { useFormModal } from "../../hooks/use-form-modal";

const ICON_MAP: Record<string, React.ElementType> = {
  MessageCircle,
  HelpCircle,
  BookOpen,
  Download,
  Compass,
};

interface StartHereBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
  links: Link[];
}

export function StartHereBlock({ block, profile }: StartHereBlockProps) {
  const content = block.content_json as StartHereContent;
  const { openModal } = useFormModal();

  if (!content.cards || content.cards.length === 0) return null;

  function handleCardClick(
    linkType: string,
    url?: string,
    whatsapp?: string,
  ) {
    if (linkType === "whatsapp" && profile.whatsapp_number) {
      const msg =
        whatsapp ??
        "Olá! Vim pelo seu perfil e gostaria de iniciar terapia.";
      window.open(
        `https://wa.me/${profile.whatsapp_number}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else if (linkType === "form") {
      openModal();
    } else if (linkType === "scroll" && url) {
      document.querySelector(url)?.scrollIntoView({ behavior: "smooth" });
    } else if (linkType === "url" && url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <section
      className="px-6 py-4"
      id="start-here"
      aria-label="Por onde começar"
    >
      <div className="mb-4">
        <p className="public-section-title">Por onde começar?</p>
        <p className="text-xs text-muted-foreground">
          Escolha o caminho que faz mais sentido para você
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {content.cards.map((card, idx) => {
          const Icon = ICON_MAP[card.icon] ?? Compass;

          return (
            <button
              key={card.id}
              onClick={() =>
                handleCardClick(card.linkType ?? "url")
              }
              className="card-elevated group flex flex-col gap-3 p-4 text-left transition-all hover:border-primary/20 hover:shadow-soft-md active:scale-[0.98]"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {card.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="divider-elegant mt-6" />
    </section>
  );
}
