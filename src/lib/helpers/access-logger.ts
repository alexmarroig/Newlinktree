import { createHash, randomUUID } from "crypto";

type LogLevel = "info" | "warn" | "error";
type AccessAction = "edit" | "publish";
type AccessStatus = "started" | "allowed" | "denied" | "success" | "error" | "degraded";
type AccessSource = "ethos" | "local_policy";

interface BaseAccessLog {
  correlation_id?: string;
  user_id?: string | null;
  status: AccessStatus;
  source: AccessSource;
  reason_code: string;
  latency_ms?: number;
}

interface AccessDecisionLog extends BaseAccessLog {
  action: AccessAction;
}

const USER_HASH_SALT = "access-audit-v1";

function technicalUserId(userId?: string | null): string {
  if (!userId) return "anonymous";

  return createHash("sha256")
    .update(`${USER_HASH_SALT}:${userId}`)
    .digest("hex")
    .slice(0, 16);
}

function writeStructuredLog(level: LogLevel, event: string, payload: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...payload,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(entry));
    return;
  }

  console.info(JSON.stringify(entry));
}

function normalize(base: BaseAccessLog) {
  return {
    correlation_id: base.correlation_id ?? randomUUID(),
    user_id: technicalUserId(base.user_id),
    status: base.status,
    source: base.source,
    reason_code: base.reason_code,
    latency_ms: base.latency_ms,
  };
}

export function logEthosQueryStarted(base: Omit<BaseAccessLog, "status" | "source">) {
  writeStructuredLog("info", "access.ethos_query.started", normalize({ ...base, status: "started", source: "ethos" }));
}

export function logEthosQueryFinished(base: Omit<BaseAccessLog, "status" | "source">) {
  writeStructuredLog("info", "access.ethos_query.finished", normalize({ ...base, status: "success", source: "ethos" }));
}

export function logAccessDecision({ action, ...base }: AccessDecisionLog) {
  const level: LogLevel = base.status === "denied" ? "warn" : "info";
  writeStructuredLog(level, "access.decision", {
    ...normalize(base),
    action,
  });
}

export function logDegradedFallback(base: Omit<BaseAccessLog, "status">) {
  writeStructuredLog("warn", "access.fallback.degraded", normalize({ ...base, status: "degraded" }));
}
