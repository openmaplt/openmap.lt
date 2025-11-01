import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: "Privalomas parametras: type",
        },
        { status: 400 },
      );
    }

    // Build WHERE clause based on category type (matching category.php logic)
    let whereClause = "";
    let categoryName = "";

    switch (type) {
      case "A":
        categoryName = "Piliakalniai";
        whereClause =
          "(historic = 'archaeological_site' AND site_type = 'fortification')";
        break;
      case "B":
        categoryName = "Pilkapynai";
        whereClause =
          "(historic = 'archaeological_site' AND site_type = 'tumulus')";
        break;
      case "C":
        categoryName = "Dvarai";
        whereClause = "(historic = 'manor')";
        break;
      case "D":
        categoryName = "Paminklai";
        whereClause = "(historic IN ('monument', 'memorial'))";
        break;
      case "E":
        categoryName = "Kitos istorinės vietos";
        whereClause =
          "(historic IS NOT NULL AND historic NOT IN ('manor', 'monastery', 'archaeological_site', 'monument', 'memorial'))";
        break;
      case "F":
        categoryName = "Apžvalgos bokštai";
        whereClause =
          "(man_made IN ('tower', 'communications_tower') AND \"tower:type\" IS NOT NULL AND tourism IN ('attraction', 'viewpoint', 'museum') AND COALESCE(access, 'yes') != 'no')";
        break;
      case "G":
        categoryName = "Lankytinos vietos";
        whereClause =
          "(tourism IN ('attraction', 'theme_park', 'zoo', 'aquarium'))";
        break;
      case "H":
        categoryName = "Regyklos";
        whereClause = "(tourism = 'viewpoint')";
        break;
      case "I":
        categoryName = "Muziejai";
        whereClause = "(tourism = 'museum')";
        break;
      case "1":
        categoryName = "Pažintiniai takai";
        whereClause =
          "(tourism = 'attraction' AND \"attraction:type\" = 'hiking_route')";
        break;
      case "J":
        categoryName = "Katalikų maldos namai";
        whereClause =
          "(amenity = 'place_of_worship' AND religion = 'christian' AND denomination IN ('catholic', 'roman_catholic'))";
        break;
      case "K":
        categoryName = "Evangelikų liuteronų maldos namai";
        whereClause =
          "(amenity = 'place_of_worship' AND religion = 'christian' AND denomination IN ('lutheran', 'evangelical', 'reformed'))";
        break;
      case "L":
        categoryName = "Provoslavų maldos namai";
        whereClause =
          "(amenity = 'place_of_worship' AND religion = 'christian' AND denomination IN ('orthodox', 'old_believers'))";
        break;
      case "M":
        categoryName = "Kitų religijų maldos namai";
        whereClause =
          "(amenity = 'place_of_worship' AND (religion != 'christian' OR COALESCE(denomination, '@') NOT IN ('catholic', 'roman_catholic', 'lutheran', 'evangelical', 'reformed', 'orthodox', 'old_believers')))";
        break;
      case "X":
        categoryName = "Vienuolynai";
        whereClause = "(historic = 'monastery')";
        break;
      case "2":
        categoryName = "Policijos nuovados";
        whereClause = "(amenity = 'police')";
        break;
      case "3":
        categoryName = "Gamtos objektai";
        whereClause = "(\"natural\" IN ('tree', 'stone', 'spring'))";
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Nežinomas kategorijos tipas",
          },
          { status: 400 },
        );
    }

    // Query to get places by category
    const result = await query(
      `SELECT 
        id,
        name,
        description,
        ST_X(location::geometry) as lon,
        ST_Y(location::geometry) as lat,
        ST_AsGeoJSON(location::geometry) as geojson
      FROM places
      WHERE ${whereClause}
      ORDER BY name
      LIMIT 100`,
    );

    return NextResponse.json({
      success: true,
      category: categoryName,
      data: result.rows.map((row) => ({
        id: row.id,
        name: row.name || "Be pavadinimo",
        description: row.description,
        lat: row.lat,
        lon: row.lon,
        geometry: JSON.parse(row.geojson),
      })),
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Klaida gaunant kategorijos duomenis:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Nepavyko gauti kategorijos duomenų",
      },
      { status: 500 },
    );
  }
}
