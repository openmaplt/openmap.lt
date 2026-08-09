"use client";

import center from "@turf/center";
import { point } from "@turf/helpers";
import { Navigation } from "lucide-react";
import { useState } from "react";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { PoiPhotoGallery } from "@/components/gallery/PoiPhotoGallery";
import { PoiContent } from "@/components/PoiContent";
import { ProtectedPhotos } from "@/components/ProtectedPhotos";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PLACE_ICONS } from "@/config/places-icons";
import { useIsMobile } from "@/hooks/useIsMobile";
import { extractPoiData } from "@/lib/poiData";
import { toSafeHttpUrl } from "@/lib/utils";
import {
  useMapActions,
  useMapConfig,
  useMapSelection,
} from "@/providers/MapProvider";
import { useRoute } from "@/providers/RouteProvider";

export function PoiDetails() {
  const { selectedFeature: feature, selectedPoiId } = useMapSelection();
  const { handleOnPoiDetailsClose: onOpenChange, setMobileActiveMode } =
    useMapActions();
  const { activeMapProfile } = useMapConfig();
  const { routingEnabled, routingMode, setRouteEnd, setRoutingMode } =
    useRoute();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsExpanded(false);
      onOpenChange();
    }
  };

  const handleRouteHere = () => {
    if (!feature?.geometry) return;
    let coords: number[];
    try {
      coords = center(feature).geometry.coordinates;
    } catch {
      return;
    }

    setRouteEnd(
      point([coords[0], coords[1]], { name: feature.properties?.name ?? "" }),
    );
    if (!routingMode) {
      setRoutingMode(true);
      setMobileActiveMode("routing");
    }
    onOpenChange();
  };

  // Profilio deklaruotas papildomas panelės turinys (pvz. saugomų nuotraukos).
  const PoiPanelExtra =
    activeMapProfile.poiPanelExtra &&
    { protectedPhotos: ProtectedPhotos }[activeMapProfile.poiPanelExtra];

  if (!feature) return null;

  const category = PLACE_ICONS[feature.properties?.TYPE as string];
  const poiData = extractPoiData(feature.properties || {});
  // Only present for OSM-sourced POIs with an `image` tag — profiles that
  // fetch their own photos (e.g. "protected", via PoiPanelExtra) don't have
  // this attribute at all, so the two photo sources never overlap.
  const osmImageUrl = toSafeHttpUrl(
    poiData.attributes.find((attribute) => attribute.type === "image")?.value ??
      "",
  );

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
        closeButtonClassName={
          category
            ? "text-white hover:text-white/80 focus:ring-white"
            : undefined
        }
      >
        {isMobile && (
          <button
            type="button"
            className="flex items-center justify-center w-full pt-2 pb-1 shrink-0 outline-none"
            onClick={() => setIsExpanded((v) => !v)}
            style={category ? { backgroundColor: category.color } : undefined}
          >
            <div
              className={`w-10 h-1 rounded-full ${category ? "bg-white/40" : "bg-gray-300"}`}
            />
          </button>
        )}
        <SheetHeader
          className={`px-4 pt-2 shrink-0 gap-3 ${category ? "pb-4" : "pb-2"}`}
          style={category ? { backgroundColor: category.color } : undefined}
        >
          {category && (
            <span className="inline-flex w-fit items-center rounded-full border border-white/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              {category.name}
            </span>
          )}
          <SheetTitle
            className={`text-lg mr-5 ${category ? "text-white" : "text-foreground"}`}
          >
            {feature.properties?.name || "Be pavadinimo"}
          </SheetTitle>
        </SheetHeader>
        {routingEnabled && (
          <div className="flex items-center gap-3 px-4 py-2 border-b shrink-0">
            <button
              type="button"
              onClick={handleRouteHere}
              className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium outline-none"
            >
              <Navigation className="size-4" />
              Maršrutas
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto pt-4">
          <PoiContent data={poiData} />
          {PoiPanelExtra ? (
            <PoiPanelExtra feature={feature} />
          ) : (
            selectedPoiId != null && (
              <PoiPhotoGallery
                mapProfileId={activeMapProfile.id}
                objectRef={String(selectedPoiId)}
                poiName={feature.properties?.name ?? null}
                externalImages={
                  osmImageUrl
                    ? [
                        {
                          url: osmImageUrl,
                          name: feature.properties?.name,
                          // Not a license claim, just crediting the source —
                          // the OSM `image` tag is a bare URL with no
                          // per-photo author/license data of its own.
                          attribution: { source: "OpenStreetMap" },
                        },
                      ]
                    : []
                }
              />
            )
          )}
          <CommentsSection />
        </div>
      </SheetContent>
    </Sheet>
  );
}
