import "server-only";

/**
 * STVK (Saugomų teritorijų valstybės kadastras) API — the raw HTTP layer.
 * These functions only talk to the STVK REST endpoints and return the data as
 * received; shaping (POI formatting) and caching live in the sibling modules.
 * Defaults to the test server; override with STVK_API_URL for production.
 */

const STVK_API_URL = process.env.STVK_API_URL ?? "https://test.stvk.lt";
const PROTECTED_AREA_PATH = "/stk-api/rest/public/protected-area";
const AREA_PHOTOS_PATH = "/stk-api/rest/public/get-area-photos";

// Cache the object endpoint for a day — protected-area records change rarely.
const REVALIDATE_SECONDS = 86_400;

/**
 * Subset of the ~70 STVK fields we surface — mirrors the fields our old
 * `places.stvk_data.description` was composed from, so the panel keeps parity
 * with what the DB used to serve.
 */
export interface StvkProtectedArea {
  id: string;
  pavadinimas?: string | null;
  plotas?: number | null;
  pobudis?: string | null;
  rusis?: string | null;
  steigejas?: string | null;
  steig_data?: string | null;
  steig_tikslas?: string | null;
  tarpt_svarba_status?: string | null;
  vieta?: string | null;
  x_min?: number | null;
  y_min?: number | null;
  x_max?: number | null;
  y_max?: number | null;
}

/** A single photo as returned by the STVK get-area-photos endpoint. */
export interface StvkPhoto {
  id: string;
  name: string;
  file_ext: string;
  file_base64: string;
}

/** Fetch a single protected area's raw record, or null on any failure. */
export async function fetchProtectedArea(
  id: string,
): Promise<StvkProtectedArea | null> {
  const url = `${STVK_API_URL}${PROTECTED_AREA_PATH}/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.error(`STVK API returned ${response.status} for ${id}`);
      return null;
    }

    const area = (await response.json()) as StvkProtectedArea | null;
    return area?.id ? area : null;
  } catch (error) {
    console.error("Error fetching protected area from STVK:", error);
    return null;
  }
}

/**
 * Fetch every photo for a protected area. The endpoint returns them all in one
 * POST as base64 (often >2 MB); returns an empty array on any failure.
 */
export async function fetchAreaPhotos(id: string): Promise<StvkPhoto[]> {
  try {
    const response = await fetch(`${STVK_API_URL}${AREA_PHOTOS_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      console.error(`STVK photos API returned ${response.status} for ${id}`);
      return [];
    }

    const json = (await response.json()) as { data?: StvkPhoto[] } | null;
    return json?.data ?? [];
  } catch (error) {
    console.error("Error fetching protected area photos from STVK:", error);
    return [];
  }
}
