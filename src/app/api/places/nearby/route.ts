import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const longitude = searchParams.get("longitude");
    const latitude = searchParams.get("latitude");
    const radius = searchParams.get("radius") || "10000"; // 10km pagal nutylėjimą

    // Validacija
    if (!longitude || !latitude) {
      return NextResponse.json(
        {
          success: false,
          error: "Privalomi parametrai: longitude, latitude",
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
        longitude: Number.parseFloat(longitude),
        latitude: Number.parseFloat(latitude),
        radius: Number.parseFloat(radius),
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
