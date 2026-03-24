"use client";

import {
  Pencil,
  Plus,
  Trash2,
  MessageCircle,
  ClipboardList,
  Globe,
  Instagram,
  FileText,
  Minus,
  Link2,
  MousePointer,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createLink, updateLink, toggleLink, deleteLink } from "@/server/actions/links";
import { linkSchema, type LinkSchema } from "@/lib/validations";
import type { Link, Profile, Theme } from "@/types";
import { LinksPhonePreview } from "./links-phone-preview";

interface LinksManagerProps {
  pageId: string;
  pageSlug?: string;
  links: Link[];
  profile?: Profile;
  theme?: Theme;
}

const ADMIN_ICON_CONFIG: Record<string, { Icon: React.ElementType; bg: string; color: string }> = {
  whatsapp: { Icon: MessageCircle, bg: "bg-green-100", color: "text-green-600" },
  form:     { Icon: ClipboardList, bg: "bg-violet-100", color: "text-violet-600" },
  url:      { Icon: Globe, bg: "bg-sky-100", color: "text-sky-600" },
  instagram:{ Icon: Instagram, bg: "bg-pink-100", color: "text-pink-600" },
  download: { Icon: FileText, bg: "bg-amber-100", color: "text-amber-600" },
  divider:  { Icon: Minus, bg: "bg-gray-100", color: "text-gray-400" },
  scroll:   { Icon: MousePointer, bg: "bg-teal-100", color: "text-teal-600" },
  default:  { Icon: Link2, bg: "bg-stone-100", color: "text-stone-500" },
};

const TYPE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  url: "URL",
  instagram: "Instagram",
  download: "Download",
  form: "Formulário",
  scroll: "Scroll",
  modal: "Modal",
  internal: "Interno",
};

const VARIANT_COLORS: Record<string, "default" | "secondary" | "muted" | "outline"> = {
  primary: "default",
  secondary: "secondary",
  ghost: "muted",
  outline: "outline",
  soft: "muted",
};

const TYPE_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "url", label: "URL externa" },
  { value: "instagram", label: "Instagram" },
  { value: "download", label: "Download" },
  { value: "form", label: "Formulário de contato" },
  { value: "scroll", label: "Rolar para seção" },
  { value: "divider", label: "Separador de seção" },
];

const VARIANT_OPTIONS = [
  { value: "primary", label: "Principal (destaque)" },
  { value: "secondary", label: "Secundário" },
  { value: "outline", label: "Contorno" },
  { value: "ghost", label: "Ghost" },
  { value: "soft", label: "Suave" },
];

// ─── Color swatch palette ─────────────────────────────────────────────────────

const SWATCH_COLORS = [
  // Neutros
  "#ffffff", "#f5f5f5", "#e0e0e0", "#9e9e9e", "#424242", "#1a1a1a",
  // Verdes
  "#25d366", "#4caf50", "#2e7d32", "#1b5e20",
  // Azuis
  "#2196f3", "#1565c0", "#0d47a1", "#003c8f",
  // Roxos
  "#9c27b0", "#6a1b9a", "#7c4dff", "#4527a0",
  // Rosas/Vermelhos
  "#e91e63", "#c2185b", "#f44336", "#b71c1c",
  // Amarelos/Laranjas
  "#ff9800", "#e65100", "#ffc107", "#f57f17",
  // Turquesa/Teal
  "#009688", "#00695c",
];

function ColorSwatchPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Limpar
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SWATCH_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onChange(color)}
            className="relative h-7 w-7 rounded-lg border border-gray-200 transition-transform hover:scale-110"
            style={{ backgroundColor: color }}
          >
            {value === color && (
              <span
                className="absolute inset-0 flex items-center justify-center text-[13px] font-bold"
                style={{ color: color === "#ffffff" || color === "#f5f5f5" || color === "#e0e0e0" ? "#333" : "#fff" }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
        {/* Custom color */}
        <label
          title="Cor personalizada"
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400 transition-transform hover:scale-110"
        >
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span className="text-[10px] font-bold text-white drop-shadow">+</span>
        </label>
      </div>
    </div>
  );
}

// ─── Link form (shared for create + edit) ─────────────────────────────────────

function LinkForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  mode,
}: {
  defaultValues: Partial<LinkSchema>;
  onSubmit: (data: LinkSchema) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: "create" | "edit";
}) {
  const form = useForm<LinkSchema>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      label: "",
      sublabel: "",
      type: "whatsapp",
      url: "",
      whatsappMessage: "",
      openInNewTab: true,
      variant: "primary",
      isEnabled: true,
      trackingEnabled: true,
      thumbnailUrl: "",
      customBgColor: "",
      customTextColor: "",
      customIcon: "",
      linkAnimation: "none" as LinkSchema["linkAnimation"],
      ...defaultValues,
    },
  });

  const watchedType = form.watch("type");
  const needsUrl = ["url", "instagram", "download"].includes(watchedType);
  const needsWhatsapp = watchedType === "whatsapp";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Label */}
      <div className="space-y-1.5">
        <Label htmlFor="label">Texto do botão *</Label>
        <Input
          id="label"
          placeholder="Ex: Falar no WhatsApp"
          {...form.register("label")}
        />
        {form.formState.errors.label && (
          <p className="text-xs text-destructive">{form.formState.errors.label.message}</p>
        )}
      </div>

      {/* Sublabel */}
      <div className="space-y-1.5">
        <Label htmlFor="sublabel">Texto secundário</Label>
        <Input
          id="sublabel"
          placeholder="Ex: Respondo em até 24h"
          {...form.register("sublabel")}
        />
      </div>

      {/* Tipo */}
      <div className="space-y-1.5">
        <Label>Tipo *</Label>
        <Select
          value={form.watch("type")}
          onValueChange={(v) => form.setValue("type", v as LinkSchema["type"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.type && (
          <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
        )}
      </div>

      {/* URL (condicional) */}
      {needsUrl && (
        <div className="space-y-1.5">
          <Label htmlFor="url">
            {watchedType === "download" ? "URL do arquivo" : "URL"}
          </Label>
          <Input
            id="url"
            type="url"
            placeholder="https://..."
            {...form.register("url")}
          />
          {form.formState.errors.url && (
            <p className="text-xs text-destructive">{form.formState.errors.url.message}</p>
          )}
        </div>
      )}

      {/* Mensagem WhatsApp (condicional) */}
      {needsWhatsapp && (
        <div className="space-y-1.5">
          <Label htmlFor="whatsappMessage">Mensagem pré-definida</Label>
          <Input
            id="whatsappMessage"
            placeholder="Olá! Gostaria de saber mais..."
            {...form.register("whatsappMessage")}
          />
        </div>
      )}

      {/* Variante */}
      <div className="space-y-1.5">
        <Label>Estilo visual</Label>
        <Select
          value={form.watch("variant")}
          onValueChange={(v) => form.setValue("variant", v as LinkSchema["variant"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VARIANT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Animation */}
      {form.watch("type") !== "divider" && (
        <div className="space-y-1.5">
          <Label>Animação de atenção</Label>
          <div className="flex gap-2">
            {(
              [
                { value: "none", label: "Nenhuma", icon: "—" },
                { value: "shake", label: "Shake", icon: "↔" },
                { value: "pulse", label: "Pulse", icon: "◎" },
                { value: "bounce", label: "Bounce", icon: "↑" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => form.setValue("linkAnimation", opt.value)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-2 px-1 text-[11px] font-medium transition-all ${
                  form.watch("linkAnimation") === opt.value
                    ? "border-gray-900 bg-white shadow-sm"
                    : "border-transparent bg-gray-100 hover:border-gray-300 hover:bg-white"
                }`}
              >
                <span className="text-base leading-none">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Thumbnail URL */}
      <div className="space-y-1.5">
        <Label htmlFor="thumbnailUrl">Imagem do botão (URL)</Label>
        <div className="flex items-center gap-2">
          {form.watch("thumbnailUrl") && (
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={form.watch("thumbnailUrl")!}
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
                onError={() => {}}
              />
            </div>
          )}
          <Input
            id="thumbnailUrl"
            type="url"
            placeholder="https://... (opcional)"
            {...form.register("thumbnailUrl")}
            className="flex-1"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Aparece como thumbnail à esquerda do botão. Use Arquivos para fazer upload.
        </p>
      </div>

      {/* Custom colors */}
      <div className="space-y-2">
        <Label>Cores personalizadas</Label>
        <div className="space-y-3">
          <ColorSwatchPicker
            label="Fundo do botão"
            value={form.watch("customBgColor") || ""}
            onChange={(v) => form.setValue("customBgColor", v)}
          />
          <ColorSwatchPicker
            label="Cor do texto/ícone"
            value={form.watch("customTextColor") || ""}
            onChange={(v) => form.setValue("customTextColor", v)}
          />
        </div>
        {(form.watch("customBgColor") || form.watch("customTextColor")) && (
          <div
            className="flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: form.watch("customBgColor") || "#1a1a1a",
              color: form.watch("customTextColor") || "#ffffff",
            }}
          >
            {form.watch("label") || "Prévia do botão"}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          Deixe em branco para usar as cores do tema global.
        </p>
      </div>

      {/* Toggles */}
      <div className="space-y-3 rounded-xl bg-muted/40 p-3">
        <div className="flex items-center justify-between">
          <Label className="font-normal">Ativo na página</Label>
          <Switch
            checked={form.watch("isEnabled")}
            onCheckedChange={(v) => form.setValue("isEnabled", v)}
          />
        </div>
        {needsUrl && (
          <div className="flex items-center justify-between">
            <Label className="font-normal">Abrir em nova aba</Label>
            <Switch
              checked={form.watch("openInNewTab")}
              onCheckedChange={(v) => form.setValue("openInNewTab", v)}
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : mode === "create" ? "Criar link" : "Salvar alterações"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function LinksManager({ pageId, pageSlug, links: initialLinks, profile, theme }: LinksManagerProps) {
  const [links, setLinks] = useState(initialLinks);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(data: LinkSchema) {
    setIsSubmitting(true);
    try {
      const result = await createLink(pageId, data);
      if (result.success) {
        setLinks((prev) => [...prev, result.data]);
        toast.success("Link criado com sucesso");
        setCreateOpen(false);
      } else {
        toast.error(result.error ?? "Erro ao criar link");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(data: LinkSchema) {
    if (!editingLink) return;
    setIsSubmitting(true);
    try {
      const result = await updateLink(editingLink.id, data);
      if (result.success) {
        setLinks((prev) => prev.map((l) => (l.id === editingLink.id ? result.data : l)));
        toast.success("Link atualizado");
        setEditingLink(null);
      } else {
        toast.error(result.error ?? "Erro ao atualizar link");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(linkId: string) {
    const result = await toggleLink(linkId);
    if (result.success) {
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, is_enabled: !l.is_enabled } : l)),
      );
    } else {
      toast.error("Erro ao atualizar link");
    }
  }

  async function handleDelete(linkId: string) {
    if (!confirm("Deletar este link?")) return;
    const result = await deleteLink(linkId);
    if (result.success) {
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
      toast.success("Link deletado");
    } else {
      toast.error("Erro ao deletar link");
    }
  }

  // Map Link → LinkSchema defaults for edit dialog
  function linkToDefaults(link: Link): Partial<LinkSchema> {
    return {
      label: link.label,
      sublabel: link.sublabel ?? "",
      type: link.type as LinkSchema["type"],
      url: link.url ?? "",
      whatsappMessage: link.whatsapp_message ?? "",
      openInNewTab: link.open_in_new_tab,
      variant: link.variant as LinkSchema["variant"],
      isEnabled: link.is_enabled,
      trackingEnabled: link.tracking_enabled,
      thumbnailUrl: link.thumbnail_url ?? "",
      customBgColor: link.custom_bg_color ?? "",
      customTextColor: link.custom_text_color ?? "",
      customIcon: link.custom_icon ?? "",
      linkAnimation: (link.link_animation ?? "none") as LinkSchema["linkAnimation"],
    };
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left: links list */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="font-heading text-xl font-semibold">Conteúdo</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os botões e links da sua página
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pageSlug && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/${pageSlug}`} target="_blank" rel="noopener noreferrer">
                  Ver página
                </a>
              </Button>
            )}
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo link
            </Button>
          </div>
        </div>

        {/* Links list */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">
                {links.length} link{links.length !== 1 ? "s" : ""} cadastrado{links.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent padding="none">
              {links.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum link cadastrado. Clique em &ldquo;Novo link&rdquo; para adicionar.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {links.map((link) => (
                    <li
                      key={link.id}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 ${!link.is_enabled ? "opacity-60" : ""}`}
                    >
                      {/* Link-type icon */}
                      {link.thumbnail_url ? (
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border">
                          <Image
                            src={link.thumbnail_url}
                            alt=""
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (() => {
                        const iconCfg = ADMIN_ICON_CONFIG[link.type] ?? ADMIN_ICON_CONFIG.default;
                        return (
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconCfg.bg}`}>
                            <iconCfg.Icon className={`h-5 w-5 ${iconCfg.color}`} />
                          </div>
                        );
                      })()}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {link.label}
                          </p>
                          <Badge variant={VARIANT_COLORS[link.variant] ?? "muted"} className="text-[10px]">
                            {link.variant}
                          </Badge>
                        </div>
                        {link.sublabel && (
                          <p className="truncate text-xs text-muted-foreground">{link.sublabel}</p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {TYPE_LABELS[link.type] ?? link.type}
                          </Badge>
                          <span className={`text-[11px] font-medium tabular-nums ${link.click_count > 0 ? "text-blue-600" : "text-muted-foreground"}`}>
                            {link.click_count} clique{link.click_count !== 1 ? "s" : ""}
                          </span>
                          {link.url && (
                            <span className="max-w-[200px] truncate text-[11px] text-muted-foreground">
                              {link.url}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingLink(link)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Switch
                          checked={link.is_enabled}
                          onCheckedChange={() => handleToggle(link.id)}
                          aria-label={link.is_enabled ? "Desativar" : "Ativar"}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(link.id)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Deletar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right: phone preview */}
      <div className="hidden w-[420px] shrink-0 border-l border-border bg-muted/20 lg:flex">
        <LinksPhonePreview links={links} profile={profile} theme={theme} />
      </div>

      {/* ── Dialog: criar link ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo link</DialogTitle>
          </DialogHeader>
          <LinkForm
            defaultValues={{}}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isSubmitting={isSubmitting}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* ── Dialog: editar link ── */}
      <Dialog open={!!editingLink} onOpenChange={(o) => { if (!o) setEditingLink(null); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar link</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <LinkForm
              defaultValues={linkToDefaults(editingLink)}
              onSubmit={handleEdit}
              onCancel={() => setEditingLink(null)}
              isSubmitting={isSubmitting}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
