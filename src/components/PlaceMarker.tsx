"use client";

import { MapPin } from "lucide-react";
import * as React from "react";
import { Marker } from "react-map-gl/maplibre";
import { PLACES_FILTERS } from "@/config/places-filters";
import type { Place } from "@/hooks/use-places";
import { cn } from "@/lib/utils";

interface PlaceMarkerProps {
  place: Place;
  onClick?: (place: Place) => void;
}

export function PlaceMarker({ place, onClick }: PlaceMarkerProps) {
  // Find category and specific item for this place type
  const { category, item } = React.useMemo(() => {
    for (const cat of PLACES_FILTERS) {
      const foundItem = cat.items.find((i) => i.id === place.type);
      if (foundItem) {
        return { category: cat, item: foundItem };
      }
    }
    return { category: null, item: null };
  }, [place.type]);

  const Icon = item?.icon || MapPin;
  const color = category?.color || "bg-gray-500";

  // Extract name from attr array
  const nameObj = place.attr.find((a) => "name" in a);
  const name = nameObj ? nameObj.name : "Be pavadinimo";

  return (
    <Marker
      longitude={place.geom[0]}
      latitude={place.geom[1]}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(place);
      }}
    >
      <div className="group relative flex flex-col items-center hover:z-50">
        <div
          className={cn(
            "p-1.5 rounded-full text-white shadow-md transition-transform group-hover:scale-110 border-2 border-white",
            color,
          )}
        >
          <Icon className="size-4" />
        </div>
        {/* Tooltip on hover */}
        <div className="absolute bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded z-50">
          {name}
        </div>
      </div>
    </Marker>
  );
}
