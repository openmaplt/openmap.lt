import type { Geometry, Point } from "geojson";
import { JsonLd } from "@/components/JsonLd";
import { formatWikipediaUrl } from "@/lib/poiHelpers";
import { toSafeHttpUrl } from "@/lib/utils";

interface PoiData {
  geometry?: Geometry | null;
  properties?: Record<string, string | undefined> | null;
}

/**
 * Server-rendered, crawlable content for a POI page. The page itself is a
 * full-screen client map, so Googlebot would otherwise see almost no text
 * ("thin content"). This renders the POI's name, description and metadata into
 * the DOM (visually hidden but accessible) plus a Place JSON-LD block, so the
 * page has real indexable content and structured data.
 */
export function PoiSeoContent({
  poiData,
  url,
}: {
  poiData: PoiData;
  url: string;
}) {
  const props = poiData.properties ?? {};
  const name = props.name;
  if (!name) return null;

  // OSM tags are editable by anyone, so URLs are untrusted — only allow real
  // http(s) URLs (blocks javascript:/data: in href and in the JSON-LD).
  // OSM tags are editable by anyone, so URLs are untrusted — only allow real
  // http(s) URLs (blocks javascript:/data: in href and in the JSON-LD).
  const description = props.description;
  const image = props.image ? toSafeHttpUrl(props.image) : null;
  const website = props.website ? toSafeHttpUrl(props.website) : null;
  const wikipediaUrl = props.wikipedia
    ? formatWikipediaUrl(props.wikipedia)?.url
    : undefined;

  const point: Point | null =
    poiData.geometry?.type === "Point" ? poiData.geometry : null;

  const sameAs = [website, wikipediaUrl].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name,
    url,
    ...(description && { description }),
    ...(image && { image }),
    ...(point && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: point.coordinates[1],
        longitude: point.coordinates[0],
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
    address: { "@type": "PostalAddress", addressCountry: "LT" },
  };

  return (
    <>
      <article className="sr-only">
        <h1>{name}</h1>
        {description && <p>{description}</p>}
        {website && (
          <p>
            Šaltinis: <a href={website}>{website}</a>
          </p>
        )}
        {wikipediaUrl && (
          <p>
            Vikipedija: <a href={wikipediaUrl}>{name}</a>
          </p>
        )}
      </article>
      <JsonLd data={jsonLd} />
    </>
  );
}
