"use client";

import { CraftbeerFeature } from "@/components/CraftbeerFeature";
import { MapStyleSwitcher } from "@/components/MapStyleSwitcher";
import { PlacesProfileComponents } from "@/components/PlacesProfileComponents";
import { PoiDetails } from "@/components/PoiDetails";
import { PoiInteraction } from "@/components/PoiInteraction";
import { ProtectedProfileComponents } from "@/components/ProtectedProfileComponents";
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
    }[activeMapProfile.featureComponent];

  return (
    <>
      {FeatureComponent && (
        <FeatureComponent initialFilterType={initialFilterType} />
      )}
      <PoiInteraction />
      <MapStyleSwitcher />
      <PoiDetails />
    </>
  );
}
