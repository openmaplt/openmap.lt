import { type NextRequest, NextResponse } from "next/server";
import { getPoiInfo } from "@/data/poiInfo";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const mapType = searchParams.get("mapType");

    if (!id) {
      return NextResponse.json(
        { error: "Nenurodytas id parametras" },
        { status: 400 },
      );
    }

    const poiId = Number.parseInt(id, 10);
    if (Number.isNaN(poiId)) {
      return NextResponse.json(
        { error: "Blogas id parametras. Turi būti skaičius" },
        { status: 400 },
      );
    }

    const result = await getPoiInfo(poiId, mapType);

    if (result) {
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "POI nerastas" }, { status: 404 });
  } catch (error) {
    console.error("Klaida gaunant POI informaciją:", error);
    return NextResponse.json(
      { error: "Vidinė serverio klaida" },
      { status: 500 },
    );
  }
}
