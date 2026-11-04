"use server";

import { BASE_URL } from "@/config/config";
import {
  PROFILE_EDITOR_ORIGIN,
  PROFILE_NAME_MAX_LENGTH,
} from "@/config/custom-profiles";
import {
  PROFILE_BASE_STATUS,
  type ProfileBaseStatus,
} from "@/domain/profileBaseStatus";
import {
  PROFILE_VISIBILITY,
  PROFILE_VISIBILITY_VALUES,
  type ProfileVisibility,
} from "@/domain/profileVisibility";
import { getCurrentUser } from "@/lib/auth";
import { createEditToken } from "@/lib/profileEditToken";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";
import {
  createProfile,
  deleteProfile,
  getOwnedProfile,
  regenerateShareKey,
  renameProfile,
  requestBaseStatus,
  setBaseStatusAsAdmin,
  setProfileVisibility,
  type UserProfile,
  withdrawBaseRequest,
} from "@/lib/userProfiles";
import { getUserRole, ROLES } from "@/lib/users";

// Server actions behind /paskyra/profiliai for user-created map profiles.
// Every action is gated on a session and rate limited, and only ever touches
// profiles the caller owns (the admin decision is the one exception).

// What the client gets: dates as ISO strings, `shareKey` only because the
// caller is the owner.
export type CustomProfileView = {
  id: string;
  slug: string;
  name: string;
  visibility: ProfileVisibility;
  baseStatus: ProfileBaseStatus;
  shareKey: string | null;
  expiresAt: string | null;
  updatedAt: string;
};

function toView(profile: UserProfile): CustomProfileView {
  return {
    id: profile.id,
    slug: profile.slug,
    name: profile.name,
    visibility: profile.visibility,
    baseStatus: profile.baseStatus,
    shareKey: profile.shareKey,
    expiresAt: profile.expiresAt?.toISOString() ?? null,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

type GuardError = "rate_limited" | "no_session";

export type ProfileActionResult<E extends string = never> =
  | { ok: true; profile: CustomProfileView }
  | { ok: false; error: GuardError | "not_found" | E };

async function guard(
  action: string,
): Promise<{ ok: true; userId: number } | { ok: false; error: GuardError }> {
  if (await checkRateLimit(action, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }
  if (checkUserRateLimit(action, user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }
  return { ok: true, userId: user.id };
}

function cleanName(input: string): string | null {
  const name = input.replace(/\s+/g, " ").trim();
  return name.length >= 1 && name.length <= PROFILE_NAME_MAX_LENGTH
    ? name
    : null;
}

function resultFor(profile: UserProfile | null): ProfileActionResult {
  return profile
    ? { ok: true, profile: toView(profile) }
    : { ok: false, error: "not_found" };
}

export async function createCustomProfileAction(
  name: string,
): Promise<ProfileActionResult<"invalid_name" | "limit_reached">> {
  const gate = await guard("customProfileCreate");
  if (!gate.ok) return gate;

  const cleaned = cleanName(name);
  if (!cleaned) {
    return { ok: false, error: "invalid_name" };
  }

  const result = await createProfile(gate.userId, cleaned);
  return result.ok
    ? { ok: true, profile: toView(result.profile) }
    : { ok: false, error: result.error };
}

export async function renameCustomProfileAction(
  id: string,
  name: string,
): Promise<ProfileActionResult<"invalid_name">> {
  const gate = await guard("customProfileRename");
  if (!gate.ok) return gate;

  const cleaned = cleanName(name);
  if (!cleaned) {
    return { ok: false, error: "invalid_name" };
  }
  return resultFor(await renameProfile(gate.userId, id, cleaned));
}

export type DeleteProfileResult =
  | { ok: true }
  | { ok: false; error: GuardError | "not_found" };

export async function deleteCustomProfileAction(
  id: string,
): Promise<DeleteProfileResult> {
  const gate = await guard("customProfileDelete");
  if (!gate.ok) return gate;

  return (await deleteProfile(gate.userId, id))
    ? { ok: true }
    : { ok: false, error: "not_found" };
}

export async function setCustomProfileVisibilityAction(
  id: string,
  visibility: ProfileVisibility,
  // ISO timestamp after which a `link` profile stops opening; null = never.
  expiresAt: string | null,
): Promise<ProfileActionResult<"invalid_visibility" | "invalid_expiry">> {
  const gate = await guard("customProfileVisibility");
  if (!gate.ok) return gate;

  if (!PROFILE_VISIBILITY_VALUES.includes(visibility)) {
    return { ok: false, error: "invalid_visibility" };
  }

  let expires: Date | null = null;
  if (visibility === PROFILE_VISIBILITY.LINK && expiresAt !== null) {
    expires = new Date(expiresAt);
    if (Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
      return { ok: false, error: "invalid_expiry" };
    }
  }

  return resultFor(
    await setProfileVisibility(gate.userId, id, visibility, expires),
  );
}

export async function regenerateShareKeyAction(
  id: string,
): Promise<ProfileActionResult> {
  const gate = await guard("customProfileShareKey");
  if (!gate.ok) return gate;

  return resultFor(await regenerateShareKey(gate.userId, id));
}

export async function requestBaseProfileAction(
  id: string,
): Promise<ProfileActionResult> {
  const gate = await guard("customProfileBase");
  if (!gate.ok) return gate;

  return resultFor(await requestBaseStatus(gate.userId, id));
}

export async function withdrawBaseRequestAction(
  id: string,
): Promise<ProfileActionResult> {
  const gate = await guard("customProfileBase");
  if (!gate.ok) return gate;

  return resultFor(await withdrawBaseRequest(gate.userId, id));
}

// Admin only: approve a requested profile as a base profile, or reject /
// revoke it (`none`).
export async function setBaseProfileStatusAction(
  id: string,
  status: typeof PROFILE_BASE_STATUS.APPROVED | typeof PROFILE_BASE_STATUS.NONE,
): Promise<ProfileActionResult<"forbidden" | "invalid_status">> {
  const gate = await guard("customProfileAdmin");
  if (!gate.ok) return gate;

  if ((await getUserRole(gate.userId)) !== ROLES.ADMIN) {
    return { ok: false, error: "forbidden" };
  }
  if (
    status !== PROFILE_BASE_STATUS.APPROVED &&
    status !== PROFILE_BASE_STATUS.NONE
  ) {
    return { ok: false, error: "invalid_status" };
  }
  return resultFor(await setBaseStatusAsAdmin(id, status));
}

export type StartEditResult =
  | { ok: true; url: string }
  | { ok: false; error: GuardError | "not_found" | "editor_unavailable" };

// Builds the Maputnik link for "Keisti": the style to load, a short-lived
// token that lets the editor read and save just this profile, and where the
// editor's "back" link should lead.
export async function startProfileEditAction(
  id: string,
): Promise<StartEditResult> {
  const gate = await guard("customProfileEdit");
  if (!gate.ok) return gate;

  const profile = await getOwnedProfile(gate.userId, id);
  if (!profile) {
    return { ok: false, error: "not_found" };
  }

  let token: string;
  try {
    token = createEditToken({ userId: profile.userId, profileId: profile.id });
  } catch (error) {
    console.error(
      "[customProfiles] negalima sukurti redagavimo žetono:",
      error,
    );
    return { ok: false, error: "editor_unavailable" };
  }

  const query = new URLSearchParams({
    style: `${BASE_URL}/api/profile-styles/${profile.slug}`,
    token,
    return: `${BASE_URL}/paskyra/profiliai`,
  });
  return { ok: true, url: `${PROFILE_EDITOR_ORIGIN}/?${query}` };
}
