"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { getPoiRatingAction, setPoiRatingAction } from "@/actions/ratings";
import { POI_RATING_KEY } from "@/lib/swrKeys";
import { useAuth } from "@/providers/AuthProvider";
import { useMapConfig, useMapSelection } from "@/providers/MapProvider";

// The denormalized average (places.poi.rating, sql/ratings.sql) arrives on
// the enriched feature as properties.rating, 10-50 (average x10) or null —
// shown to every visitor. Only the logged-in user's own star pick
// (openmap.poi_ratings) needs a per-user fetch/mutation, mirrored here after
// usePoiCollectionStatus.
export function usePoiRating() {
  const { user } = useAuth();
  const { selectedFeature: feature, selectedPoiId } = useMapSelection();
  const { activeMapProfile } = useMapConfig();

  const mapProfileId = activeMapProfile.id;
  const rawAverage = feature?.properties?.rating as number | null | undefined;

  // setMyRating below already knows the freshly recalculated average (the
  // server action returns it straight from the DB trigger, sql/ratings.sql)
  // — this override lets that value show immediately instead of waiting for
  // the next full POI re-fetch to refresh feature.properties.rating. Reset
  // whenever the selected POI changes so a stale override never leaks onto
  // a different object.
  const [averageOverride, setAverageOverride] = useState<
    number | null | undefined
  >(undefined);
  // Reset-on-prop-change during render (React's documented alternative to a
  // useEffect for this) instead of an effect, since the effect had nothing
  // to synchronize with an external system — it only ever reset local state.
  const [prevObjectRefForReset, setPrevObjectRefForReset] = useState(
    selectedPoiId != null ? String(selectedPoiId) : null,
  );

  // Always shown for every "places" POI (not just once it has ratings or a
  // logged-in viewer) — an anonymous visitor on an unrated POI needs to see
  // the control to discover the feature exists at all.
  const isEligible = Boolean(
    feature && selectedPoiId != null && mapProfileId === "places",
  );
  const canRate = Boolean(isEligible && user);

  // selectedPoiId's runtime type isn't stable: it starts as a string (SSR
  // initialPoiData) and can flip to a number once PoiInteraction.tsx
  // re-selects the same POI from MapLibre tile properties (numeric id
  // fields come back as numbers). Without normalizing, "25" and 25 hash to
  // different SWR keys, so that flip looked like a brand-new key — SWR
  // dropped the cached rating and refetched, flashing "unrated" for a
  // moment even though nothing actually changed.
  const objectRef = selectedPoiId != null ? String(selectedPoiId) : null;
  const ratingKey = canRate && objectRef ? [POI_RATING_KEY, objectRef] : null;
  const { data: myRating } = useSWR(ratingKey, () =>
    getPoiRatingAction(objectRef as string),
  );

  if (objectRef !== prevObjectRefForReset) {
    setPrevObjectRefForReset(objectRef);
    setAverageOverride(undefined);
  }

  const averageRating =
    averageOverride !== undefined
      ? averageOverride
      : rawAverage != null
        ? rawAverage / 10
        : null;

  const setMyRating = async (next: number | null) => {
    if (!ratingKey || !objectRef) return;
    mutate(ratingKey, next, { revalidate: false });
    const result = await setPoiRatingAction(objectRef, next);
    if (result.ok) {
      setAverageOverride(result.average != null ? result.average / 10 : null);
    }
  };

  return {
    isEligible,
    canRate,
    averageRating,
    myRating: myRating ?? null,
    setMyRating,
  };
}
