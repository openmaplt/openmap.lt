"use server";

import { COLLECTION_TYPE_CODES } from "@/config/collection-filters";
import { getCurrentUser } from "@/lib/auth";
import { replaceUserCollectionTypeCodes } from "@/lib/collections";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";

export type SaveCollectionSelectionResult =
  | { ok: true }
  | { ok: false; error: "no_session" | "rate_limited" | "invalid_types" };

export async function saveCollectionSelectionAction(
  typeCodes: string[],
): Promise<SaveCollectionSelectionResult> {
  if (await checkRateLimit("collectionSave", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("collectionSave", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const validCodes = new Set(COLLECTION_TYPE_CODES);
  const deduped = Array.from(new Set(typeCodes));
  if (deduped.some((code) => !validCodes.has(code))) {
    return { ok: false, error: "invalid_types" };
  }

  await replaceUserCollectionTypeCodes(user.id, deduped);

  return { ok: true };
}
