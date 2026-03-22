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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveTheme } from "@/server/actions/theme";
import { themeSchema, type ThemeSchema } from "@/lib/validations";
import { DEFAULT_THEME } from "@/lib/constants";
import type { Theme } from "@/types";

interface ThemeEditorProps {
  profileId: string;
  theme?: Theme;
}

export function ThemeEditor({ profileId, theme }: ThemeEditorProps) {
  const form = useForm<ThemeSchema>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      primaryColor: theme?.primary_color ?? DEFAULT_THEME.primary_color,
      secondaryColor: theme?.secondary_color ?? DEFAULT_THEME.secondary_color,
      backgroundColor: theme?.background_color ?? DEFAULT_THEME.background_color,
      textColor: theme?.text_color ?? DEFAULT_THEME.text_color,
      accentColor: theme?.accent_color ?? DEFAULT_THEME.accent_color,
      fontHeading: theme?.font_heading ?? DEFAULT_THEME.font_heading,
      fontBody: theme?.font_body ?? DEFAULT_THEME.font_body,
      borderRadius: (theme?.border_radius ?? DEFAULT_THEME.border_radius) as "sm" | "md" | "lg" | "xl",
      shadowIntensity: (theme?.shadow_intensity ?? DEFAULT_THEME.shadow_intensity) as "none" | "soft" | "medium" | "strong",
      layoutWidth: (theme?.layout_width ?? DEFAULT_THEME.layout_width) as "narrow" | "medium" | "wide",
      cardStyle: (theme?.card_style ?? DEFAULT_THEME.card_style) as "flat" | "elevated" | "bordered",
    },
  });

  async function onSubmit(values: ThemeSchema) {
    const result = await saveTheme(profileId, values);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar tema");
      return;
    }
    toast.success("Tema salvo com sucesso! A página pública será atualizada.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Tema & Branding</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize as cores, tipografia e estilo do seu hub
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Cores */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">Paleta de cores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "primaryColor" as const,
                    label: "Cor primária",
                    description: "Botões principais, destaques",
                  },
                  {
                    name: "secondaryColor" as const,
                    label: "Cor secundária",
                    description: "Badges, elementos de apoio",
                  },
                  {
                    name: "backgroundColor" as const,
                    label: "Fundo",
                    description: "Cor de fundo da página",
                  },
                  {
                    name: "textColor" as const,
                    label: "Texto",
                    description: "Cor principal do texto",
                  },
                  {
                    name: "accentColor" as const,
                    label: "Destaque",
                    description: "Cards, badges suaves",
                  },
                ].map((colorField) => (
                  <FormField
                    key={colorField.name}
                    control={form.control}
                    name={colorField.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{colorField.label}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="28 18% 42%"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {colorField.description} — formato HSL: H S% L%
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tipografia */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">Tipografia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fontHeading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte de títulos</FormLabel>
                      <FormControl>
                        <Input placeholder="Playfair Display" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fontBody"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte de corpo</FormLabel>
                      <FormControl>
                        <Input placeholder="Inter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Estilo visual */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">Estilo visual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="borderRadius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantos</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sm">Suaves</SelectItem>
                          <SelectItem value="md">Médios</SelectItem>
                          <SelectItem value="lg">Arredondados</SelectItem>
                          <SelectItem value="xl">Muito arredondados</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shadowIntensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sombras</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sem sombra</SelectItem>
                          <SelectItem value="soft">Suave</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="strong">Forte</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="layoutWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largura do layout</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="narrow">Estreito (680px)</SelectItem>
                          <SelectItem value="medium">Médio (800px)</SelectItem>
                          <SelectItem value="wide">Largo (960px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estilo dos cards</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="elevated">Elevado</SelectItem>
                          <SelectItem value="bordered">Bordado</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              size="lg"
            >
              Salvar tema
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
