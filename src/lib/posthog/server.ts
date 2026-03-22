import { PostHog } from "posthog-node";

let client: PostHog | null = null;

/**
 * Cliente PostHog para server-side.
 * Singleton para reutilizar a mesma instância.
 */
export function getPostHogServer(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;

  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0, // Flush imediato em serverless
    });
  }

  return client;
}

/**
 * Captura evento no servidor e faz flush imediato.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, string | number | boolean | null>,
): Promise<void> {
  const ph = getPostHogServer();
  if (!ph) return;

  ph.capture({
    distinctId,
    event,
    properties,
  });

  await ph.flushAsync();
}
