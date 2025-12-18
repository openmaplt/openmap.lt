import { redirect } from "next/navigation";
import { MapConfig } from "@/config/map";

export default function RootPage() {
  const {
    DEFAULT_MAP_TYPE,
    DEFAULT_ZOOM,
    DEFAULT_LATITUDE,
    DEFAULT_LONGITUDE,
  } = MapConfig;

  const newSearchParams = new URLSearchParams();
  newSearchParams.set("z", DEFAULT_ZOOM.toFixed(2));
  newSearchParams.set("lat", DEFAULT_LATITUDE.toFixed(5));
  newSearchParams.set("lng", DEFAULT_LONGITUDE.toFixed(5));
  newSearchParams.set("bearing", "0");
  newSearchParams.set("pitch", "0");

  redirect(
    `/${DEFAULT_MAP_TYPE}/map?${newSearchParams.toString()}`,
  );

  return null;
}
