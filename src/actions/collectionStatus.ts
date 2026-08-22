"use server";

import type { PoiCollectionStatusValue } from "@/domain/collectionStatus";
import { getCurrentUser } from "@/lib/auth";
import { getUserPoiStatus, setUserPoiStatus } from "@/lib/collectionStatus";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";

export async function getPoiCollectionStatusAction(
  objectRef: string,
): Promise<PoiCollectionStatusValue | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getUserPoiStatus(user.id, objectRef);
}

export type SetPoiCollectionStatusResult =
  | { ok: true }
  | { ok: false; error: "no_session" | "rate_limited" | "invalid_ref" };

export async function setPoiCollectionStatusAction(
  objectRef: string,
  status: PoiCollectionStatusValue | null,
): Promise<SetPoiCollectionStatusResult> {
  if (await checkRateLimit("collectionStatusSave", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("collectionStatusSave", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  if (objectRef.length === 0 || objectRef.length > 200) {
    return { ok: false, error: "invalid_ref" };
  }

  await setUserPoiStatus(user.id, objectRef, status);

  return { ok: true };
}
