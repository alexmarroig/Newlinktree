import type { AccessPermissions, AccessResolution } from "./types";

export class BiohubAccessService {
  toPermissions(resolution: AccessResolution): AccessPermissions {
    if (resolution.source === "offline-fallback") {
      return { canEdit: false, canPublish: false, readOnly: true, reason: "offline_fallback" };
    }

    if (resolution.tier === "trial") {
      if (resolution.trialActive) {
        return { canEdit: true, canPublish: true, readOnly: false, reason: "trial_active" };
      }
      return { canEdit: false, canPublish: false, readOnly: true, reason: "trial_expired" };
    }

    if (["bundle", "standalone", "ambassador"].includes(resolution.tier)) {
      return { canEdit: true, canPublish: true, readOnly: false, reason: "eligible_tier" };
    }

    return { canEdit: false, canPublish: false, readOnly: true, reason: "tier_blocked" };
  }
}
