import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json(
        {
          success: false,
          error: "Privalomas parametras: id",
        },
        { status: 400 },
      );
    }

    const id = Number.parseInt(idStr, 10);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID turi būti skaičius",
        },
        { status: 400 },
      );
    }

    // Query to get detailed info about a specific place
    const result = await query(
      `SELECT 
        id,
        name,
        description,
        ST_X(location::geometry) as lon,
        ST_Y(location::geometry) as lat,
        created_at,
        ST_AsGeoJSON(location::geometry) as geojson
      FROM places
      WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "POI nerastas",
        },
        { status: 404 },
      );
    }

    const place = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: place.id,
        name: place.name || "Be pavadinimo",
        description: place.description,
        lat: place.lat,
        lon: place.lon,
        created_at: place.created_at,
        geometry: JSON.parse(place.geojson),
      },
    });
  } catch (error) {
    console.error("Klaida gaunant POI informaciją:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Nepavyko gauti POI informacijos",
      },
      { status: 500 },
    );
  }
}
