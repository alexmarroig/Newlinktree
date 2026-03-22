"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/server/actions/settings";
import { profileSchema, settingsSchema } from "@/lib/validations";
import type { Profile, Settings } from "@/types";
import { z } from "zod";

const combinedSchema = profileSchema.merge(settingsSchema);
type CombinedSchema = z.infer<typeof combinedSchema>;

interface SettingsFormProps {
  profile: Profile;
  settings?: Settings;
}

export function SettingsForm({ profile, settings }: SettingsFormProps) {
  const form = useForm<CombinedSchema>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      name: profile.name,
      professionalTitle: profile.professional_title,
      crp: profile.crp ?? "",
      bio: profile.bio ?? "",
      subtitle: profile.subtitle ?? "",
      whatsappNumber: profile.whatsapp_number ?? "",
      instagramUrl: profile.instagram_url ?? "",
      websiteUrl: profile.website_url ?? "",
      consentText:
        settings?.consent_text ??
        "Concordo com a política de privacidade e autorizo o contato.",
      timezone: settings?.timezone ?? "America/Sao_Paulo",
      locale: settings?.locale ?? "pt-BR",
      siteUrl: settings?.site_url ?? "",
      contactEmail: settings?.contact_email ?? "",
      whatsappDefaultMessage: settings?.whatsapp_default_message ?? "",
      privacyPolicy: settings?.privacy_policy ?? "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: CombinedSchema) {
    const result = await saveSettings({ profileId: profile.id, ...values });

    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar");
      return;
    }

    toast.success("Configurações salvas com sucesso!");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie seu perfil e configurações do sistema
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Perfil */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">Perfil profissional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="professionalTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título profissional *</FormLabel>
                      <FormControl>
                        <Input placeholder="Psicóloga Clínica" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="crp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRP</FormLabel>
                      <FormControl>
                        <Input placeholder="CRP 06/123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp (apenas números)</FormLabel>
                      <FormControl>
                        <Input placeholder="5511999999999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtítulo / tagline curta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Atendimentos online e presenciais · São Paulo, SP"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/seuperfil"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://seusite.com.br"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações gerais */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">
                Configurações do sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail de contato</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappDefaultMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem padrão do WhatsApp</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consentText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto de consentimento (LGPD)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="privacyPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Política de privacidade</FormLabel>
                    <FormControl>
                      <Textarea rows={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={isLoading} size="lg">
              Salvar configurações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
