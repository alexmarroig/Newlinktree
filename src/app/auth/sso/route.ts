import { NextResponse } from "next/server";

import {
  getSsoTokenFromRequest,
  serializeSsoSession,
  SSO_COOKIE_NAME,
} from "@/lib/auth/sso-session";
import { validateSsoToken } from "@/lib/auth/sso";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/admin";
  const token = getSsoTokenFromRequest(request);

  if (!token) {
    return NextResponse.redirect(`${origin}/auth/login?error=sso_token_missing`);
  }

  const validation = await validateSsoToken(token);

  if (!validation.valid) {
    const reason = validation.reason === "token_expired" ? "sso_token_expired" : "sso_invalid";
    const blockedResponse = NextResponse.redirect(`${origin}/auth/login?error=${reason}`);
    blockedResponse.cookies.delete(SSO_COOKIE_NAME);
    return blockedResponse;
  }

  if (validation.session.requires_upgrade) {
    const upgradeResponse = NextResponse.redirect(`${origin}/auth/login?error=sso_upgrade_required`);
    upgradeResponse.cookies.set(SSO_COOKIE_NAME, serializeSsoSession(validation.session), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return upgradeResponse;
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  response.cookies.set(SSO_COOKIE_NAME, serializeSsoSession(validation.session), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
