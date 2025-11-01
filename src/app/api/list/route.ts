import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const bbox = searchParams.get("bbox");
		const types = searchParams.get("types") || searchParams.get("type") || "";

		if (!bbox) {
			return NextResponse.json([], { status: 400 });
		}

		// Parse bbox: left,bottom,right,top (in Mercator coordinates)
		const coords = bbox.split(",").map((c) => Number.parseFloat(c));
		if (coords.length !== 4 || coords.some((c) => Number.isNaN(c))) {
			return NextResponse.json([], { status: 400 });
		}

		const [left, bottom, right, top] = coords;

		// Build the parameters JSON for the list_poi function
		const params = {
			bbox: [left, bottom, right, top],
			types: types,
		};

		// Call the PostgreSQL function that will handle all filtering logic
		const result = await query(
			"SELECT list_poi($1::json) as result",
			[JSON.stringify(params)],
		);

		// The function returns a JSON array, so we just return it
		if (result.rows.length > 0 && result.rows[0].result) {
			return NextResponse.json(result.rows[0].result);
		}

		return NextResponse.json([]);
	} catch (error) {
		console.error("Klaida gaunant POI sąrašą:", error);
		return NextResponse.json([], { status: 500 });
	}
}
