import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie seu BioHub profissional para psicologia.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[460px] space-y-7">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <span className="font-heading text-2xl font-bold">B</span>
          </div>
          <h1 className="font-heading text-3xl font-semibold">
            Crie seu BioHub
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Comece com 7 dias para configurar sua página e ativar a assinatura.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/auth/login" className="font-medium text-primary">
            Entrar no painel
          </Link>
        </p>
      </div>
    </div>
  );
}
