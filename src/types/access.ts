export type BiohubAccessAction = "edit" | "publish" | "read_public";

export type BiohubAccessSource = "biohub" | "fallback_fail_safe";

export type BiohubAccessStatus = "granted" | "denied";

export type BiohubPlan = "free" | "pro" | "enterprise" | "unknown";

export type BiohubAccessReasonCode =
  | "ALLOWED"
  | "BLOCKED_BY_PLAN"
  | "BLOCKED_BY_STATUS"
  | "BLOCKED_FAIL_SAFE"
  | "INTEGRATION_ERROR";

export interface BiohubAccessLimits {
  maxPages?: number;
  maxPublishedPages?: number;
}

export interface BiohubAccessResult {
  biohub_access: boolean;
  can_edit: boolean;
  can_publish: boolean;
  plan: BiohubPlan;
  status: BiohubAccessStatus;
  source: BiohubAccessSource;
  limits: BiohubAccessLimits;
  reason_code: BiohubAccessReasonCode;
}

export interface BiohubAccessUser {
  id: string;
  plan?: BiohubPlan;
  status?: BiohubAccessStatus;
}
