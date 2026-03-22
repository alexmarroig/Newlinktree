/**
 * Proxy do PostHog — evita bloqueio por ad blockers.
 * Redireciona requisições de /api/ingest para o PostHog real.
 */

const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const targetUrl = `${POSTHOG_HOST}${url.pathname.replace("/api/ingest", "")}${url.search}`;

  const body = await request.text();

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type":
        request.headers.get("Content-Type") ?? "application/json",
    },
    body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetUrl = `${POSTHOG_HOST}${url.pathname.replace("/api/ingest", "")}${url.search}`;

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
