import { featureFlags } from "@/config/featureFlags";

const DEFAULT_ETHOS_ACCESS_CACHE_TTL_SECONDS = 60;
const DEFAULT_ETHOS_REQUEST_TIMEOUT_MS = 3000;
const DEFAULT_ETHOS_UPGRADE_URL = "https://ethos.biohub.app/upgrade";

type EthosIntegrationConfig = {
  enabled: boolean;
  apiBaseUrl: string;
  apiToken: string;
  upgradeUrl: string;
  accessCacheTtlSeconds: number;
  requestTimeoutMs: number;
};

function parsePositiveInt(
  value: string | undefined,
  defaultValue: number,
  key: string,
): number {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Configuração inválida: ${key} deve ser um inteiro positivo.`);
  }
  return parsed;
}

function normalizeUrl(value: string | undefined, key: string): string {
  if (!value) throw new Error(`Configuração ausente: ${key}.`);
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Configuração inválida: ${key} deve ser uma URL válida.`);
  }
}

export function getEthosIntegrationConfig(): EthosIntegrationConfig {
  const enabled = featureFlags.ethosIntegrationEnabled;
  const upgradeUrl = process.env.ETHOS_UPGRADE_URL?.trim() || DEFAULT_ETHOS_UPGRADE_URL;

  if (!enabled) {
    return {
      enabled: false,
      apiBaseUrl: "",
      apiToken: "",
      upgradeUrl,
      accessCacheTtlSeconds: DEFAULT_ETHOS_ACCESS_CACHE_TTL_SECONDS,
      requestTimeoutMs: DEFAULT_ETHOS_REQUEST_TIMEOUT_MS,
    };
  }

  const apiBaseUrl = normalizeUrl(process.env.ETHOS_API_BASE_URL, "ETHOS_API_BASE_URL");
  const apiToken = process.env.ETHOS_API_TOKEN?.trim();
  if (!apiToken) throw new Error("Configuração ausente: ETHOS_API_TOKEN.");

  return {
    enabled: true,
    apiBaseUrl,
    apiToken,
    upgradeUrl,
    accessCacheTtlSeconds: parsePositiveInt(
      process.env.ETHOS_ACCESS_CACHE_TTL_SECONDS,
      DEFAULT_ETHOS_ACCESS_CACHE_TTL_SECONDS,
      "ETHOS_ACCESS_CACHE_TTL_SECONDS",
    ),
    requestTimeoutMs: parsePositiveInt(
      process.env.ETHOS_REQUEST_TIMEOUT_MS,
      DEFAULT_ETHOS_REQUEST_TIMEOUT_MS,
      "ETHOS_REQUEST_TIMEOUT_MS",
    ),
  };
}
