/**
 * Database search utilities for natural language POI search
 */

import { query } from "@/lib/db";
import type { SearchQuery } from "@/lib/llm";

export interface POIResult {
  id: number;
  osm_id: number;
  obj_type: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

/**
 * Gauna koordinates pagal miestą arba orientyrą
 */
async function getLocationCoordinates(
  location: string,
): Promise<{ lat: number; lon: number } | null> {
  try {
    // Pirmiausia bandome rasti tikslų miestą arba orientyrą POI lentelėje
    const result = await query(
      `
      SELECT 
        ST_Y(ST_Transform(geom, 4326)) as lat,
        ST_X(ST_Transform(geom, 4326)) as lon
      FROM places.poi
      WHERE 
        attr->>'name' ILIKE $1
        OR attr->>'name:lt' ILIKE $1
        OR attr->>'name:en' ILIKE $1
      LIMIT 1
    `,
      [`%${location}%`],
    );

    if (result.rows.length > 0) {
      return {
        lat: result.rows[0].lat,
        lon: result.rows[0].lon,
      };
    }

    // Jei nerado, grąžiname numatytąsias miestų koordinates
    const cityCoordinates: Record<string, { lat: number; lon: number }> = {
      vilnius: { lat: 54.6872, lon: 25.2797 },
      kaunas: { lat: 54.8985, lon: 23.9036 },
      klaipėda: { lat: 55.7033, lon: 21.1443 },
      šiauliai: { lat: 55.9349, lon: 23.3134 },
      panevėžys: { lat: 55.7348, lon: 24.357 },
      trakai: { lat: 54.6378, lon: 24.9347 },
    };

    const normalizedLocation = location
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (normalizedLocation.includes(city)) {
        return coords;
      }
    }

    return null;
  } catch (error) {
    console.error("Koordinačių paieškos klaida:", error);
    return null;
  }
}

/**
 * Atlieka POI paiešką pagal struktūrizuotą užklausą
 */
export async function searchPOI(
  searchQuery: SearchQuery,
): Promise<POIResult[]> {
  try {
    // Nustatome paieškos centrą
    let centerLat: number | null = null;
    let centerLon: number | null = null;

    // Pirmiausia bandome rasti orientyrą
    if (searchQuery.landmark) {
      const coords = await getLocationCoordinates(searchQuery.landmark);
      if (coords) {
        centerLat = coords.lat;
        centerLon = coords.lon;
      }
    }

    // Jei nėra orientyro, bandome miestą
    if (!centerLat && searchQuery.city) {
      const coords = await getLocationCoordinates(searchQuery.city);
      if (coords) {
        centerLat = coords.lat;
        centerLon = coords.lon;
      }
    }

    // Jei vis dar neturime centro, naudojame Vilniaus centrą
    if (!centerLat) {
      centerLat = 54.6872;
      centerLon = 25.2797;
    }

    // Kuriame SQL užklausą
    let sql = `
      SELECT 
        id,
        osm_id,
        obj_type,
        attr->>'name' as name,
        attr->>'name:lt' as name_lt,
        attr->>'amenity' as amenity,
        attr->>'shop' as shop,
        attr->>'tourism' as tourism,
        attr->>'leisure' as leisure,
        ST_Y(ST_Transform(geom, 4326)) as latitude,
        ST_X(ST_Transform(geom, 4326)) as longitude,
        ST_Distance(
          geom,
          ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857)
        ) as distance
      FROM places.poi
      WHERE 1=1
    `;

    const params: unknown[] = [centerLon, centerLat];
    let paramIndex = 3;

    // Filtruojame pagal POI tipą
    if (searchQuery.poiType) {
      sql += ` AND (
        attr->>'amenity' = $${paramIndex}
        OR attr->>'shop' = $${paramIndex}
        OR attr->>'tourism' = $${paramIndex}
        OR attr->>'leisure' = $${paramIndex}
      )`;
      params.push(searchQuery.poiType);
      paramIndex++;
    }

    // Filtruojame pagal raktažodžius
    if (searchQuery.keywords && searchQuery.keywords.length > 0) {
      const keywordConditions = searchQuery.keywords.map(() => {
        const condition = `(
          attr->>'name' ILIKE $${paramIndex}
          OR attr->>'name:lt' ILIKE $${paramIndex}
          OR attr->>'name:en' ILIKE $${paramIndex}
        )`;
        paramIndex++;
        return condition;
      });
      sql += ` AND (${keywordConditions.join(" OR ")})`;
      for (const keyword of searchQuery.keywords) {
        params.push(`%${keyword}%`);
      }
    }

    // Ribojame pagal atstumą
    sql += ` AND ST_Distance(
      geom,
      ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857)
    ) <= $${paramIndex}`;
    params.push(searchQuery.radius);

    // Rūšiuojame pagal atstumą ir ribojame rezultatų skaičių
    sql += " ORDER BY distance ASC LIMIT 20";

    const result = await query(sql, params);

    return result.rows.map((row) => ({
      id: row.id,
      osm_id: row.osm_id,
      obj_type: row.obj_type,
      name: row.name_lt || row.name || row.amenity || row.shop || "Nežinoma",
      type: row.amenity || row.shop || row.tourism || row.leisure || "unknown",
      latitude: row.latitude,
      longitude: row.longitude,
      distance: Math.round(row.distance),
    }));
  } catch (error) {
    console.error("POI paieškos klaida:", error);
    throw error;
  }
}
