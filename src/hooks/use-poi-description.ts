"use client";

import useSWR, { mutate } from "swr";
import {
  getPoiDescriptionAction,
  setPoiDescriptionAction,
} from "@/actions/poiDescriptions";
import { POI_DESCRIPTION_KEY } from "@/lib/swrKeys";
import { useMapConfig, useMapSelection } from "@/providers/MapProvider";

// Unlike usePoiRating, the description is fetched for every visitor (not
// only when logged in) — it's shared, publicly visible content, and it must
// come from the DB live rather than tile-baked data so an edit shows up for
// everyone immediately (see AGENTS.md's ai-search "denormalized" precedent
// discussion — that reasoning doesn't apply here since there's no search
// sort/filter need for this field).
export function usePoiDescription() {
  const { selectedPoiId } = useMapSelection();
  const { activeMapProfile } = useMapConfig();

  const isEligible = Boolean(
    selectedPoiId != null && activeMapProfile.id === "places",
  );

  // Same string-normalization gotcha as usePoiRating: selectedPoiId can be a
  // string (SSR) or a number (re-selected from tile properties) for the same
  // POI — normalize before it becomes part of the SWR key.
  const objectRef = selectedPoiId != null ? String(selectedPoiId) : null;
  const descriptionKey =
    isEligible && objectRef ? [POI_DESCRIPTION_KEY, objectRef] : null;

  const { data, isLoading } = useSWR(descriptionKey, () =>
    getPoiDescriptionAction(objectRef as string),
  );

  const save = async (body: string) => {
    if (!descriptionKey || !objectRef) {
      return { ok: false as const, error: "invalid_ref" as const };
    }
    const result = await setPoiDescriptionAction(objectRef, body);
    if (result.ok) {
      mutate(descriptionKey, {
        body: body.trim(),
        updatedAt: result.updatedAt,
        canEdit: data?.canEdit ?? false,
      });
    }
    return result;
  };

  return {
    isEligible,
    isLoading,
    body: data?.body ?? "",
    canEdit: data?.canEdit ?? false,
    save,
  };
}
