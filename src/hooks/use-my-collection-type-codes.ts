"use client";

import useSWR from "swr";
import { getMyCollectionTypeCodesAction } from "@/actions/collections";
import { MY_COLLECTION_TYPE_CODES_KEY } from "@/lib/swrKeys";
import { useAuth } from "@/providers/AuthProvider";

// Shared by usePoiCollectionStatus (per-POI status control) and
// PlacesFilter (map "unvisited/visited/uninteresting" filter) so both read
// the same cached list instead of each firing their own request.
export function useMyCollectionTypeCodes() {
  const { user } = useAuth();
  const key = user ? MY_COLLECTION_TYPE_CODES_KEY : null;
  const { data: typeCodes } = useSWR(key, () =>
    getMyCollectionTypeCodesAction(),
  );

  return {
    user,
    typeCodes,
    hasCollection: Boolean(typeCodes?.length),
  };
}
