"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { submitInterestForm } from "@/server/actions/form";
import { interestFormSchema, type InterestFormSchema } from "@/lib/validations";
import { trackFormSubmit } from "@/lib/analytics/events";
import type { Settings } from "@/types";

import { useFormModal } from "../hooks/use-form-modal";

interface InterestFormModalProps {
  pageId: string;
  settings: Settings;
}

export function InterestFormModal({ pageId, settings }: InterestFormModalProps) {
  const { isOpen, closeModal } = useFormModal();
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    whatsapp: string;
    message: string;
  } | null>(null);

  const form = useForm<InterestFormSchema>({
    resolver: zodResolver(interestFormSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      email: "",
      contactPreference: "whatsapp",
      preferredModality: "either",
      message: "",
      bestTime: "qualquer",
      consent: false,
      honeypot: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: InterestFormSchema) {
    // Honeypot check
    if (values.honeypot) {
      toast.error("Algo deu errado. Tente novamente.");
      return;
    }

    const result = await submitInterestForm({
      ...values,
      pageId,
      referrer:
        typeof window !== "undefined" ? document.referrer : undefined,
      utmSource:
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("utm_source") ?? undefined
          : undefined,
      utmMedium:
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("utm_medium") ?? undefined
          : undefined,
      utmCampaign:
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("utm_campaign") ?? undefined
          : undefined,
    });

    if (!result.success) {
      toast.error(result.error ?? "Erro ao enviar. Tente novamente.");
      return;
    }

    trackFormSubmit({
      hasEmail: !!values.email,
      modality: values.preferredModality,
      contactPref: values.contactPreference,
    });

    setSubmittedData({
      whatsapp: values.whatsapp,
      message: settings.whatsapp_default_message ?? "",
    });
    setSubmitted(true);
  }

  function handleClose() {
    closeModal();
    setTimeout(() => {
      if (submitted) {
        setSubmitted(false);
        form.reset();
      }
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Formulário de interesse</DialogTitle>
              <DialogDescription>
                Preencha seus dados e entrarei em contato em breve.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Honeypot oculto */}
                <input
                  type="text"
                  aria-hidden="true"
                  tabIndex={-1}
                  className="hidden"
                  {...form.register("honeypot")}
                />

                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Seu nome"
                          autoComplete="given-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* WhatsApp */}
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(11) 99999-9999"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* E-mail */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferência de contato + Modalidade */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="contactPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contato preferido</FormLabel>
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
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="either">Qualquer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredModality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidade</FormLabel>
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
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="presencial">
                              Presencial
                            </SelectItem>
                            <SelectItem value="either">Sem preferência</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Melhor horário */}
                <FormField
                  control={form.control}
                  name="bestTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Melhor horário para contato</FormLabel>
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
                          <SelectItem value="manha">Manhã</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                          <SelectItem value="noite">Noite</SelectItem>
                          <SelectItem value="qualquer">Qualquer horário</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mensagem */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem breve (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conte um pouco sobre o que te trouxe aqui..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Consentimento LGPD */}
                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border bg-muted/40 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="consent"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="consent" className="cursor-pointer text-sm font-medium">
                          Concordo com a política de privacidade
                        </FormLabel>
                        <FormDescription className="text-xs">
                          {settings.consent_text}
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isLoading}
                >
                  Enviar mensagem
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <SuccessState
            submittedData={submittedData}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessState({
  submittedData,
  onClose,
}: {
  submittedData: { whatsapp: string; message: string } | null;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle className="h-8 w-8 text-emerald-600" />
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-xl font-semibold">
          Mensagem recebida!
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Obrigada pelo seu contato. Entrarei em resposta em até{" "}
          <strong>24 horas</strong> úteis.
        </p>
      </div>

      {submittedData?.whatsapp && (
        <div className="w-full space-y-3">
          <p className="text-xs text-muted-foreground">
            Prefere falar diretamente?
          </p>
          <a
            href={`https://wa.me/${submittedData.whatsapp}?text=${encodeURIComponent(submittedData.message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button-primary"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">Enviar no WhatsApp</span>
            </div>
          </a>
        </div>
      )}

      <Button variant="ghost" onClick={onClose} className="w-full">
        Fechar
      </Button>
    </div>
  );
}
