"use client";

import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BLOCK_TYPES } from "@/lib/constants";
import type {
  Block,
  CredentialsContent,
  StartHereContent,
  ResourcesContent,
} from "@/types";

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
  const content = (block.content_json ?? {}) as Record<string, unknown>;

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

      <div className="space-y-5 p-4">
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
          <HeroProperties content={content} onChange={handleContentChange} />
        )}

        {block.type === "credentials" && (
          <CredentialsProperties
            content={content as CredentialsContent}
            onChange={handleContentChange}
          />
        )}

        {block.type === "start_here" && (
          <StartHereProperties
            content={content as StartHereContent}
            onChange={handleContentChange}
          />
        )}

        {block.type === "resources" && (
          <ResourcesProperties
            content={content as ResourcesContent}
            onChange={handleContentChange}
          />
        )}

        {block.type === "about" && (
          <AboutProperties content={content} onChange={handleContentChange} />
        )}

        {block.type === "footer" && (
          <FooterProperties content={content} onChange={handleContentChange} />
        )}

        {block.type === "faq" && (
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              Gerencie as perguntas frequentes na seção{" "}
              <strong>FAQ</strong> no menu lateral.
            </p>
          </div>
        )}

        {block.type === "ctas" && (
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              Gerencie os CTAs na seção <strong>Links & CTAs</strong> no menu lateral.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

// ---- Hero ----

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
          value={(content.ctaPrimary as { label?: string })?.label ?? ""}
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
          value={(content.ctaSecondary as { label?: string })?.label ?? ""}
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

// ---- Credentials ----

function CredentialsProperties({
  content,
  onChange,
}: {
  content: CredentialsContent;
  onChange: (key: string, value: unknown) => void;
}) {
  const fields: Array<{ key: keyof CredentialsContent; label: string; placeholder: string }> = [
    { key: "modality", label: "Modalidade", placeholder: "Online e Presencial" },
    { key: "location", label: "Localização", placeholder: "São Paulo, SP" },
    { key: "audience", label: "Público atendido", placeholder: "Adultos" },
    { key: "approach", label: "Abordagem", placeholder: "TCC, Psicanálise" },
    { key: "sessionDuration", label: "Duração da sessão", placeholder: "50 minutos" },
    { key: "languages", label: "Idiomas", placeholder: "Português" },
  ];

  const badges = (content.badges ?? []) as Array<{ label: string; icon?: string }>;

  function addBadge() {
    onChange("badges", [...badges, { label: "Novo badge" }]);
  }

  function updateBadge(index: number, label: string) {
    const updated = badges.map((b, i) => (i === index ? { ...b, label } : b));
    onChange("badges", updated);
  }

  function removeBadge(index: number) {
    onChange("badges", badges.filter((_, i) => i !== index));
  }

  return (
    <>
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-2">
          <Label>{label}</Label>
          <Input
            value={(content[key] as string) ?? ""}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
          />
        </div>
      ))}

      {/* Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Badges de destaque</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={addBadge}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        {badges.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum badge.</p>
        )}
        {badges.map((badge, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={badge.label}
              onChange={(e) => updateBadge(index, e.target.value)}
              placeholder="Ex: CRP 06/12345"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeBadge(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

// ---- Start Here ----

function StartHereProperties({
  content,
  onChange,
}: {
  content: StartHereContent;
  onChange: (key: string, value: unknown) => void;
}) {
  const cards = (content.cards ?? []) as StartHereContent["cards"];

  function addCard() {
    const newCard = {
      id: crypto.randomUUID(),
      title: "Novo card",
      description: "Descrição do card",
      icon: "Sparkles",
    };
    onChange("cards", [...(cards ?? []), newCard]);
  }

  function updateCard(
    index: number,
    field: "title" | "description" | "icon",
    value: string,
  ) {
    const updated = (cards ?? []).map((c, i) =>
      i === index ? { ...c, [field]: value } : c,
    );
    onChange("cards", updated);
  }

  function removeCard(index: number) {
    onChange("cards", (cards ?? []).filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Cards de entrada</Label>
        <Button type="button" variant="ghost" size="icon-sm" onClick={addCard}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {(!cards || cards.length === 0) && (
        <p className="text-xs text-muted-foreground">Nenhum card cadastrado.</p>
      )}

      {(cards ?? []).map((card, index) => (
        <div
          key={card.id ?? index}
          className="space-y-2 rounded-xl border border-border p-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              Card {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeCard(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input
              value={card.title}
              onChange={(e) => updateCard(index, "title", e.target.value)}
              placeholder="Título do card"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Textarea
              value={card.description}
              onChange={(e) => updateCard(index, "description", e.target.value)}
              placeholder="Breve descrição..."
              rows={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Resources ----

function ResourcesProperties({
  content,
  onChange,
}: {
  content: ResourcesContent;
  onChange: (key: string, value: unknown) => void;
}) {
  const resources = (content.resources ?? []) as ResourcesContent["resources"];

  function addResource() {
    const newResource = {
      id: crypto.randomUUID(),
      title: "Novo recurso",
      type: "guide" as const,
      description: "",
    };
    onChange("resources", [...(resources ?? []), newResource]);
  }

  function updateResource(
    index: number,
    field: "title" | "description" | "url" | "type",
    value: string,
  ) {
    const updated = (resources ?? []).map((r, i) =>
      i === index ? { ...r, [field]: value } : r,
    );
    onChange("resources", updated);
  }

  function removeResource(index: number) {
    onChange("resources", (resources ?? []).filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {/* Display mode */}
      <div className="flex items-center justify-between">
        <Label>Modo de exibição</Label>
        <div className="flex gap-1">
          {(["cards", "list"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant={content.displayMode === mode ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => onChange("displayMode", mode)}
            >
              {mode === "cards" ? "Cards" : "Lista"}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Recursos</Label>
        <Button type="button" variant="ghost" size="icon-sm" onClick={addResource}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {(!resources || resources.length === 0) && (
        <p className="text-xs text-muted-foreground">Nenhum recurso cadastrado.</p>
      )}

      {(resources ?? []).map((resource, index) => (
        <div
          key={resource.id ?? index}
          className="space-y-2 rounded-xl border border-border p-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              Recurso {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeResource(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input
              value={resource.title}
              onChange={(e) => updateResource(index, "title", e.target.value)}
              placeholder="Nome do recurso"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Input
              value={resource.description ?? ""}
              onChange={(e) => updateResource(index, "description", e.target.value)}
              placeholder="Breve descrição..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">URL externa (opcional)</Label>
            <Input
              value={resource.url ?? ""}
              onChange={(e) => updateResource(index, "url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo</Label>
            <select
              value={resource.type}
              onChange={(e) => updateResource(index, "type", e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="guide">Guia</option>
              <option value="pdf">PDF</option>
              <option value="article">Artigo</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- About ----

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

// ---- Footer ----

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
