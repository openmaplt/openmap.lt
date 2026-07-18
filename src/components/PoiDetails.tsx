"use client";

import { useState } from "react";
import { PoiContent } from "@/components/PoiContent";
import { ProtectedPhotos } from "@/components/ProtectedPhotos";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { extractPoiData } from "@/lib/poiData";
import {
  useMapActions,
  useMapConfig,
  useMapSelection,
} from "@/providers/MapProvider";

export function PoiDetails() {
  const { selectedFeature: feature } = useMapSelection();
  const { handleOnPoiDetailsClose: onOpenChange } = useMapActions();
  const { activeMapProfile } = useMapConfig();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsExpanded(false);
      onOpenChange();
    }
  };

  // Profilio deklaruotas papildomas panelės turinys (pvz. saugomų nuotraukos).
  const PoiPanelExtra =
    activeMapProfile.poiPanelExtra &&
    { protectedPhotos: ProtectedPhotos }[activeMapProfile.poiPanelExtra];

  if (!feature) return null;

  return (
    <Sheet open onOpenChange={handleOpenChange} modal={false}>
      <SheetContent
        // Let map clicks through instead of closing on outside-interaction:
        // clicking empty map clears the selection (closes), clicking another
        // feature switches the content — both handled by PoiInteraction.
        preventOutsideClose
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
          {PoiPanelExtra && <PoiPanelExtra feature={feature} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
