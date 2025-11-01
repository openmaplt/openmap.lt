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
