import { type NextRequest, NextResponse } from "next/server";
import { interpretQuery } from "@/lib/llm";
import { searchPOI } from "@/lib/searchDb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Nenurodyta paieškos užklausa (parametras 'q')" },
        { status: 400 },
      );
    }

    // 1. Interpretuojame natūralios kalbos užklausą per LLM
    console.log("Interpretuojama užklausa:", query);
    const searchQuery = await interpretQuery(query);
    console.log("LLM interpretacija:", searchQuery);

    // 2. Ieškome POI duomenų bazėje
    const results = await searchPOI(searchQuery);
    console.log(`Rasta rezultatų: ${results.length}`);

    // 3. Grąžiname rezultatus
    return NextResponse.json({
      query: query,
      interpretation: searchQuery,
      results: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Paieškos klaida:", error);
    return NextResponse.json(
      {
        error: "Įvyko klaida vykdant paiešką",
        details: error instanceof Error ? error.message : "Nežinoma klaida",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || body.q;

    if (!query) {
      return NextResponse.json(
        { error: "Nenurodyta paieškos užklausa" },
        { status: 400 },
      );
    }

    // 1. Interpretuojame natūralios kalbos užklausą per LLM
    console.log("Interpretuojama užklausa:", query);
    const searchQuery = await interpretQuery(query);
    console.log("LLM interpretacija:", searchQuery);

    // 2. Ieškome POI duomenų bazėje
    const results = await searchPOI(searchQuery);
    console.log(`Rasta rezultatų: ${results.length}`);

    // 3. Grąžiname rezultatus
    return NextResponse.json({
      query: query,
      interpretation: searchQuery,
      results: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Paieškos klaida:", error);
    return NextResponse.json(
      {
        error: "Įvyko klaida vykdant paiešką",
        details: error instanceof Error ? error.message : "Nežinoma klaida",
      },
      { status: 500 },
    );
  }
}
