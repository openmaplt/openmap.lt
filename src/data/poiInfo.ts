"use server";

import { query } from "@/lib/db";

export async function getPoiInfo(id: string, mapType?: string | null) {
  try {
    const result = await query("SELECT places.poi_info($1::jsonb) as result", [
      JSON.stringify({
        id,
        mapType,
      }),
    ]);

    if (result.rows.length > 0 && result.rows[0].result) {
      const data = result.rows[0].result;
      // Check if the returned object contains an error field (as per PL/SQL function behavior)
      if (data && typeof data === "object" && "error" in data) {
        console.error("POI Info error from DB:", data.error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error("Error fetching POI info:", error);
    throw error;
  }

  return null;
}
