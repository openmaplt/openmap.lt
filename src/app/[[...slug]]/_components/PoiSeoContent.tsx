import type { Geometry, Point } from "geojson";
import { JsonLd } from "@/components/JsonLd";
import { PoiContent } from "@/components/PoiContent";
import { extractPoiData, type PoiProperties } from "@/lib/poiData";
import { formatWikipediaUrl } from "@/lib/poiHelpers";
import { toSafeHttpUrl } from "@/lib/utils";

interface PoiData {
  geometry?: Geometry | null;
  properties?: PoiProperties | null;
}

/**
 * Server-rendered, crawlable content for a POI page. The page itself is a
 * full-screen client map, so Googlebot would otherwise see almost no text
 * ("thin content"). Renders the exact same PoiContent the interactive popup
 * shows (address, hours, phone, etc.) — visually hidden but in the DOM — so the
 * crawler gets full content parity, plus a TouristAttraction JSON-LD block.
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

  // OSM tags are user-editable, so URLs are untrusted — only allow real http(s)
  // URLs before putting them in the JSON-LD.
  const image = props.image ? toSafeHttpUrl(props.image) : null;
  const website = props.website ? toSafeHttpUrl(props.website) : null;
  const wikipediaUrl = props.wikipedia
    ? formatWikipediaUrl(props.wikipedia)?.url
    : undefined;

  const point: Point | null =
    poiData.geometry?.type === "Point" ? poiData.geometry : null;

  // OSM address tags: structured addr:* keys, with a pre-composed `address`
  // string as fallback.
  const asString = (value: unknown): string | undefined =>
    typeof value === "string" && value ? value : undefined;
  const streetAddress =
    [asString(props["addr:street"]), asString(props["addr:housenumber"])]
      .filter(Boolean)
      .join(" ") || asString(props.address);
  const addressLocality = asString(props["addr:city"]);
  const postalCode = asString(props["addr:postcode"]);

  const sameAs = [website, wikipediaUrl].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name,
    url,
    ...(props.description && { description: props.description }),
    ...(image && { image }),
    ...(props.phone && { telephone: props.phone }),
    ...(props.email && { email: props.email }),
    ...(point && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: point.coordinates[1],
        longitude: point.coordinates[0],
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
    address: {
      "@type": "PostalAddress",
      ...(streetAddress && { streetAddress }),
      ...(addressLocality && { addressLocality }),
      ...(postalCode && { postalCode }),
      addressCountry: "LT",
    },
  };

  // Drop osmLink: the "OSM"/"Edit" links are editor tooling, not content a
  // crawler should index or follow.
  const { attributes } = extractPoiData(props);

  return (
    <>
      <article className="sr-only">
        <h1>{name}</h1>
        <PoiContent data={{ attributes }} />
      </article>
      <JsonLd data={jsonLd} />
    </>
  );
}
