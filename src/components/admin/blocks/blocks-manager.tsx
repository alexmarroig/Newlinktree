"use client";

import {
  BadgeCheck,
  Blocks,
  BookOpen,
  Compass,
  Heart,
  HelpCircle,
  MousePointerClick,
  PanelBottom,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BLOCK_TYPES } from "@/lib/constants";
import type { Block } from "@/types";
import { toggleBlockEnabled } from "@/server/actions/blocks";

const BLOCK_ICONS: Record<string, React.ElementType> = {
  hero: Sparkles,
  credentials: BadgeCheck,
  start_here: Compass,
  ctas: MousePointerClick,
  about: Heart,
  resources: BookOpen,
  faq: HelpCircle,
  footer: PanelBottom,
};

interface BlocksManagerProps {
  pageId: string;
  pageSlug: string;
  blocks: Block[];
}

export function BlocksManager({
  pageId,
  pageSlug,
  blocks: initialBlocks,
}: BlocksManagerProps) {
  const [blocks, setBlocks] = useState(initialBlocks);

  async function handleToggle(blockId: string) {
    const result = await toggleBlockEnabled(blockId);
    if (result.success) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId ? { ...b, is_enabled: !b.is_enabled } : b,
        ),
      );
    } else {
      toast.error("Erro ao atualizar bloco");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Blocos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ative/desative seções da página. Use o{" "}
            <Link href="/admin/editor" className="text-primary underline">
              Editor Visual
            </Link>{" "}
            para reordenar e editar conteúdo.
          </p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base">
            Seções da página{" "}
            <span className="font-mono text-sm text-muted-foreground">
              /{pageSlug}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent padding="none">
          <ul className="divide-y divide-border">
            {blocks.map((block) => {
              const blockDef = BLOCK_TYPES.find((t) => t.type === block.type);
              const Icon = BLOCK_ICONS[block.type] ?? Blocks;

              return (
                <li
                  key={block.id}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/20 ${!block.is_enabled ? "opacity-60" : ""}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${block.is_enabled ? "bg-primary/10" : "bg-muted"}`}
                  >
                    <Icon
                      className={`h-4 w-4 ${block.is_enabled ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {blockDef?.label ?? block.type}
                      </p>
                      <Badge
                        variant={block.is_enabled ? "success" : "muted"}
                        className="text-[10px]"
                      >
                        {block.is_enabled ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {block.title && (
                      <p className="text-xs text-muted-foreground">
                        {block.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70">
                      Posição {block.position + 1}
                    </p>
                  </div>

                  <Switch
                    checked={block.is_enabled}
                    onCheckedChange={() => handleToggle(block.id)}
                    aria-label={`${block.is_enabled ? "Desativar" : "Ativar"} bloco ${blockDef?.label}`}
                  />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/editor">Ir para o Editor Visual</Link>
        </Button>
      </div>
    </div>
  );
}
