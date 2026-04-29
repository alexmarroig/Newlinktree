import type { AccessResolution, AccessTier } from "./types";

type CacheEntry = { expiresAt: number; value: AccessResolution };

export class EthosAccessClient {
  private cache = new Map<string, CacheEntry>();

  constructor(
    private readonly opts: { baseUrl: string; timeoutMs?: number; ttlMs?: number; maxRetries?: number },
  ) {}

  async getAccess(profileId: string): Promise<AccessResolution> {
    const now = Date.now();
    const found = this.cache.get(profileId);
    if (found && found.expiresAt > now) return { ...found.value, source: "cache" };

    const value = await this.fetchWithRetry(profileId);
    this.cache.set(profileId, { value, expiresAt: now + (this.opts.ttlMs ?? 60_000) });
    return value;
  }

  private async fetchWithRetry(profileId: string): Promise<AccessResolution> {
    const attempts = (this.opts.maxRetries ?? 1) + 1;
    for (let i = 0; i < attempts; i++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs ?? 2000);
      try {
        const res = await fetch(`${this.opts.baseUrl}/access/${profileId}`, { signal: controller.signal });
        clearTimeout(timer);
        return this.parseResponse(res.status, res.ok ? await res.json() : null);
      } catch (error) {
        clearTimeout(timer);
        if (i === attempts - 1) {
          return { tier: "none", source: "offline-fallback" };
        }
      }
    }
    return { tier: "none", source: "offline-fallback" };
  }

  parseResponse(status: number, body: unknown): AccessResolution {
    if (status === 200 && body && typeof body === "object") {
      const obj = body as { tier?: AccessTier; trialActive?: boolean };
      return { tier: obj.tier ?? "none", trialActive: obj.trialActive, source: "ethos" };
    }

    if (status === 401 || status === 403) return { tier: "none", source: "ethos" };
    if (status === 429 || status === 503) return { tier: "none", source: "offline-fallback" };
    return { tier: "none", source: "offline-fallback" };
  }
}
