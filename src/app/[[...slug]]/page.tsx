import { getPoiInfo } from "@/data/poiInfo";
import MapPage from "./_components/MapPage";

export default async function Page({ params }: PageProps<"/[[...slug]]">) {
  const { slug } = await params;

  // URL structure: /mapType/poiSlug or /mapType
  // slug[0] is mapType, slug[1] is poiSlug
  const mapType = slug?.[0] ?? undefined;
  const poiSlug = slug?.[1] ?? undefined;
  const poiId = poiSlug !== "map" ? poiSlug?.split("-")[0] : undefined;

  let poiData = null;
  if (poiId) {
    const id = Number.parseInt(poiId, 10);
    if (!Number.isNaN(id)) {
      poiData = await getPoiInfo(id, mapType);
    }
  }

  return <MapPage initialPoiData={poiData} />;
}
