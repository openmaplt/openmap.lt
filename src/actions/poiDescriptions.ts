"use server";

import { getCurrentUser } from "@/lib/auth";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  getPoiDescription,
  type PoiDescriptionRow,
  setPoiDescription,
} from "@/lib/poiDescriptions";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";

const MAX_OBJECT_REF_LENGTH = 200;
const MAX_BODY_LENGTH = 4000;

export type PoiDescriptionResult = PoiDescriptionRow & { canEdit: boolean };

// Public read — the description is visible to every visitor, not just
// logged-in users (unlike getPoiRatingAction), so `canEdit` is folded into
// the same round trip instead of a separate permission check, keeping the
// client's session shape (PublicUser only exposes isAdmin, see auth.ts) free
// of per-permission fields it would otherwise need for this one widget.
export async function getPoiDescriptionAction(
  objectRef: string,
): Promise<PoiDescriptionResult> {
  const [description, canEdit] = await Promise.all([
    getPoiDescription(objectRef),
    currentUserHasPermission(PERMISSIONS.PLACES_DESCRIPTION_EDIT),
  ]);

  return {
    body: description?.body ?? "",
    updatedAt: description?.updatedAt ?? "",
    canEdit,
  };
}

export type SetPoiDescriptionResult =
  | { ok: true; updatedAt: string }
  | {
      ok: false;
      error: "no_session" | "no_permission" | "rate_limited" | "invalid_ref";
    };

export async function setPoiDescriptionAction(
  objectRef: string,
  body: string,
): Promise<SetPoiDescriptionResult> {
  if (await checkRateLimit("poiDescriptionSave", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("poiDescriptionSave", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  if (!(await currentUserHasPermission(PERMISSIONS.PLACES_DESCRIPTION_EDIT))) {
    return { ok: false, error: "no_permission" };
  }

  // objectRef must be the numeric places.poi id, same shape as ratings'
  // objectRef check (src/actions/ratings.ts) — no DB constraint enforces this
  // here since object_ref is plain text, but every writer of this table
  // agrees on the convention.
  if (
    objectRef.length === 0 ||
    objectRef.length > MAX_OBJECT_REF_LENGTH ||
    !/^\d+$/.test(objectRef)
  ) {
    return { ok: false, error: "invalid_ref" };
  }

  const trimmed = body.trim().slice(0, MAX_BODY_LENGTH);
  await setPoiDescription(
    user.id,
    objectRef,
    trimmed.length > 0 ? trimmed : null,
  );

  return { ok: true, updatedAt: new Date().toISOString() };
}
