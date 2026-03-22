"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveSeo } from "@/server/actions/seo";
import { seoSchema, type SeoSchema } from "@/lib/validations";
import type { Page } from "@/types";

interface SeoFormProps {
  page: Page;
}

export function SeoForm({ page }: SeoFormProps) {
  const form = useForm<SeoSchema>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      seoTitle: page.seo_title ?? "",
      seoDescription: page.seo_description ?? "",
      ogImageUrl: page.og_image_url ?? "",
      canonicalUrl: page.canonical_url ?? "",
      robots: page.robots ?? "index,follow",
    },
  });

  const seoTitle = form.watch("seoTitle");
  const seoDescription = form.watch("seoDescription");

  async function onSubmit(values: SeoSchema) {
    const result = await saveSeo(page.id, values);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar");
      return;
    }
    toast.success("SEO salvo com sucesso!");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">SEO & Open Graph</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure como sua página aparece nos buscadores e redes sociais
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">Meta tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título SEO</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ana Silva | Psicóloga Clínica em São Paulo"
                        maxLength={70}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {seoTitle?.length ?? 0}/70 caracteres. Ideal: 50-60.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Psicóloga especializada em ansiedade. Atendimentos online e presenciais em São Paulo."
                        maxLength={160}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {seoDescription?.length ?? 0}/160 caracteres. Ideal: 120-160.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ogImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem Open Graph (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tamanho recomendado: 1200×630px. Aparece ao compartilhar no WhatsApp, Instagram, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="robots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Robots</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="index,follow"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ex: index,follow | noindex,nofollow
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview Google */}
          {(seoTitle || seoDescription) && (
            <Card variant="flat" className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-sm">Preview Google</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-base font-medium text-blue-700 hover:underline">
                    {seoTitle || "Título da página"}
                  </p>
                  <p className="text-xs text-green-700">
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : "https://seusite.com.br"}
                    /{page.slug}
                  </p>
                  <p className="text-sm text-foreground/80">
                    {seoDescription || "Descrição da página..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              size="lg"
            >
              Salvar SEO
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
