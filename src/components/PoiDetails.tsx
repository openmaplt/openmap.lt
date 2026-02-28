"use client";

import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";
import { PoiContent } from "@/components/PoiContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { extractPoiData } from "@/lib/poiData";
import { getFeatureCenter } from "@/lib/poiHelpers";
import { useMapActions, useMapSelection } from "@/providers/MapProvider";

export function PoiDetails() {
  const { selectedFeature: feature } = useMapSelection();
  const { handleOnPoiDetailsClose: onOpenChange } = useMapActions();
  const isMobile = useIsMobile();

  const open = !!feature;

  const center = getFeatureCenter(feature);

  if (!feature || !center) {
    return null;
  }

  const [lng, lat] = center;

  return (
    <>
      <Marker longitude={lng} latitude={lat} anchor="center">
        <div className="relative flex flex-col items-center justify-center w-8 h-8">
          <div className="absolute bottom-full animate-bounce">
            <MapPin
              className="w-8 h-8 text-blue-600 fill-blue-600 drop-shadow-md"
              stroke="white"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </Marker>
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side={isMobile ? "bottom" : "left"}
          className="overflow-y-auto gap-1"
          aria-describedby={undefined}
        >
          <SheetHeader>
            <SheetTitle className="text-lg text-foreground mr-5">
              {feature.properties?.name || "Be pavadinimo"}
            </SheetTitle>
          </SheetHeader>
          <PoiContent data={extractPoiData(feature.properties || {})} />
        </SheetContent>
      </Sheet>
    </>
  );
}
