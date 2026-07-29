"use server";

import type { FeatureCollection } from "geojson";
import { queryResult } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function getPoiList(
  bbox: number[],
  types: string,
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

  try {
    const result = await queryResult(
      "SELECT places.list($1::jsonb) as result",
      [JSON.stringify({ bbox, types })],
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
