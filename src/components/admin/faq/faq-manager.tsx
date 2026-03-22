"use client";

import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  toggleFaqItem,
  reorderFaqItems,
} from "@/server/actions/faq";
import { faqItemSchema, type FaqItemSchema } from "@/lib/validations";
import type { FaqItem } from "@/types";

interface FaqManagerProps {
  pageId: string;
  items: FaqItem[];
}

export function FaqManager({ pageId, items: initialItems }: FaqManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FaqItemSchema>({
    resolver: zodResolver(faqItemSchema),
    defaultValues: {
      question: "",
      answer: "",
      isEnabled: true,
    },
  });

  function openCreateDialog() {
    setEditingItem(null);
    form.reset({ question: "", answer: "", isEnabled: true });
    setDialogOpen(true);
  }

  function openEditDialog(item: FaqItem) {
    setEditingItem(item);
    form.reset({
      question: item.question,
      answer: item.answer,
      isEnabled: item.is_enabled,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(data: FaqItemSchema) {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const result = await updateFaqItem(editingItem.id, pageId, data);
        if (result.success) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === editingItem.id
                ? { ...i, question: data.question, answer: data.answer, is_enabled: data.isEnabled }
                : i,
            ),
          );
          toast.success("Pergunta atualizada");
          setDialogOpen(false);
        } else {
          toast.error(result.error ?? "Erro ao atualizar");
        }
      } else {
        const result = await createFaqItem(pageId, data);
        if (result.success) {
          setItems((prev) => [...prev, result.data]);
          toast.success("Pergunta criada");
          setDialogOpen(false);
        } else {
          toast.error(result.error ?? "Erro ao criar");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(itemId: string) {
    const result = await toggleFaqItem(itemId, pageId);
    if (result.success) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, is_enabled: !i.is_enabled } : i,
        ),
      );
    } else {
      toast.error("Erro ao atualizar");
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Deletar esta pergunta?")) return;
    const result = await deleteFaqItem(itemId, pageId);
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success("Pergunta deletada");
    } else {
      toast.error("Erro ao deletar");
    }
  }

  async function moveItem(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap
    const temp = newItems[index]!;
    newItems[index] = newItems[targetIndex]!;
    newItems[targetIndex] = temp;

    // Update positions locally
    const withPositions = newItems.map((item, i) => ({ ...item, position: i }));
    setItems(withPositions);

    // Persist new order
    const result = await reorderFaqItems(
      pageId,
      withPositions.map((i) => i.id),
    );
    if (!result.success) {
      toast.error("Erro ao reordenar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Perguntas Frequentes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie o FAQ da sua página pública
          </p>
        </div>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Nova pergunta
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-base">
            {items.length} pergunta{items.length !== 1 ? "s" : ""} cadastrada{items.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent padding="none">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma pergunta cadastrada. Clique em &ldquo;Nova pergunta&rdquo; para adicionar.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((item, index) => (
                  <li
                    key={item.id}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/20 ${!item.is_enabled ? "opacity-60" : ""}`}
                  >
                    {/* Reorder buttons */}
                    <div className="flex shrink-0 flex-col gap-0.5 pt-0.5">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Mover para cima"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === items.length - 1}
                        className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Mover para baixo"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {item.question}
                        </p>
                        <Badge
                          variant={item.is_enabled ? "success" : "muted"}
                          className="shrink-0 text-[10px]"
                        >
                          {item.is_enabled ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Switch
                        checked={item.is_enabled}
                        onCheckedChange={() => handleToggle(item.id)}
                        aria-label={item.is_enabled ? "Desativar" : "Ativar"}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(item)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(item.id)}
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

      {/* ---- Dialog: criar / editar pergunta ---- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar pergunta" : "Nova pergunta"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="question">Pergunta *</Label>
              <Input
                id="question"
                placeholder="Ex: Como é a primeira sessão?"
                {...form.register("question")}
              />
              {form.formState.errors.question && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.question.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="answer">Resposta *</Label>
              <Textarea
                id="answer"
                placeholder="Escreva a resposta completa..."
                rows={5}
                {...form.register("answer")}
              />
              {form.formState.errors.answer && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.answer.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
              <Label className="font-normal">Visível na página pública</Label>
              <Switch
                checked={form.watch("isEnabled")}
                onCheckedChange={(v) => form.setValue("isEnabled", v)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? editingItem
                    ? "Salvando..."
                    : "Criando..."
                  : editingItem
                    ? "Salvar alterações"
                    : "Criar pergunta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
