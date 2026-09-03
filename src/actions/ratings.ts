"use server";

import { POI_RATING_MAX, POI_RATING_MIN } from "@/domain/rating";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";
import { getUserRating, setUserRating } from "@/lib/ratings";

export async function getPoiRatingAction(
  objectRef: string,
): Promise<number | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getUserRating(user.id, objectRef);
}

export type SetPoiRatingResult =
  // `average` is the recalculated places.poi.rating (10-50 or null) — lets
  // the caller refresh the displayed community average immediately instead
  // of waiting for the next full POI re-fetch.
  | { ok: true; average: number | null }
  | {
      ok: false;
      error: "no_session" | "rate_limited" | "invalid_ref" | "invalid_rating";
    };

export async function setPoiRatingAction(
  objectRef: string,
  rating: number | null,
): Promise<SetPoiRatingResult> {
  if (await checkRateLimit("poiRatingSave", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("poiRatingSave", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  // objectRef must be the numeric places.poi id — the recalc trigger
  // (sql/ratings.sql) casts it to bigint to update places.poi.rating.
  if (
    objectRef.length === 0 ||
    objectRef.length > 200 ||
    !/^\d+$/.test(objectRef)
  ) {
    return { ok: false, error: "invalid_ref" };
  }

  if (
    rating !== null &&
    (!Number.isInteger(rating) ||
      rating < POI_RATING_MIN ||
      rating > POI_RATING_MAX)
  ) {
    return { ok: false, error: "invalid_rating" };
  }

  const average = await setUserRating(user.id, objectRef, rating);

  return { ok: true, average };
}
