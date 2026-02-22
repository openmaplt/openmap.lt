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
  if (poiId && /^\d+$/.test(poiId)) {
    try {
      poiData = await getPoiInfo(poiId, mapType);
    } catch (error) {
      console.error('Error fetching POI info:', error);
      poiData = null;
    }
  }

  return (
    <MapPage
      initialPoiData={
        poiData && Object.entries(poiData).length > 0 ? poiData : null
      }
    />
  );
}
