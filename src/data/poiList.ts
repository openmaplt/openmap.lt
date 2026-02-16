"use server";

import type { FeatureCollection } from "geojson";
import { query } from "@/lib/db";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function getPoiList(
  bbox: number[],
  types: string,
): Promise<FeatureCollection> {
  try {
    const result = await query("SELECT places.list($1::jsonb) as result", [
      JSON.stringify({
        bbox,
        types,
      }),
    ]);

    if (result.rows.length > 0 && result.rows[0].result) {
      return result.rows[0].result;
    }
  } catch (error) {
    console.error("Error fetching POI list:", error);
    throw error;
  }

  return EMPTY_FEATURE_COLLECTION;
}
