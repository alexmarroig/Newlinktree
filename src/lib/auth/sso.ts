import { createPublicKey, createVerify } from "node:crypto";

import { type SsoSessionContext } from "@/lib/auth/sso-session";

type TokenPayload = Record<string, unknown> & Partial<SsoSessionContext>;

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function parseJwt(token: string): { header: Record<string, unknown>; payload: TokenPayload } {
  const [h, p] = token.split(".");
  if (!h || !p) throw new Error("invalid_token_format");
  return {
    header: JSON.parse(decodeBase64Url(h)) as Record<string, unknown>,
    payload: JSON.parse(decodeBase64Url(p)) as TokenPayload,
  };
}

async function validateWithEthos(token: string) {
  const endpoint = process.env.ETHOS_SSO_VALIDATE_ENDPOINT;
  if (!endpoint) return null;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { valid?: boolean; payload?: TokenPayload };
  if (!data.valid || !data.payload) return null;
  return data.payload;
}

function validateWithPublicKey(token: string) {
  const publicKeyPem = process.env.SSO_JWT_PUBLIC_KEY;
  if (!publicKeyPem) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

  const parsed = parseJwt(token);
  if (parsed.header.alg !== "RS256") return null;

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const isValid = verifier.verify(
    createPublicKey(publicKeyPem),
    Buffer.from(encodedSignature.replace(/-/g, "+").replace(/_/g, "/"), "base64"),
  );

  return isValid ? parsed.payload : null;
}

export async function validateSsoToken(token: string) {
  const ethosPayload = await validateWithEthos(token);
  const payload = ethosPayload ?? validateWithPublicKey(token);
  if (!payload) return { valid: false as const, reason: "validation_failed" as const };

  const session: SsoSessionContext = {
    user_id: String(payload.user_id ?? ""),
    tenant_id: String(payload.tenant_id ?? ""),
    session_id: String(payload.session_id ?? ""),
    issued_at: Number(payload.issued_at ?? payload.iat ?? 0),
    exp: payload.exp ? Number(payload.exp) : undefined,
    requires_upgrade: Boolean(payload.requires_upgrade),
  };

  if (!session.user_id || !session.tenant_id || !session.session_id || !session.issued_at) {
    return { valid: false as const, reason: "missing_required_claims" as const };
  }

  if (session.exp && Date.now() >= session.exp * 1000) {
    return { valid: false as const, reason: "token_expired" as const };
  }

  return { valid: true as const, session };
}


