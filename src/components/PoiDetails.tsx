"use client";

import type { Feature } from "geojson";
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

interface PoiDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature | null;
}

export function PoiDetails({ open, onOpenChange, feature }: PoiDetailsProps) {
  const isMobile = useIsMobile();

  if (!feature || feature.geometry.type !== "Point") {
    return null;
  }

  const poiData = feature
    ? {
        data: extractPoiData(feature.properties || {}),
        name: feature.properties?.name || "Be pavadinimo",
      }
    : null;

  const [lng, lat] = feature.geometry.coordinates;

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
        >
          <SheetHeader>
            <SheetTitle className="text-lg text-foreground mr-5">
              {poiData?.name}
            </SheetTitle>
          </SheetHeader>
          {poiData && <PoiContent data={poiData.data} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
