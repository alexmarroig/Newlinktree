import type {
  BiohubAccessAction,
  BiohubAccessReasonCode,
  BiohubAccessResult,
  BiohubAccessUser,
  BiohubPlan,
  BiohubAccessStatus,
} from "@/types/access";

const ACTION_BLOCK_REASON: Record<Exclude<BiohubAccessAction, "read_public">, BiohubAccessReasonCode> = {
  edit: "BLOCKED_BY_STATUS",
  publish: "BLOCKED_BY_PLAN",
};

const ACTION_PERMISSION: Record<Exclude<BiohubAccessAction, "read_public">, "can_edit" | "can_publish"> = {
  edit: "can_edit",
  publish: "can_publish",
};

function normalizePlan(rawPlan?: unknown): BiohubPlan {
  if (rawPlan === "free" || rawPlan === "pro" || rawPlan === "enterprise") return rawPlan;
  return "unknown";
}

function normalizeStatus(rawStatus?: unknown): BiohubAccessStatus {
  if (rawStatus === "granted" || rawStatus === "denied") return rawStatus;
  return "granted";
}

function resolveReasonCode(plan: BiohubPlan, status: BiohubAccessStatus): BiohubAccessReasonCode {
  if (status === "denied") return "BLOCKED_BY_STATUS";
  if (plan === "free" || plan === "unknown") return "BLOCKED_BY_PLAN";
  return "ALLOWED";
}

function buildFallbackFailSafe(action: BiohubAccessAction): BiohubAccessResult {
  const fallback: BiohubAccessResult = {
    biohub_access: false,
    can_edit: false,
    can_publish: false,
    plan: "unknown",
    status: "denied",
    source: "fallback_fail_safe",
    limits: {},
    reason_code: "BLOCKED_FAIL_SAFE",
  };

  if (action === "read_public") {
    return {
      ...fallback,
      biohub_access: true,
      status: "granted",
      reason_code: "INTEGRATION_ERROR",
    };
  }

  return fallback;
}

export class BiohubAccessService {
  resolveAccess(user: BiohubAccessUser, action: BiohubAccessAction): BiohubAccessResult {
    try {
      const plan = normalizePlan(user.plan);
      const status = normalizeStatus(user.status);
      const canEdit = status === "granted";
      const canPublish = status === "granted" && plan !== "free" && plan !== "unknown";

      const baseResult: BiohubAccessResult = {
        biohub_access: status === "granted",
        can_edit: canEdit,
        can_publish: canPublish,
        plan,
        status,
        source: "biohub",
        limits: {},
        reason_code: resolveReasonCode(plan, status),
      };

      if (action === "read_public") return { ...baseResult, biohub_access: true };

      const permissionKey = ACTION_PERMISSION[action];
      if (baseResult[permissionKey]) return baseResult;

      return {
        ...baseResult,
        biohub_access: false,
        reason_code: ACTION_BLOCK_REASON[action],
      };
    } catch {
      return buildFallbackFailSafe(action);
    }
  }
}

export const biohubAccessService = new BiohubAccessService();
