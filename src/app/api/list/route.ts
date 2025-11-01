import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bbox = searchParams.get("bbox");
    const type = searchParams.get("type") || "n"; // default: fuel stations

    if (!bbox) {
      return NextResponse.json(
        {
          type: "FeatureCollection",
          features: [],
        },
        { status: 400 },
      );
    }

    // Parse bbox: left,bottom,right,top
    const coords = bbox.split(",").map((c) => Number.parseFloat(c));
    if (coords.length !== 4 || coords.some((c) => Number.isNaN(c))) {
      return NextResponse.json(
        {
          type: "FeatureCollection",
          features: [],
        },
        { status: 400 },
      );
    }

    let [left, bottom, right, top] = coords;

    // Fix common mistakes
    if (left > right) {
      [left, right] = [right, left];
    }
    if (bottom > top) {
      [bottom, top] = [top, bottom];
    }

    // Build WHERE clause based on type parameter (matching list.php logic)
    const filters: string[] = [];

    for (const char of type) {
      switch (char) {
        case "a": // kiti istoriniai
          filters.push(
            "(historic IS NOT NULL AND historic NOT IN ('monument', 'memorial', 'wayside_cross', 'wayside_shrine', 'manor') AND (historic != 'archaeological_site' OR site_type NOT IN ('fortification', 'tumulus')))",
          );
          break;
        case "b": // hillfort
          filters.push(
            "(historic = 'archaeological_site' AND site_type = 'fortification')",
          );
          break;
        case "c": // heritage
          filters.push(
            "((\"ref:lt:kpd\" IS NOT NULL) AND (COALESCE(historic, '@') != 'archaeological_site' OR COALESCE(site_type, '@') != 'fortification'))",
          );
          break;
        case "d": // paminklas
          filters.push("(historic IN ('monument', 'memorial'))");
          break;
        case "e": // pilkapiai
          filters.push(
            "(historic = 'archaeological_site' AND site_type = 'tumulus')",
          );
          break;
        case "f": // dvarai
          filters.push("(historic = 'manor')");
          break;
        case "g": // towers
          filters.push(
            "(man_made IN ('tower', 'communications_tower') AND \"tower:type\" IS NOT NULL AND tourism IN ('attraction', 'viewpoint', 'museum') AND COALESCE(access, 'yes') != 'no')",
          );
          break;
        case "h": // attractions
          filters.push(
            "(tourism IN ('attraction', 'theme_park', 'zoo', 'aquarium') AND historic IS NULL AND \"attraction:type\" IS NULL)",
          );
          break;
        case "W": // viewpoint
          filters.push("(tourism = 'viewpoint' AND historic IS NULL)");
          break;
        case "i": // museums
          filters.push("(tourism = 'museum')");
          break;
        case "j": // picnic with fireplace
          filters.push(
            "((tourism = 'picnic_site' OR amenity = 'shelter') AND fireplace = 'yes')",
          );
          break;
        case "k": // picnic without fireplace
          filters.push(
            "((tourism = 'picnic_site' OR amenity = 'shelter') AND (fireplace IS NULL OR fireplace = 'no'))",
          );
          break;
        case "l": // camping
          filters.push("(tourism IN ('camp_site', 'caravan_site'))");
          break;
        case "m": // guest houses
          filters.push(
            "(tourism IN ('chalet', 'hostel', 'motel', 'guest_house'))",
          );
          break;
        case "n": // fuel
          filters.push("(amenity = 'fuel')");
          break;
        case "o": // cafe
          filters.push("(amenity = 'cafe')");
          break;
        case "p": // fast_food
          filters.push("(amenity = 'fast_food')");
          break;
        case "q": // restaurant
          filters.push("(amenity = 'restaurant')");
          break;
        case "r": // pub/bar
          filters.push("(amenity IN ('pub', 'bar'))");
          break;
        case "s": // hotel
          filters.push("(tourism = 'hotel')");
          break;
        case "t": // information
          filters.push("(tourism = 'information')");
          break;
        case "u": // theatre
          filters.push("(amenity = 'theatre')");
          break;
        case "v": // cinema
          filters.push("(amenity = 'cinema')");
          break;
        case "w": // speed camera
          filters.push("(highway = 'speed_camera')");
          break;
        case "x": // arts centre
          filters.push("(amenity = 'arts_centre')");
          break;
        case "y": // library
          filters.push("(amenity = 'library')");
          break;
        case "z": // hospital
          filters.push("(amenity = 'hospital')");
          break;
        case "A": // clinic
          filters.push("(amenity = 'clinic')");
          break;
        case "B": // dentist
          filters.push("(amenity = 'dentist')");
          break;
        case "C": // doctors
          filters.push("(amenity = 'doctors')");
          break;
        case "D": // pharmacy
          filters.push("(amenity = 'pharmacy')");
          break;
        case "E": // supermarket
          filters.push("(shop IN ('supermarket', 'mall'))");
          break;
        case "F": // convenience
          filters.push("(shop = 'convenience')");
          break;
        case "G": // car_repair
          filters.push("(shop = 'car_repair')");
          break;
        case "H": // kiosk
          filters.push("(shop = 'kiosk')");
          break;
        case "I": // DIY
          filters.push("(shop = 'doityourself')");
          break;
        case "J": // Catholic
          filters.push(
            "(amenity = 'place_of_worship' AND religion = 'christian' AND denomination IN ('catholic', 'roman_catholic'))",
          );
          break;
        case "K": // Lutheran
          filters.push(
            "(amenity = 'place_of_worship' AND religion = 'christian' AND denomination IN ('lutheran', 'evangelical', 'reformed'))",
          );
          break;
        case "L": // Orthodox
          filters.push(
            "(amenity = 'place_of_worship' AND religion = 'christian' AND denomination IN ('orthodox', 'old_believers'))",
          );
          break;
        case "M": // Other religions
          filters.push(
            "(amenity = 'place_of_worship' AND (religion != 'christian' OR COALESCE(denomination, '@') NOT IN ('catholic', 'roman_catholic', 'lutheran', 'evangelical', 'reformed', 'orthodox', 'old_believers')))",
          );
          break;
        case "N": // Government
          filters.push("(office = 'government' OR amenity = 'townhall')");
          break;
        case "O": // Courthouse
          filters.push("(amenity = 'courthouse')");
          break;
        case "P": // Notary/lawyer
          filters.push("(office IN ('notary', 'lawyer'))");
          break;
        case "Q": // Other offices
          filters.push(
            "(office IS NOT NULL AND office NOT IN ('government', 'notary', 'lawyer', 'insurance'))",
          );
          break;
        case "R": // Other shops
          filters.push(
            "(shop IS NOT NULL AND shop NOT IN ('supermarket', 'mall', 'convenience', 'car_repair', 'kiosk', 'doityourself'))",
          );
          break;
        case "S": // Post office
          filters.push("(amenity = 'post_office')");
          break;
        case "T": // Car wash
          filters.push("(amenity = 'car_wash')");
          break;
        case "U": // Bank
          filters.push("(amenity = 'bank')");
          break;
        case "V": // ATM
          filters.push("(amenity = 'atm')");
          break;
        case "X": // Monastery
          filters.push("(historic = 'monastery')");
          break;
        case "Y": // Insurance
          filters.push("(office = 'insurance')");
          break;
        case "Z": // Police
          filters.push("(amenity = 'police')");
          break;
        case "1": // Hiking routes
          filters.push(
            "(tourism = 'attraction' AND \"attraction:type\" = 'hiking_route')",
          );
          break;
        case "3": // Natural objects
          filters.push("(\"natural\" IN ('tree', 'stone', 'spring'))");
          break;
        default:
          // Skip unknown type codes
          continue;
      }
    }

    if (filters.length === 0) {
      return NextResponse.json({
        type: "FeatureCollection",
        bbox: [left, bottom, right, top],
        features: [],
      });
    }

    const whereClause = filters.join(" OR ");

    // Query to get POI within bounding box
    const result = await query(
      `SELECT 
        id,
        name,
        description,
        ST_Y(location::geometry) as lat,
        ST_X(location::geometry) as lon,
        ST_AsGeoJSON(location::geometry) as geojson
      FROM places
      WHERE (${whereClause})
        AND ST_X(location::geometry) BETWEEN $1 AND $2
        AND ST_Y(location::geometry) BETWEEN $3 AND $4
      LIMIT 1000`,
      [left, right, bottom, top],
    );

    // Format as GeoJSON FeatureCollection
    const features = result.rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geojson),
      properties: {
        title: row.name || "Be pavadinimo",
        description: row.description,
      },
      id: row.id,
    }));

    return NextResponse.json({
      type: "FeatureCollection",
      bbox: [left, bottom, right, top],
      features,
    });
  } catch (error) {
    console.error("Klaida gaunant POI sąrašą:", error);
    return NextResponse.json(
      {
        type: "FeatureCollection",
        features: [],
      },
      { status: 500 },
    );
  }
}
