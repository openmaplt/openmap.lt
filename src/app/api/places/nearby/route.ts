import { type NextRequest, NextResponse } from "next/server";
import { LITHUANIA_BOUNDS } from "@/config";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const longitudeStr = searchParams.get("longitude");
    const latitudeStr = searchParams.get("latitude");
    const radiusStr = searchParams.get("radius") || "10000"; // 10km pagal nutylėjimą

    // Validacija
    if (!longitudeStr || !latitudeStr) {
      return NextResponse.json(
        {
          success: false,
          error: "Privalomi parametrai: longitude, latitude",
        },
        { status: 400 },
      );
    }

    // Konvertuojame į skaičius ir validuojame
    const longitude = Number.parseFloat(longitudeStr);
    const latitude = Number.parseFloat(latitudeStr);
    const radius = Number.parseFloat(radiusStr);

    // Validuojame ar skaičiai yra teisingi
    if (
      Number.isNaN(longitude) ||
      Number.isNaN(latitude) ||
      Number.isNaN(radius)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Parametrai turi būti skaičiai",
        },
        { status: 400 },
      );
    }

    // Validuojame koordinačių diapazonus (Lietuvos ribos)
    if (
      longitude < LITHUANIA_BOUNDS.MIN_LONGITUDE ||
      longitude > LITHUANIA_BOUNDS.MAX_LONGITUDE ||
      latitude < LITHUANIA_BOUNDS.MIN_LATITUDE ||
      latitude > LITHUANIA_BOUNDS.MAX_LATITUDE
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Koordinatės turi būti Lietuvos ribose. Longitude: ${LITHUANIA_BOUNDS.MIN_LONGITUDE} iki ${LITHUANIA_BOUNDS.MAX_LONGITUDE}, Latitude: ${LITHUANIA_BOUNDS.MIN_LATITUDE} iki ${LITHUANIA_BOUNDS.MAX_LATITUDE}`,
        },
        { status: 400 },
      );
    }

    // Validuojame spindulį (maksimalus 1000km)
    if (radius < 0 || radius > 1000000) {
      return NextResponse.json(
        {
          success: false,
          error: "Spindulys turi būti tarp 0 ir 1000000 metrų (1000km)",
        },
        { status: 400 },
      );
    }

    // PostGIS užklausa - rasti vietas per nurodytą spindulį
    const result = await query(
      `SELECT 
        id, 
        name, 
        description,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        ST_Distance(
          location,
          ST_GeogFromText($1)
        ) as distance_meters,
        created_at
      FROM places
      WHERE ST_DWithin(
        location,
        ST_GeogFromText($1),
        $2
      )
      ORDER BY distance_meters ASC`,
      [`POINT(${longitude} ${latitude})`, radius],
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
      params: {
        longitude,
        latitude,
        radius,
      },
    });
  } catch (error) {
    console.error("Klaida ieškant artimų vietų:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Nepavyko rasti artimų vietų",
      },
      { status: 500 },
    );
  }
}
