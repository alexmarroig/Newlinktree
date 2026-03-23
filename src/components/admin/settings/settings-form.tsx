"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Image from "next/image";

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
import { uploadAvatar } from "@/server/actions/avatar";
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url ?? null,
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      linkedinUrl: profile.linkedin_url ?? "",
      youtubeUrl: profile.youtube_url ?? "",
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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append("file", file);

    const result = await uploadAvatar(profile.id, fd);
    setUploadingAvatar(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao enviar foto");
      setAvatarPreview(profile.avatar_url ?? null);
      return;
    }

    toast.success("Foto de perfil atualizada!");
  }

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]!.toUpperCase())
    .join("");

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
          {/* Foto de perfil */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">Foto de perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-border">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-200">
                      <span className="text-xl font-semibold text-stone-500">
                        {initials}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarPreview ? "Trocar foto" : "Adicionar foto"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    JPG, PNG, WebP ou AVIF · máx 5 MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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

              {/* Redes sociais */}
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
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://linkedin.com/in/seuperfil"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="youtubeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/@seucanal"
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
