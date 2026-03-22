"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Eye, Laptop, Monitor, Save, Smartphone, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveEditorDraft, publishPage } from "@/server/actions/editor";
import type { Block, Link } from "@/types";
import { BLOCK_TYPES } from "@/lib/constants";

import { useEditorStore } from "../store/editor-store";
import { EditorBlockItem } from "./editor-block-item";
import { EditorPropertiesPanel } from "./editor-properties-panel";

interface EditorLayoutProps {
  page: {
    id: string;
    slug: string;
    status: string;
    title: string;
  };
  initialBlocks: Block[];
  initialLinks: Link[];
}

export function EditorLayout({
  page,
  initialBlocks,
}: EditorLayoutProps) {
  const {
    blocks,
    selectedBlockId,
    isDirty,
    isSaving,
    isPublishing,
    previewMode,
    viewMode,
    init,
    reorderBlocks,
    selectBlock,
    setPreviewMode,
    setViewMode,
    setSaving,
    setPublishing,
    markClean,
  } = useEditorStore();

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    init(page.id, initialBlocks);
  }, [page.id, initialBlocks, init]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  async function handleSaveDraft() {
    setSaving(true);
    try {
      const result = await saveEditorDraft(page.id, blocks);
      if (result.success) {
        markClean();
        toast.success("Rascunho salvo!");
      } else {
        toast.error(result.error ?? "Erro ao salvar");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      // Salva primeiro
      await saveEditorDraft(page.id, blocks);
      const result = await publishPage(page.id);
      if (result.success) {
        markClean();
        toast.success("Página publicada com sucesso!");
      } else {
        toast.error(result.error ?? "Erro ao publicar");
      }
    } finally {
      setPublishing(false);
    }
  }

  const activeBlock = activeId
    ? blocks.find((b) => b.id === activeId)
    : null;

  return (
    <div className="-mx-6 -my-6 flex h-[calc(100dvh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{page.title}</p>
            <div className="flex items-center gap-2">
              <Badge variant={page.status === "published" ? "success" : "muted"} className="text-[10px]">
                {page.status === "published" ? "Publicado" : "Rascunho"}
              </Badge>
              {isDirty && (
                <span className="text-[10px] text-amber-600">
                  Alterações não salvas
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview mode toggle */}
          <div className="hidden sm:flex">
            <Tabs
              value={previewMode}
              onValueChange={(v) => setPreviewMode(v as "desktop" | "mobile")}
            >
              <TabsList className="h-8">
                <TabsTrigger value="desktop" className="gap-1.5 text-xs px-2.5">
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="mobile" className="gap-1.5 text-xs px-2.5">
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* View mode */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "editor" ? "preview" : "editor")
            }
          >
            {viewMode === "editor" ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                Preview
              </>
            ) : (
              <>
                <Laptop className="h-3.5 w-3.5" />
                Editor
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            loading={isSaving}
            disabled={!isDirty}
          >
            <Save className="h-3.5 w-3.5" />
            Salvar
          </Button>

          <Button
            size="sm"
            onClick={handlePublish}
            loading={isPublishing}
          >
            <Upload className="h-3.5 w-3.5" />
            Publicar
          </Button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas central */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div
            className={`mx-auto transition-all duration-300 ${
              previewMode === "mobile" ? "max-w-sm" : "max-w-xl"
            }`}
          >
            <div className="rounded-2xl bg-card shadow-soft-md">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => setActiveId(e.active.id as string)}
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (over && active.id !== over.id) {
                    reorderBlocks(
                      active.id as string,
                      over.id as string,
                    );
                  }
                  setActiveId(null);
                }}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y divide-border">
                    {blocks.map((block) => (
                      <EditorBlockItem
                        key={block.id}
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onClick={() =>
                          selectBlock(
                            selectedBlockId === block.id ? null : block.id,
                          )
                        }
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeBlock && (
                    <div className="dnd-drag-overlay rounded-xl bg-card px-4 py-3 shadow-soft-xl">
                      <p className="text-sm font-medium text-foreground">
                        {BLOCK_TYPES.find((t) => t.type === activeBlock.type)
                          ?.label ?? activeBlock.type}
                      </p>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>

        {/* Painel de propriedades */}
        {selectedBlockId && (
          <EditorPropertiesPanel
            block={blocks.find((b) => b.id === selectedBlockId) ?? null}
            onClose={() => selectBlock(null)}
          />
        )}
      </div>
    </div>
  );
}
