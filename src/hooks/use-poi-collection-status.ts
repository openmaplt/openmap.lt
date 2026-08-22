"use client";

import useSWR, { mutate } from "swr";
import {
  getPoiCollectionStatusAction,
  setPoiCollectionStatusAction,
} from "@/actions/collectionStatus";
import type { PoiCollectionStatusValue } from "@/domain/collectionStatus";
import { useMyCollectionTypeCodes } from "@/hooks/use-my-collection-type-codes";
import { POI_COLLECTION_STATUS_KEY } from "@/lib/swrKeys";
import { useMapConfig, useMapSelection } from "@/providers/MapProvider";

// Whether the currently selected POI is eligible for a visited/not-interesting
// toggle (logged in, "places" profile, and its type is one the user
// collects) is decided here rather than inside the control itself, so
// PoiDetails.tsx can decide up front whether to render the shared control bar
// (alongside the "Maršrutas" button) at all.
export function usePoiCollectionStatus() {
  const { user, typeCodes: myTypeCodes } = useMyCollectionTypeCodes();
  const { selectedFeature: feature, selectedPoiId } = useMapSelection();
  const { activeMapProfile } = useMapConfig();

  const mapProfileId = activeMapProfile.id;
  const filterCode = feature?.properties?.FILTER_CODE as string | undefined;

  const isEligible = Boolean(
    user &&
      feature &&
      selectedPoiId != null &&
      mapProfileId === "places" &&
      filterCode &&
      myTypeCodes?.includes(filterCode),
  );

  const statusKey = isEligible
    ? [POI_COLLECTION_STATUS_KEY, selectedPoiId]
    : null;
  const { data: status } = useSWR(statusKey, () =>
    getPoiCollectionStatusAction(String(selectedPoiId)),
  );

  const setStatus = async (next: PoiCollectionStatusValue | null) => {
    if (!statusKey || selectedPoiId == null) return;
    mutate(statusKey, next, { revalidate: false });
    await setPoiCollectionStatusAction(String(selectedPoiId), next);
  };

  return { isEligible, status: status ?? null, setStatus };
}
