"use server";

import { BASE_URL } from "@/config/config";
import {
  MODERATION_NOTE_MAX_LENGTH,
  PROFILE_EDITOR_ORIGIN,
  PROFILE_NAME_MAX_LENGTH,
} from "@/config/custom-profiles";
import { PERMISSIONS } from "@/config/permissions";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";
import { getCurrentUser } from "@/lib/auth";
import { userHasPermission } from "@/lib/permissions";
import { createEditToken } from "@/lib/profileEditToken";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";
import {
  type CustomProfileView,
  createProfile,
  deleteProfile,
  getOwnedProfile,
  hideProfileAsAdmin,
  publishProfileAsAdmin,
  renameProfile,
  requestBaseStatus,
  requestReview,
  setBaseStatusAsAdmin,
  toProfileView,
  type UserProfile,
  withdrawBaseRequest,
} from "@/lib/userProfiles";

// Server actions behind /paskyra/mano-profiliai for user-created map profiles.
// Every action is gated on a session and rate limited, and only ever touches
// profiles the caller owns (the admin decision is the one exception).

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
    ? { ok: true, profile: toProfileView(profile) }
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
    ? { ok: true, profile: toProfileView(result.profile) }
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

// Author says a hidden profile is fixed and asks an admin to look again.
export async function requestReviewAction(
  id: string,
): Promise<ProfileActionResult> {
  const gate = await guard("customProfileReview");
  if (!gate.ok) return gate;

  return resultFor(await requestReview(gate.userId, id));
}

// Needs profiles.moderate (admins always have it): approve a profile as a base
// profile (one that was proposed or one the admin picked), or reject / revoke
// it (`none`).
export async function setBaseProfileStatusAction(
  id: string,
  status: typeof PROFILE_BASE_STATUS.APPROVED | typeof PROFILE_BASE_STATUS.NONE,
): Promise<ProfileActionResult<"forbidden" | "invalid_status">> {
  const gate = await guard("customProfileAdmin");
  if (!gate.ok) return gate;

  if (!(await userHasPermission(gate.userId, PERMISSIONS.PROFILES_MODERATE))) {
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

export async function hideProfileAction(
  id: string,
  note: string,
): Promise<ProfileActionResult<"forbidden" | "invalid_note">> {
  const gate = await guard("customProfileAdmin");
  if (!gate.ok) return gate;

  if (!(await userHasPermission(gate.userId, PERMISSIONS.PROFILES_MODERATE))) {
    return { ok: false, error: "forbidden" };
  }
  // The author reads this to know what to fix, so it must say something.
  const cleaned = note.trim();
  if (cleaned.length < 3 || cleaned.length > MODERATION_NOTE_MAX_LENGTH) {
    return { ok: false, error: "invalid_note" };
  }
  return resultFor(await hideProfileAsAdmin(id, cleaned));
}

export async function publishProfileAction(
  id: string,
): Promise<ProfileActionResult<"forbidden">> {
  const gate = await guard("customProfileAdmin");
  if (!gate.ok) return gate;

  if (!(await userHasPermission(gate.userId, PERMISSIONS.PROFILES_MODERATE))) {
    return { ok: false, error: "forbidden" };
  }
  return resultFor(await publishProfileAsAdmin(id));
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
    return: `${BASE_URL}/paskyra/mano-profiliai/${profile.slug}`,
  });
  return { ok: true, url: `${PROFILE_EDITOR_ORIGIN}/?${query}` };
}
