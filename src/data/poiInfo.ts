"use server";

import { cache } from "react";
import { query } from "@/lib/db";
import { getProtectedArea } from "@/lib/stvk";

export const getPoiInfo = cache(async function getPoiInfo(
  id: string,
  mapType?: string | null,
) {
  // Protected areas ("saugomos") come straight from the STVK API — we no
  // longer mirror them in our DB. Everything else stays on places.poi_info.
  if (mapType === "saugomos") {
    return getProtectedArea(id);
  }

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
});
