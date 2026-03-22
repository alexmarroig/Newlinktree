"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BLOCK_TYPES } from "@/lib/constants";
import type { Block } from "@/types";

import { useEditorStore } from "../store/editor-store";

interface EditorPropertiesPanelProps {
  block: Block | null;
  onClose: () => void;
}

export function EditorPropertiesPanel({
  block,
  onClose,
}: EditorPropertiesPanelProps) {
  const { updateBlockMeta, updateBlockContent, toggleBlock } = useEditorStore();

  if (!block) return null;

  const blockDef = BLOCK_TYPES.find((t) => t.type === block.type);
  const content = block.content_json as Record<string, unknown>;

  function handleContentChange(key: string, value: unknown) {
    updateBlockContent(block!.id, { ...content, [key]: value });
  }

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-l border-border bg-card">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {blockDef?.label ?? block.type}
          </p>
          <p className="text-xs text-muted-foreground">Propriedades</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-5">
        {/* Status ativo */}
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
          <div>
            <p className="text-sm font-medium">Bloco ativo</p>
            <p className="text-xs text-muted-foreground">
              Visível na página pública
            </p>
          </div>
          <Switch
            checked={block.is_enabled}
            onCheckedChange={() => toggleBlock(block.id)}
          />
        </div>

        {/* Título e subtítulo (comum a vários blocos) */}
        {block.type !== "hero" && block.type !== "footer" && (
          <>
            <div className="space-y-2">
              <Label>Título da seção</Label>
              <Input
                value={block.title ?? ""}
                onChange={(e) =>
                  updateBlockMeta(block.id, { title: e.target.value || null })
                }
                placeholder="Título..."
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={block.subtitle ?? ""}
                onChange={(e) =>
                  updateBlockMeta(block.id, {
                    subtitle: e.target.value || null,
                  })
                }
                placeholder="Subtítulo..."
              />
            </div>
          </>
        )}

        {/* Campos específicos por tipo */}
        {block.type === "hero" && (
          <HeroProperties
            content={content}
            onChange={handleContentChange}
          />
        )}

        {block.type === "about" && (
          <AboutProperties
            content={content}
            onChange={handleContentChange}
          />
        )}

        {block.type === "footer" && (
          <FooterProperties
            content={content}
            onChange={handleContentChange}
          />
        )}

        {block.type === "faq" && (
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              Gerencie as perguntas frequentes na seção{" "}
              <strong>Blocos → FAQ</strong>.
            </p>
          </div>
        )}

        {block.type === "ctas" && (
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              Gerencie os CTAs na seção <strong>Links & CTAs</strong>.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

// ---- Sub-componentes de propriedades por tipo ----

function HeroProperties({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Tagline principal</Label>
        <Textarea
          value={(content.tagline as string) ?? ""}
          onChange={(e) => onChange("tagline", e.target.value)}
          placeholder="Psicoterapia com presença e cuidado"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Texto de destaque</Label>
        <Input
          value={(content.highlightText as string) ?? ""}
          onChange={(e) => onChange("highlightText", e.target.value)}
          placeholder="Um espaço seguro para se conhecer"
        />
      </div>
      <div className="space-y-2">
        <Label>Label do CTA primário</Label>
        <Input
          value={
            (content.ctaPrimary as { label?: string })?.label ?? ""
          }
          onChange={(e) =>
            onChange("ctaPrimary", {
              ...(content.ctaPrimary as object),
              label: e.target.value,
            })
          }
          placeholder="Quero iniciar terapia"
        />
      </div>
      <div className="space-y-2">
        <Label>Label do CTA secundário</Label>
        <Input
          value={
            (content.ctaSecondary as { label?: string })?.label ?? ""
          }
          onChange={(e) =>
            onChange("ctaSecondary", {
              ...(content.ctaSecondary as object),
              label: e.target.value,
            })
          }
          placeholder="Saiba mais"
        />
      </div>
    </>
  );
}

function AboutProperties({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Texto principal</Label>
        <Textarea
          value={(content.body as string) ?? ""}
          onChange={(e) => onChange("body", e.target.value)}
          placeholder="Escreva sobre seu trabalho..."
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Use linha em branco para separar parágrafos.
        </p>
      </div>
    </>
  );
}

function FooterProperties({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Texto de copyright</Label>
        <Input
          value={(content.copyrightText as string) ?? ""}
          onChange={(e) => onChange("copyrightText", e.target.value)}
          placeholder="© 2025 Nome. Todos os direitos reservados."
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Mostrar redes sociais</Label>
        <Switch
          checked={(content.showSocials as boolean) ?? true}
          onCheckedChange={(v) => onChange("showSocials", v)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Mostrar privacidade</Label>
        <Switch
          checked={(content.showPrivacy as boolean) ?? true}
          onCheckedChange={(v) => onChange("showPrivacy", v)}
        />
      </div>
    </>
  );
}
