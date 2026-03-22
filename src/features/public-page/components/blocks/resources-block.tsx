import { BookOpen, Download, ExternalLink, FileText } from "lucide-react";

import type { Block, Profile, Settings } from "@/types";
import type { ResourcesContent } from "@/types";

const TYPE_ICON: Record<string, React.ElementType> = {
  pdf: FileText,
  article: BookOpen,
  guide: BookOpen,
};

interface ResourcesBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
}

export function ResourcesBlock({ block }: ResourcesBlockProps) {
  const content = block.content_json as ResourcesContent;

  if (!content.resources || content.resources.length === 0) return null;

  return (
    <section
      className="px-6 py-4"
      id="resources"
      aria-label="Recursos e materiais"
    >
      <div className="mb-5">
        <p className="public-section-title">
          {block.title ?? "Recursos gratuitos"}
        </p>
        {block.subtitle && (
          <p className="text-xs text-muted-foreground">{block.subtitle}</p>
        )}
      </div>

      <div className="space-y-3">
        {content.resources.map((resource) => {
          const Icon = TYPE_ICON[resource.type] ?? FileText;

          return (
            <div
              key={resource.id}
              className="card-elevated group flex items-center gap-4 p-4 transition-all"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {resource.title}
                </p>
                {resource.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {resource.description}
                  </p>
                )}
                <span className="mt-1.5 inline-block text-[10px] font-medium uppercase tracking-wider text-primary/70">
                  {resource.type === "pdf"
                    ? "PDF Gratuito"
                    : resource.type === "guide"
                      ? "Guia"
                      : "Artigo"}
                </span>
              </div>

              {(resource.url ?? resource.assetId) && (
                <a
                  href={resource.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                  aria-label={`${resource.type === "pdf" ? "Baixar" : "Acessar"} ${resource.title}`}
                >
                  {resource.type === "pdf" ? (
                    <Download className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="divider-elegant mt-6" />
    </section>
  );
}
