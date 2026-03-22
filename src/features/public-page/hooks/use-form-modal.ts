"use client";

import { create } from "zustand";

interface FormModalStore {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

/**
 * Store global para controlar o modal do formulário de interesse.
 * Permite abrir o modal de qualquer CTA da página.
 */
export const useFormModal = create<FormModalStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
