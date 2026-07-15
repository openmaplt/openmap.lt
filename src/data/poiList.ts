"use server";

import type { FeatureCollection } from "geojson";
import { query } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function getPoiList(
  bbox: number[],
  types: string,
): Promise<FeatureCollection> {
  if (await checkRateLimit("getPoiList")) {
    return EMPTY_FEATURE_COLLECTION;
  }

  if (
    bbox.length !== 4 ||
    bbox.some((n) => typeof n !== "number" || !Number.isFinite(n))
  ) {
    return EMPTY_FEATURE_COLLECTION;
  }

  try {
    const result = await query("SELECT places.list($1::jsonb) as result", [
      JSON.stringify({
        bbox,
        types,
      }),
    ]);

    if (result.rows.length > 0 && result.rows[0].result) {
      const data = result.rows[0].result;
      if (data && typeof data === "object" && "error" in data) {
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
