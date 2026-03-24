import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Rota de callback para o fluxo PKCE do Supabase Auth.
 * Supabase redireciona aqui após confirmação de e-mail, magic link ou reset de senha.
 *
 * URL esperada: /auth/callback?code=...&next=/admin
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redireciona para o destino pretendido após login bem-sucedido
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Em caso de erro, redireciona para login com mensagem de erro
  return NextResponse.redirect(
    `${origin}/auth/login?error=auth_callback_failed`,
  );
}
