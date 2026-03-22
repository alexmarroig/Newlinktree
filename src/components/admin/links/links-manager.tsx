"use client";

import { Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toggleLink, deleteLink } from "@/server/actions/links";
import type { Link } from "@/types";

interface LinksManagerProps {
  pageId: string;
  links: Link[];
}

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

export function LinksManager({ pageId, links: initialLinks }: LinksManagerProps) {
  const [links, setLinks] = useState(initialLinks);

  async function handleToggle(linkId: string) {
    const result = await toggleLink(linkId);
    if (result.success) {
      setLinks((prev) =>
        prev.map((l) =>
          l.id === linkId ? { ...l, is_enabled: !l.is_enabled } : l,
        ),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Links & CTAs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os botões e links da sua página
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Novo link
        </Button>
      </div>

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
                Nenhum link cadastrado.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {links.map((link) => (
                <li
                  key={link.id}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30 ${!link.is_enabled ? "opacity-60" : ""}`}
                >
                  {/* Posição */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {link.position + 1}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {link.label}
                      </p>
                      <Badge variant={VARIANT_COLORS[link.variant] ?? "muted"} className="text-[10px]">
                        {link.variant}
                      </Badge>
                    </div>
                    {link.sublabel && (
                      <p className="truncate text-xs text-muted-foreground">
                        {link.sublabel}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {TYPE_LABELS[link.type] ?? link.type}
                      </Badge>
                      {link.click_count > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          {link.click_count} clique{link.click_count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex shrink-0 items-center gap-2">
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
  );
}
