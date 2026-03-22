import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Block } from "@/types";

interface EditorStore {
  // Estado
  pageId: string | null;
  blocks: Block[];
  selectedBlockId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  previewMode: "desktop" | "mobile";
  viewMode: "editor" | "preview";

  // Ações
  init: (pageId: string, blocks: Block[]) => void;
  setBlocks: (blocks: Block[]) => void;
  selectBlock: (blockId: string | null) => void;
  toggleBlock: (blockId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  updateBlockContent: (
    blockId: string,
    contentJson: Record<string, unknown>,
  ) => void;
  updateBlockMeta: (
    blockId: string,
    meta: { title?: string | null; subtitle?: string | null },
  ) => void;
  setPreviewMode: (mode: "desktop" | "mobile") => void;
  setViewMode: (mode: "editor" | "preview") => void;
  setSaving: (value: boolean) => void;
  setPublishing: (value: boolean) => void;
  markClean: () => void;
  reset: () => void;
}

const initialState = {
  pageId: null,
  blocks: [],
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,
  isPublishing: false,
  previewMode: "desktop" as const,
  viewMode: "editor" as const,
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      init(pageId, blocks) {
        set({ pageId, blocks, isDirty: false });
      },

      setBlocks(blocks) {
        set({ blocks, isDirty: true });
      },

      selectBlock(blockId) {
        set({ selectedBlockId: blockId });
      },

      toggleBlock(blockId) {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === blockId ? { ...b, is_enabled: !b.is_enabled } : b,
          ),
          isDirty: true,
        }));
      },

      reorderBlocks(activeId, overId) {
        const { blocks } = get();
        const oldIndex = blocks.findIndex((b) => b.id === activeId);
        const newIndex = blocks.findIndex((b) => b.id === overId);

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = [...blocks];
        const [moved] = reordered.splice(oldIndex, 1);
        if (moved) {
          reordered.splice(newIndex, 0, moved);
        }

        const withPositions = reordered.map((b, idx) => ({
          ...b,
          position: idx,
        }));

        set({ blocks: withPositions, isDirty: true });
      },

      updateBlockContent(blockId, contentJson) {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === blockId ? { ...b, content_json: contentJson } : b,
          ),
          isDirty: true,
        }));
      },

      updateBlockMeta(blockId, meta) {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === blockId ? { ...b, ...meta } : b,
          ),
          isDirty: true,
        }));
      },

      setPreviewMode(mode) {
        set({ previewMode: mode });
      },

      setViewMode(mode) {
        set({ viewMode: mode });
      },

      setSaving(value) {
        set({ isSaving: value });
      },

      setPublishing(value) {
        set({ isPublishing: value });
      },

      markClean() {
        set({ isDirty: false });
      },

      reset() {
        set(initialState);
      },
    }),
    {
      name: "therapy-editor-state",
      partialize: (state) => ({
        previewMode: state.previewMode,
        viewMode: state.viewMode,
      }),
    },
  ),
);
