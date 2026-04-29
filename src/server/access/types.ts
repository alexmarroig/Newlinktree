export type AccessTier =
  | "trial"
  | "bundle"
  | "standalone"
  | "ambassador"
  | "blocked"
  | "none";

export type AccessResolution = {
  tier: AccessTier;
  trialActive?: boolean;
  source: "ethos" | "cache" | "offline-fallback";
};

export type AccessPermissions = {
  canEdit: boolean;
  canPublish: boolean;
  readOnly: boolean;
  reason: string;
};
