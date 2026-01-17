"use client";

import type { Feature } from "geojson";
import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";
import { useEffect, useState } from "react";
import { PoiContent } from "@/components/PoiContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { extractPoiData } from "@/lib/poiData";
import { getPoiOne } from "@/data/poiInfo";

interface PoiDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: Feature | null;
}

export function PoiDetails({ open, onOpenChange, feature }: PoiDetailsProps) {
  const isMobile = useIsMobile();
  const [enrichedFeature, setEnrichedFeature] = useState<Feature | null>(null);

  useEffect(() => {
    if (!feature) {
      setEnrichedFeature(null);
      return;
    }

    // If source is 'stvk', fetch enriched data
    const featureWithSource = feature as any;
    if (featureWithSource.source === "stvk" && feature.properties?.id) {
      getPoiOne(feature.properties.id, "s")
        .then((poiFeature) => {
          if (poiFeature) {
            // Replace with the enriched feature from database
            setEnrichedFeature(poiFeature);
          } else {
            setEnrichedFeature(feature);
          }
        })
        .catch((error) => {
          console.error("Error fetching enriched POI info:", error);
          setEnrichedFeature(feature);
        });
    } else {
      setEnrichedFeature(feature);
    }
  }, [feature]);

  const currentFeature = enrichedFeature || feature;

  if (
    !currentFeature ||
    (currentFeature.geometry.type !== "Point" &&
      currentFeature.geometry.type !== "Polygon")
  ) {
    return null;
  }

  const poiData = currentFeature
    ? {
        data: extractPoiData(currentFeature.properties || {}),
        name:
          currentFeature.properties?.name ||
          currentFeature.properties?.pavadinimas ||
          "Be pavadinimo",
      }
    : null;

  // Extract coordinates: Point has direct [lng, lat], Polygon needs centroid calculation
  // TODO: later change to GIS point in polygon function, because for some geometries
  //       centroid could be out of actual polygon geometry.
  let lng: number;
  let lat: number;

  if (currentFeature.geometry.type === "Point") {
    [lng, lat] = currentFeature.geometry.coordinates as [number, number];
  } else if (currentFeature.geometry.type === "Polygon") {
    // Calculate centroid of the polygon (outer ring only)
    const coordinates = currentFeature.geometry.coordinates[0] as Array<
      [number, number]
    >;
    let sumLng = 0;
    let sumLat = 0;
    for (const [lon, la] of coordinates) {
      sumLng += lon;
      sumLat += la;
    }
    lng = sumLng / coordinates.length;
    lat = sumLat / coordinates.length;
  } else {
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
