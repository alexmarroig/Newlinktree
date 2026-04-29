export type AccessMode = "full" | "read_only" | "none";

export type AccessReason =
  | "ok"
  | "invalid_session"
  | "no_access"
  | "degraded"
  | "upstream_error";

export interface BiohubAccessResult {
  hasAccess: boolean;
  mode: AccessMode;
  reason: AccessReason;
  source: "cache" | "live";
  statusCode?: number;
}

interface EthosAccessResponse {
  has_access?: boolean;
  access?: boolean;
  allowed?: boolean;
}

interface EthosAccessClientOptions {
  baseUrl?: string;
  token?: string;
  requestTimeoutMs?: number;
  cacheTtlSeconds?: number;
  maxRetries?: number;
  retryBaseDelayMs?: number;
}

interface AccessRequestInput {
  user_id: string;
  tenant_id?: string;
}

interface CacheEntry {
  expiresAt: number;
  value: Omit<BiohubAccessResult, "source">;
}

const DEFAULT_TIMEOUT_MS = 2_000;
const DEFAULT_CACHE_TTL_SECONDS = 30;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_BASE_DELAY_MS = 150;

export class EthosAccessClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly requestTimeoutMs: number;
  private readonly cacheTtlMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(options: EthosAccessClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? process.env.ETHOS_API_BASE_URL ?? "").replace(/\/$/, "");
    this.token = options.token ?? process.env.ETHOS_API_TOKEN ?? "";
    this.requestTimeoutMs = Number(options.requestTimeoutMs ?? process.env.ETHOS_REQUEST_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
    this.cacheTtlMs = Number(options.cacheTtlSeconds ?? process.env.ETHOS_ACCESS_CACHE_TTL_SECONDS ?? DEFAULT_CACHE_TTL_SECONDS) * 1000;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryBaseDelayMs = options.retryBaseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS;
  }

  async getAccess(input: AccessRequestInput): Promise<BiohubAccessResult> {
    const cacheKey = this.buildCacheKey(input);
    const cached = this.readCache(cacheKey);

    if (cached) {
      return {
        ...cached,
        source: "cache",
      };
    }

    const liveResult = await this.requestWithRetry(input);
    this.writeCache(cacheKey, liveResult);

    return {
      ...liveResult,
      source: "live",
    };
  }

  private async requestWithRetry(input: AccessRequestInput): Promise<Omit<BiohubAccessResult, "source">> {
    let attempt = 0;

    while (true) {
      const response = await this.fetchAccess(input);
      const shouldRetry = this.isTransientFailure(response);

      if (!shouldRetry || attempt >= this.maxRetries) {
        return this.normalizeResult(response);
      }

      attempt += 1;
      await this.delay(this.retryBaseDelayMs * attempt);
    }
  }

  private async fetchAccess(input: AccessRequestInput): Promise<{
    status?: number;
    timedOut?: boolean;
    body?: EthosAccessResponse;
  }> {
    if (!this.baseUrl || !this.token) {
      return { status: 503 };
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/integrations/biohub/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(input),
        signal: controller.signal,
        cache: "no-store",
      });

      let body: EthosAccessResponse | undefined;
      try {
        body = (await response.json()) as EthosAccessResponse;
      } catch {
        body = undefined;
      }

      return {
        status: response.status,
        body,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { timedOut: true };
      }

      return { status: 503 };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private normalizeResult(response: {
    status?: number;
    timedOut?: boolean;
    body?: EthosAccessResponse;
  }): Omit<BiohubAccessResult, "source"> {
    if (response.timedOut || response.status === 429 || response.status === 503) {
      return {
        hasAccess: true,
        mode: "read_only",
        reason: "degraded",
        statusCode: response.status,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        hasAccess: false,
        mode: "none",
        reason: response.status === 401 ? "invalid_session" : "no_access",
        statusCode: response.status,
      };
    }

    if (response.status && response.status >= 200 && response.status < 300) {
      const hasAccess = Boolean(response.body?.has_access ?? response.body?.access ?? response.body?.allowed);
      return {
        hasAccess,
        mode: hasAccess ? "full" : "none",
        reason: hasAccess ? "ok" : "no_access",
        statusCode: response.status,
      };
    }

    return {
      hasAccess: true,
      mode: "read_only",
      reason: "upstream_error",
      statusCode: response.status,
    };
  }

  private isTransientFailure(response: { status?: number; timedOut?: boolean }): boolean {
    return Boolean(response.timedOut || response.status === 429 || response.status === 503);
  }

  private buildCacheKey(input: AccessRequestInput): string {
    return `${input.user_id}:${input.tenant_id ?? "_"}`;
  }

  private readCache(key: string): Omit<BiohubAccessResult, "source"> | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  private writeCache(key: string, value: Omit<BiohubAccessResult, "source">): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const ethosAccessClient = new EthosAccessClient();
