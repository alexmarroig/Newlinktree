import type { AccessPermissions } from "./types";
import type { ApiResponse } from "@/types";

export function enforceEditPermission(perms: AccessPermissions): ApiResponse | null {
  if (perms.canEdit) return null;
  return { success: false, error: "Edição bloqueada pelo plano de acesso", code: "FORBIDDEN" };
}

export function enforcePublishPermission(perms: AccessPermissions): ApiResponse | null {
  if (perms.canPublish) return null;
  return { success: false, error: "Publicação bloqueada pelo plano de acesso", code: "FORBIDDEN" };
}
