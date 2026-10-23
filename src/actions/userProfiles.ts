"use server";

import { MAP_PROFILES } from "@/config/map-profiles";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";
import { updateUserSettings } from "@/lib/userSettings";

export type SaveDisabledProfilesResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "no_session"
        | "rate_limited"
        | "invalid_profiles"
        | "all_disabled";
    };

export async function saveDisabledProfilesAction(
  disabledProfileIds: string[],
): Promise<SaveDisabledProfilesResult> {
  if (await checkRateLimit("profilesSave", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("profilesSave", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const validIds = new Set(MAP_PROFILES.map((profile) => profile.id));
  const deduped = Array.from(new Set(disabledProfileIds));
  if (deduped.some((id) => !validIds.has(id))) {
    return { ok: false, error: "invalid_profiles" };
  }
  // The switcher would be empty otherwise.
  if (deduped.length >= validIds.size) {
    return { ok: false, error: "all_disabled" };
  }

  await updateUserSettings(user.id, { hiddenProfileIds: deduped });

  return { ok: true };
}
