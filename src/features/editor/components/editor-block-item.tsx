"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BadgeCheck,
  Blocks,
  BookOpen,
  Compass,
  GripVertical,
  Heart,
  HelpCircle,
  MousePointerClick,
  PanelBottom,
  Settings2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { cn } from "@/lib/helpers";
import type { Block } from "@/types";
import { BLOCK_TYPES } from "@/lib/constants";

import { useEditorStore } from "../store/editor-store";

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

interface EditorBlockItemProps {
  block: Block;
  isSelected: boolean;
  onClick: () => void;
}

export function EditorBlockItem({
  block,
  isSelected,
  onClick,
}: EditorBlockItemProps) {
  const { toggleBlock } = useEditorStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockDef = BLOCK_TYPES.find((t) => t.type === block.type);
  const Icon = BLOCK_ICONS[block.type] ?? Blocks;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3.5 transition-all",
        isSelected && "bg-primary/5",
        isDragging && "opacity-50",
        !block.is_enabled && "opacity-50",
      )}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Arrastar bloco"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Ícone */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Info */}
      <button
        className="min-w-0 flex-1 text-left"
        onClick={onClick}
      >
        <p className="text-sm font-medium text-foreground">
          {blockDef?.label ?? block.type}
        </p>
        {block.title && (
          <p className="truncate text-xs text-muted-foreground">
            {block.title}
          </p>
        )}
      </button>

      {/* Ações */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => toggleBlock(block.id)}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label={block.is_enabled ? "Desativar bloco" : "Ativar bloco"}
        >
          {block.is_enabled ? (
            <ToggleRight className="h-4 w-4 text-primary" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
        </button>

        <button
          onClick={onClick}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label="Editar bloco"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      {/* Indicador de seleção */}
      {isSelected && (
        <div className="absolute left-0 top-0 h-full w-0.5 rounded-r bg-primary" />
      )}
    </div>
  );
}
