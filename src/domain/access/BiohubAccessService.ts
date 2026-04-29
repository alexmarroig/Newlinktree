import type {
  BiohubAccessAction,
  BiohubAccessReasonCode,
  BiohubAccessResult,
  BiohubAccessUser,
} from "@/types/access";

const ACTION_RULES: Record<BiohubAccessAction, keyof Pick<BiohubAccessResult, "can_edit" | "can_publish"> | null> = {
  edit: "can_edit",
  publish: "can_publish",
  read_public: null,
};

function isActionAllowed(result: BiohubAccessResult, action: BiohubAccessAction): boolean {
  const rule = ACTION_RULES[action];
  if (!rule) return true;
  return result[rule];
}

function buildFallbackFailSafe(): BiohubAccessResult {
  return {
    biohub_access: false,
    can_edit: false,
    can_publish: false,
    plan: "unknown",
    status: "denied",
    source: "fallback_fail_safe",
    limits: {},
    reason_code: "BLOCKED_FAIL_SAFE",
  };
}

function resolveReasonCode(user: BiohubAccessUser): BiohubAccessReasonCode {
  if (user.status === "denied") return "BLOCKED_BY_STATUS";
  if (user.plan === "free") return "BLOCKED_BY_PLAN";
  return "ALLOWED";
}

export class BiohubAccessService {
  resolveAccess(user: BiohubAccessUser, action: BiohubAccessAction): BiohubAccessResult {
    try {
      const plan = user.plan ?? "unknown";
      const status = user.status ?? "granted";

      const isDeniedByStatus = status !== "granted";
      const canEdit = !isDeniedByStatus;
      const canPublish = !isDeniedByStatus && plan !== "free" && plan !== "unknown";

      const baseResult: BiohubAccessResult = {
        biohub_access: !isDeniedByStatus,
        can_edit: canEdit,
        can_publish: canPublish,
        plan,
        status,
        source: "biohub",
        limits: {},
        reason_code: resolveReasonCode({ ...user, plan, status }),
      };

      if (isActionAllowed(baseResult, action)) {
        return baseResult;
      }

      return {
        ...baseResult,
        biohub_access: false,
        reason_code:
          action === "publish" ? "BLOCKED_BY_PLAN" : "BLOCKED_BY_STATUS",
      };
    } catch {
      const failSafe = buildFallbackFailSafe();

      if (action === "read_public") {
        return {
          ...failSafe,
          biohub_access: true,
          status: "granted",
          reason_code: "INTEGRATION_ERROR",
        };
      }

      return failSafe;
    }
  }
}

export const biohubAccessService = new BiohubAccessService();
