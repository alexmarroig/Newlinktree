const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null || value.trim() === "") return defaultValue;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

export const featureFlags = {
  ethosIntegrationEnabled: parseBoolean(
    process.env.BIOHUB_ETHOS_INTEGRATION_ENABLED,
    false,
  ),
} as const;
