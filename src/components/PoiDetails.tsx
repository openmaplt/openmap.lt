"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
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
  const { handleOnPoiDetailsClose: onOpenChange, mapRef } = useMapActions();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const open = !!feature;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsExpanded(false);
      onOpenChange();
    }
  };

  const center = getFeatureCenter(feature);
  const lng = center?.[0];
  const lat = center?.[1];

  // Pastumiam žemėlapį, kad markeris liktų matomoje srityje ir jo neuždengtų
  // detalių skydelis (apačioje mobilioje, kairėje – desktop'e).
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || lng === undefined || lat === undefined) return;
    const offset: [number, number] = isMobile
      ? [0, -Math.round(window.innerHeight * 0.2)]
      : [192, 0];
    map.panTo([lng, lat], { offset, duration: 500 });
  }, [lng, lat, isMobile, mapRef]);

  if (!feature || lng === undefined || lat === undefined) {
    return null;
  }

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
      <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
        <SheetContent
          side={isMobile ? "bottom" : "left"}
          className="!p-0 !gap-0 flex flex-col"
          style={{
            height: isMobile ? (isExpanded ? "95dvh" : "40dvh") : "100vh",
            transition: "height 0.3s ease",
          }}
          aria-describedby={undefined}
        >
          {isMobile && (
            <button
              type="button"
              className="flex items-center justify-center w-full pt-2 pb-1 shrink-0"
              onClick={() => setIsExpanded((v) => !v)}
            >
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </button>
          )}
          <SheetHeader className="px-4 pt-2 pb-3 shrink-0">
            <SheetTitle className="text-lg text-foreground mr-5">
              {feature.properties?.name || "Be pavadinimo"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <PoiContent data={extractPoiData(feature.properties || {})} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
