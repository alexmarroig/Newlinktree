import { getEthosIntegrationConfig } from "@/config/ethosIntegration";
import {
  logAccessDecision,
  logDegradedFallback,
  logEthosQueryFinished,
  logEthosQueryStarted,
} from "@/lib/helpers/access-logger";
import { randomUUID } from "crypto";

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

    const correlationId = randomUUID();
    const queryStartedAt = Date.now();
    logEthosQueryStarted({
      correlation_id: correlationId,
      user_id: params.userId,
      reason_code: "ETHOS_QUERY_STARTED",
    });

    const cacheKey = `${params.userId}:${params.pageId ?? "-"}:${params.action}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      logAccessDecision({
        action: params.action === "publish" ? "publish" : "edit",
        correlation_id: correlationId,
        user_id: params.userId,
        status: cached.allowed ? "allowed" : "denied",
        source: "cache",
        reason_code: cached.allowed ? "CACHE_ALLOWED" : "CACHE_DENIED",
        latency_ms: Date.now() - queryStartedAt,
      });
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
      const latencyMs = Date.now() - queryStartedAt;

      logEthosQueryFinished({
        correlation_id: correlationId,
        user_id: params.userId,
        reason_code: response.ok ? "ETHOS_RESPONSE_OK" : `ETHOS_HTTP_${response.status}`,
        latency_ms: latencyMs,
      });

      logAccessDecision({
        action: params.action === "publish" ? "publish" : "edit",
        correlation_id: correlationId,
        user_id: params.userId,
        status: allowed ? "allowed" : "denied",
        source: "ethos",
        reason_code: allowed ? "ETHOS_ALLOWED" : "ETHOS_DENIED",
        latency_ms: latencyMs,
      });

      this.cache.set(cacheKey, {
        allowed,
        expiresAt: now + config.accessCacheTtlSeconds * 1000,
      });

      if (!allowed) {
        throw new Error(`Acesso ao Ethos negado. Faça upgrade em ${config.upgradeUrl}.`);
      }
    } catch (error) {
      const latencyMs = Date.now() - queryStartedAt;
      if (error instanceof Error && error.name === "AbortError") {
        logDegradedFallback({
          correlation_id: correlationId,
          user_id: params.userId,
          source: "offline-fallback",
          reason_code: "ETHOS_TIMEOUT",
          latency_ms: latencyMs,
        });
        throw new Error("Ethos indisponível: tempo limite excedido ao validar acesso.");
      }

      logDegradedFallback({
        correlation_id: correlationId,
        user_id: params.userId,
        source: "offline-fallback",
        reason_code: "ETHOS_UNAVAILABLE",
        latency_ms: latencyMs,
      });
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
