"use client";

import { BicycleProfileComponents } from "@/components/BicycleProfileComponents";
import { CraftbeerFeature } from "@/components/CraftbeerFeature";
import { GeolocateControl } from "@/components/controls/GeolocateControl";
import { MapStyleSwitcherControl } from "@/components/controls/MapStyleSwitcherControl";
import { NavigationControl } from "@/components/controls/NavigationControl";
import { PlacesProfileComponents } from "@/components/PlacesProfileComponents";
import { PoiDetails } from "@/components/PoiDetails";
import { PoiInteraction } from "@/components/PoiInteraction";
import { ProtectedProfileComponents } from "@/components/ProtectedProfileComponents";
import { RiverProfileComponents } from "@/components/RiverProfileComponents";
import { RouteInteraction } from "@/components/route/RouteInteraction";
import { RouteManager } from "@/components/route/RouteManager";
import { useMapConfig } from "@/providers/MapProvider";

interface MapContentProps {
  initialFilterType?: string;
}

export function MapContent({ initialFilterType }: MapContentProps) {
  const { activeMapProfile } = useMapConfig();

  const FeatureComponent =
    activeMapProfile.featureComponent &&
    {
      places: PlacesProfileComponents,
      craftbeer: CraftbeerFeature,
      protected: ProtectedProfileComponents,
      bicycle: BicycleProfileComponents,
      river: RiverProfileComponents,
    }[activeMapProfile.featureComponent];

  return (
    <>
      {FeatureComponent && (
        <FeatureComponent initialFilterType={initialFilterType} />
      )}

      <div className="absolute left-3 top-3 [body:has(.search-container)_&]:top-14 z-[9] flex flex-col gap-2">
        <NavigationControl />
        <GeolocateControl />
      </div>
      <MapStyleSwitcherControl />

      <PoiInteraction />
      <PoiDetails />

      <RouteInteraction />
      <RouteManager />
    </>
  );
}
