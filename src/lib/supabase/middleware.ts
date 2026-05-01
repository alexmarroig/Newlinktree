import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { parseSsoSession, SSO_COOKIE_NAME } from "@/lib/auth/sso-session";

function buildSsoRedirect(request: NextRequest, reason: "invalid" | "expired" | "upgrade") {
  if (reason === "upgrade") {
    return NextResponse.redirect(new URL("/auth/login?error=sso_upgrade_required", request.url));
  }

  const error = reason === "expired" ? "sso_token_expired" : "sso_invalid";
  return NextResponse.redirect(new URL(`/auth/login?error=${error}`, request.url));
}

/**
 * Atualiza a sessão do Supabase no middleware do Next.js.
 * Responsável por refresh de tokens e proteção das rotas /admin.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Parameters<typeof supabaseResponse.cookies.set>[2];
          }>,
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Importante: não adicione lógica entre createServerClient e getUser().
  // Isso pode causar bugs difíceis de detectar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname.startsWith("/auth/login");

  const ssoSession = parseSsoSession(request.cookies.get(SSO_COOKIE_NAME)?.value);
  if (ssoSession) {
    if (ssoSession.requires_upgrade) {
      return buildSsoRedirect(request, "upgrade");
    }

    const isExpired = ssoSession.exp ? Date.now() >= ssoSession.exp * 1000 : false;
    if (isExpired) {
      return buildSsoRedirect(request, "expired");
    }

    const isWriteRequest = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    if (isWriteRequest && (!ssoSession.user_id || !ssoSession.tenant_id || !ssoSession.session_id)) {
      return buildSsoRedirect(request, "invalid");
    }
  }

  // Protege rotas admin
  if (isAdminRoute && !user && !ssoSession) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redireciona usuário já autenticado que tenta acessar login
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}
