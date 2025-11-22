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
import { useMediaQuery } from "@/hooks/use-media-query";
import { extractPoiData } from "@/lib/poiData";

interface PoiDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature | null;
}

export function PoiDetails({ open, onOpenChange, feature }: PoiDetailsProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
          side={isDesktop ? "left" : "bottom"}
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
