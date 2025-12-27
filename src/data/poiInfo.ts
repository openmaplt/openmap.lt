"use server";

import { query } from "@/lib/db";

export async function getPoiInfo(id: number, mapType?: string | null) {
  try {
    const result = await query("SELECT places.poi_info($1::jsonb) as result", [
      JSON.stringify({
        id,
        mapType,
      }),
    ]);

    if (result.rows.length > 0 && result.rows[0].result) {
      return result.rows[0].result;
    }
  } catch (error) {
    console.error("Error fetching POI info:", error);
    throw error;
  }

  return null;
}
