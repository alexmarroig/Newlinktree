"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { APP_URL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding } from "@/server/actions/onboarding";

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome").max(100),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Use pelo menos 8 caracteres"),
  crp: z.string().max(50).optional(),
  slug: z
    .string()
    .max(48)
    .regex(/^[a-zA-Z0-9-]*$/, "Use apenas letras, números e hífen")
    .optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      crp: "",
      slug: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${APP_URL}/auth/callback?next=/admin`,
        data: {
          name: values.name,
          professional_title: "Psicóloga Clínica",
          crp: values.crp,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.session) {
      setNeedsConfirmation(true);
      toast.success("Confira seu e-mail para confirmar o cadastro.");
      return;
    }

    const result = await completeOnboarding({
      name: values.name,
      professionalTitle: "Psicóloga Clínica",
      crp: values.crp,
      slug: values.slug,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Seu BioHub foi criado.");
    router.push("/admin/billing");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <div className="space-y-3 text-center">
        <h2 className="font-heading text-xl font-semibold">Confirme seu e-mail</h2>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de confirmação. Depois de confirmar, entre no painel
          para finalizar seu BioHub.
        </p>
        <Button asChild className="w-full">
          <a href="/auth/login">Ir para login</a>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome profissional</FormLabel>
              <FormControl>
                <Input placeholder="Dra. Ana Silva" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="crp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CRP</FormLabel>
              <FormControl>
                <Input placeholder="CRP 00/00000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço desejado</FormLabel>
              <FormControl>
                <Input placeholder="ana-silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="voce@email.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Criar BioHub
        </Button>
      </form>
    </Form>
  );
}
