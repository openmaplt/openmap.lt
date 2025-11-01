import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("f"); // search term
    const x = searchParams.get("x"); // longitude
    const y = searchParams.get("y"); // latitude

    // Validacija
    if (!filter || !x || !y) {
      return NextResponse.json(
        {
          type: "FeatureCollection",
          features: [],
        },
        { status: 400 },
      );
    }

    // Konvertuojame į skaičius
    const longitude = Number.parseFloat(x);
    const latitude = Number.parseFloat(y);

    // Validuojame ar skaičiai yra teisingi
    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      return NextResponse.json(
        {
          type: "FeatureCollection",
          features: [],
        },
        { status: 400 },
      );
    }

    // SQL užklausa panaši į search.php
    // Naudojame ILIKE operatorių tekstinei paieškai (PostgreSQL case-insensitive search)
    // Grąžiname GeoJSON formatą
    const result = await query(
      `SELECT 
        id,
        name,
        description,
        ST_X(location::geometry) as lon,
        ST_Y(location::geometry) as lat,
        ST_Distance(
          location,
          ST_GeogFromText($1)
        ) as distance,
        ST_AsGeoJSON(location::geometry) as geojson
      FROM places
      WHERE LOWER(name) LIKE LOWER($2)
      ORDER BY ST_Distance(
        location,
        ST_GeogFromText($1)
      )
      LIMIT 10`,
      [`POINT(${longitude} ${latitude})`, `%${filter}%`],
    );

    // Formuojame GeoJSON FeatureCollection atsakymą
    const features = result.rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geojson),
      properties: {
        id: row.id,
        name: row.name,
        description: row.description,
        lat: row.lat,
        lon: row.lon,
        distance: Math.round(row.distance * 1000) / 1000, // Round to 3 decimal places
      },
    }));

    return NextResponse.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("Klaida ieškant vietų:", error);
    return NextResponse.json(
      {
        type: "FeatureCollection",
        features: [],
      },
      { status: 500 },
    );
  }
}
