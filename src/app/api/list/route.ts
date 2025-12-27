import { type NextRequest, NextResponse } from "next/server";
import { getPoiList } from "@/data/poiList";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bbox = searchParams.get("bbox");
    const types = searchParams.get("types") || searchParams.get("type") || "";

    if (!bbox) {
      return NextResponse.json({ error: "Nenurodytas bbox" }, { status: 400 });
    }

    // Parse bbox: left,bottom,right,top (in Mercator coordinates)
    const coords = bbox.split(",").map((c) => Number.parseFloat(c));
    if (coords.length !== 4 || coords.some((c) => Number.isNaN(c))) {
      return NextResponse.json(
        [{ error: "Blogas bbox parametras. Formatas: left,bottom,right,top" }],
        { status: 400 },
      );
    }

    const result = await getPoiList(coords, types);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Klaida gaunant POI sąrašą:", error);
    return NextResponse.json([], { status: 500 });
  }
}
