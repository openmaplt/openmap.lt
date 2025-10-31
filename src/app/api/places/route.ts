import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Pavyzdinė SQL užklausa - gauti visas vietas
    const result = await query(
      `SELECT 
        id, 
        name, 
        description,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        created_at
      FROM places
      ORDER BY created_at DESC`,
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Klaida gaunant vietas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Nepavyko gauti vietų iš duomenų bazės",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, longitude, latitude } = body;

    // Validacija
    if (!name || longitude === undefined || latitude === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Privalomi laukai: name, longitude, latitude",
        },
        { status: 400 },
      );
    }

    // Lietuvos ribos (iš Config.BOUNDS)
    const MIN_LONGITUDE = 20.7;
    const MAX_LONGITUDE = 27.05;
    const MIN_LATITUDE = 53.7;
    const MAX_LATITUDE = 56.65;

    // Validuojame koordinačių diapazonus (Lietuvos ribos)
    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      longitude < MIN_LONGITUDE ||
      longitude > MAX_LONGITUDE ||
      latitude < MIN_LATITUDE ||
      latitude > MAX_LATITUDE
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Koordinatės turi būti Lietuvos ribose. Longitude: ${MIN_LONGITUDE} iki ${MAX_LONGITUDE}, Latitude: ${MIN_LATITUDE} iki ${MAX_LATITUDE}`,
        },
        { status: 400 },
      );
    }

    // Įdėti naują vietą
    const result = await query(
      `INSERT INTO places (name, description, location)
       VALUES ($1, $2, ST_GeogFromText($3))
       RETURNING 
         id, 
         name, 
         description,
         ST_X(location::geometry) as longitude,
         ST_Y(location::geometry) as latitude,
         created_at`,
      [name, description, `POINT(${longitude} ${latitude})`],
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Klaida kuriant vietą:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Nepavyko sukurti vietos",
      },
      { status: 500 },
    );
  }
}
