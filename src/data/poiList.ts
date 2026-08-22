"use server";

import type { FeatureCollection } from "geojson";
import {
  POI_COLLECTION_MAP_FILTER,
  POI_COLLECTION_MAP_FILTER_CODE,
  type PoiCollectionMapFilter,
} from "@/domain/collectionStatus";
import { getCurrentUser } from "@/lib/auth";
import { queryResult } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function getPoiList(
  bbox: number[],
  types: string,
  statusFilter: PoiCollectionMapFilter = POI_COLLECTION_MAP_FILTER.ALL,
): Promise<FeatureCollection> {
  if (await checkRateLimit("getPoiList", "frequent")) {
    return EMPTY_FEATURE_COLLECTION;
  }

  if (
    bbox.length !== 4 ||
    bbox.some((n) => typeof n !== "number" || !Number.isFinite(n))
  ) {
    return EMPTY_FEATURE_COLLECTION;
  }

  const params: {
    bbox: number[];
    types: string;
    usr_id?: number;
    filter?: string;
  } = {
    bbox,
    types,
  };
  if (statusFilter !== POI_COLLECTION_MAP_FILTER.ALL) {
    const user = await getCurrentUser();
    if (user) {
      params.usr_id = user.id;
      params.filter = POI_COLLECTION_MAP_FILTER_CODE[statusFilter];
    }
  }

  try {
    const result = await queryResult(
      "SELECT places.list($1::jsonb) as result",
      [JSON.stringify(params)],
    );

    if (result) {
      const data = result as FeatureCollection | { error: string };
      if ("error" in data) {
        console.error("POI list error from DB:", data.error);
        return EMPTY_FEATURE_COLLECTION;
      }

      return data;
    }
  } catch (error) {
    console.error("Error fetching POI list:", error);
    throw error;
  }

  return EMPTY_FEATURE_COLLECTION;
}
