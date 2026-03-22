import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso ao painel administrativo",
  robots: "noindex,nofollow",
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectPath } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-warm px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8 animate-in-up">
        {/* Logo / Marca */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <span className="font-heading text-2xl font-bold text-primary">
              T
            </span>
          </div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Painel Administrativo
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Therapy Bio Hub
          </p>
        </div>

        {/* Formulário */}
        <div className="card-elevated rounded-3xl p-8">
          <LoginForm redirectPath={redirectPath} />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Acesso restrito a usuários autorizados.
        </p>
      </div>
    </div>
  );
}
