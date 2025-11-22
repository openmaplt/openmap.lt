import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pos = searchParams.get("pos");
    const text = searchParams.get("text");

    if (!pos) {
      return NextResponse.json(
        { error: "Nenurodytas pos parametras" },
        { status: 400 },
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "Nenurodytas text parametras" },
        { status: 400 },
      );
    }

    // Parse pos: lng,lat
    const coords = pos.split(",").map((c) => Number.parseFloat(c));
    if (coords.length !== 2 || coords.some((c) => Number.isNaN(c))) {
      return NextResponse.json(
        [{ error: "Blogas pos parametras. Formatas: lng,lat" }],
        { status: 400 },
      );
    }

    const [lng, lat] = coords;

    // Build the parameters JSON for the places.search function
    const params = {
      pos: [lng, lat],
      text: text,
    };

    // Call the PostgreSQL function
    const result = await query("SELECT places.search($1::jsonb) as result", [
      JSON.stringify(params),
    ]);

    // The function returns a JSON object (FeatureCollection)
    if (result.rows.length > 0 && result.rows[0].result) {
      return NextResponse.json(result.rows[0].result);
    }

    return NextResponse.json({ type: "FeatureCollection", features: [] });
  } catch (error) {
    console.error("Klaida ieškant vietų:", error);
    return NextResponse.json(
      { error: "Vidinė serverio klaida" },
      { status: 500 },
    );
  }
}
