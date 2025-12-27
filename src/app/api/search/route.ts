import { type NextRequest, NextResponse } from "next/server";
import { search } from "@/data/search";

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

    const result = await search(text, [lng, lat]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Klaida ieškant vietų:", error);
    return NextResponse.json(
      { error: "Vidinė serverio klaida" },
      { status: 500 },
    );
  }
}
