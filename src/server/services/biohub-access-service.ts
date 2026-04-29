import { getEthosIntegrationConfig } from "@/config/ethosIntegration";

type AccessParams = {
  userId: string;
  pageId?: string;
  action: string;
};

type CacheEntry = { expiresAt: number; allowed: boolean };

export class BiohubAccessService {
  private static cache = new Map<string, CacheEntry>();

  static async assertAccess(params: AccessParams): Promise<void> {
    const config = getEthosIntegrationConfig();
    if (!config.enabled) return;

    const cacheKey = `${params.userId}:${params.pageId ?? "-"}:${params.action}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      if (!cached.allowed) throw new Error(`Acesso ao Ethos negado. Faça upgrade em ${config.upgradeUrl}.`);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    try {
      const response = await fetch(`${config.apiBaseUrl}/biohub/access`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => ({}))) as { allowed?: boolean };
      const allowed = response.ok && payload.allowed === true;

      this.cache.set(cacheKey, {
        allowed,
        expiresAt: now + config.accessCacheTtlSeconds * 1000,
      });

      if (!allowed) {
        throw new Error(`Acesso ao Ethos negado. Faça upgrade em ${config.upgradeUrl}.`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Ethos indisponível: tempo limite excedido ao validar acesso.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
