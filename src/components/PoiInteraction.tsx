import type { Feature } from "geojson";
import type { MapSourceDataEvent } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useMapInteraction } from "@/hooks/use-map-interaction";
import { usePoiEnrichment } from "@/hooks/use-poi-enrichment";
import { getPoiFromObjectId } from "@/lib/poiHelpers";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";

interface PoiInteractionProps {
  poiId?: string | null;
  onSelectFeature: (feature: Feature | null) => void;
  layers?: string[];
  getLayerLabel?: (layerId: string) => string;
}

export function PoiInteraction({
  onSelectFeature,
  poiId,
  layers = [],
  getLayerLabel,
}: PoiInteractionProps) {
  const { current: mapRef } = useMap();
  const { enrichFeature } = usePoiEnrichment();
  const lastSelectedPoiIdRef = useRef<string | null>(null);
  const isMobile = useIsMobile();
  const [candidateFeatures, setCandidateFeatures] = useState<Feature[]>([]);

  useMapInteraction({
    layers,
    onSelectFeatures: async (features) => {
      if (features.length === 0) {
        lastSelectedPoiIdRef.current = null;
        onSelectFeature(null);
        setCandidateFeatures([]);
        return;
      }

      if (features.length === 1) {
        const enriched = await enrichFeature(features[0]);
        lastSelectedPoiIdRef.current = (
          enriched?.properties?.id ?? enriched?.id
        )?.toString();
        onSelectFeature(enriched);
        setCandidateFeatures([]);
      } else {
        setCandidateFeatures(features);
      }
    },
  });

  // Handle object ID changes from URL
  useEffect(() => {
    if (!poiId) {
      onSelectFeature(null);
      lastSelectedPoiIdRef.current = null;
      return;
    }

    // If already selected, don't re-select
    if (lastSelectedPoiIdRef.current === poiId) return;

    const map = mapRef?.getMap();
    if (!map) return;

    const displayPoi = async () => {
      if (lastSelectedPoiIdRef.current === poiId) return;

      for (const layerId of layers) {
        const feature = getPoiFromObjectId(map, layerId, poiId);
        if (feature) {
          lastSelectedPoiIdRef.current = poiId;
          const enriched = await enrichFeature(feature);
          onSelectFeature(enriched);
          break;
        }
      }
    };

    const handleSourceData = (e: MapSourceDataEvent) => {
      if (e.isSourceLoaded) {
        displayPoi();
      }
    };

    if (map.isStyleLoaded()) {
      displayPoi();
    } else {
      map.once("load", displayPoi);
    }

    map.on("sourcedata", handleSourceData);

    return () => {
      if (!map) return;
      map.off("sourcedata", handleSourceData);
    };
  }, [mapRef, onSelectFeature, poiId, enrichFeature, layers]);

  const handleSelectCandidate = async (feature: Feature) => {
    const enriched = await enrichFeature(feature);
    lastSelectedPoiIdRef.current = (
      enriched?.properties?.id ?? enriched?.id
    )?.toString();
    onSelectFeature(enriched);
    setCandidateFeatures([]);
  };

  return (
    <Sheet
      open={candidateFeatures.length > 0}
      onOpenChange={(open) => !open && setCandidateFeatures([])}
    >
      <SheetContent side={isMobile ? "bottom" : "left"} className="p-0 gap-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Pasirinkite objektą</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col overflow-y-auto">
          {candidateFeatures.map((feature, index) => (
            <button
              type="button"
              key={`${feature.id}-${index}`}
              className="flex flex-col items-start px-4 py-4 hover:bg-accent transition-colors border-b text-left w-full"
              onClick={() => handleSelectCandidate(feature)}
            >
              <span className="font-medium text-foreground">
                {feature.properties?.name || "Be pavadinimo"}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">
                {getLayerLabel?.((feature as any).layer?.id) ||
                  (feature as any).layer?.id}
              </span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
