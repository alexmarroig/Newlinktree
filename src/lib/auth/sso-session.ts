export type SsoSessionContext = {
  user_id: string;
  tenant_id: string;
  session_id: string;
  issued_at: number;
  exp?: number;
  requires_upgrade?: boolean;
};

export const SSO_COOKIE_NAME = "biohub_sso_ctx";

export function serializeSsoSession(session: SsoSessionContext) {
  const persistedSession = {
    user_id: session.user_id,
    tenant_id: session.tenant_id,
    session_id: session.session_id,
    issued_at: session.issued_at,
    exp: session.exp,
    requires_upgrade: session.requires_upgrade,
  } satisfies SsoSessionContext;

  return Buffer.from(JSON.stringify(persistedSession)).toString("base64url");
}

export function parseSsoSession(serialized?: string | null) {
  if (!serialized) return null;
  try {
    return JSON.parse(Buffer.from(serialized, "base64url").toString("utf8")) as SsoSessionContext;
  } catch {
    return null;
  }
}

export function getSsoTokenFromRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get("sso_token");
  if (queryToken) return queryToken;

  const headerCandidates = ["x-sso-token", "authorization"];
  for (const headerName of headerCandidates) {
    const headerValue = request.headers.get(headerName);
    if (!headerValue) continue;
    if (headerName === "authorization") {
      const [, bearerToken] = headerValue.split(" ");
      if (bearerToken) return bearerToken;
      continue;
    }
    return headerValue;
  }

  return null;
}
