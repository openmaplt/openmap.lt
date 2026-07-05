"use client";

import { useEffect, useState } from "react";
import { useActiveInstruction } from "@/hooks/use-active-instruction";
import { useRouteMapFocus } from "@/hooks/use-route-map-focus";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useNavigationProgress,
  useRoute,
  useRouteResult,
} from "@/providers/RouteProvider";
import { NavigationInstructionBanner } from "./NavigationInstructionBanner";
import { NavigationProgressBar } from "./NavigationProgressBar";
import { NavigationStepsSheet } from "./NavigationStepsSheet";

/** Compact turn-by-turn navigation UI shown over the map on mobile. */
export function MobileNavigationView() {
  const isMobile = useIsMobile();
  const [showFullList, setShowFullList] = useState(false);
  const {
    routingMode,
    navigationMode,
    selectedRouteProfile,
    routeStart,
    routeEnd,
    setNavigationMode,
  } = useRoute();
  const { routeLine, instructions } = useRouteResult();
  const progress = useNavigationProgress();
  const { flyToInstruction, flyToEndpoint } = useRouteMapFocus(routeLine);
  const {
    currentIndex,
    activeInstruction,
    nextInstruction,
    liveDistanceToNext,
    remainingTime,
  } = useActiveInstruction(instructions, routeLine);

  const isActive = navigationMode && isMobile && routingMode;

  useEffect(() => {
    if (!isActive) setShowFullList(false);
  }, [isActive]);

  if (!isActive) return null;

  if (showFullList) {
    return (
      <NavigationStepsSheet
        instructions={instructions}
        routeStartName={routeStart?.properties?.name}
        routeEndName={routeEnd?.properties?.name}
        selectedRouteProfile={selectedRouteProfile}
        currentIndex={currentIndex}
        liveDistanceToNext={liveDistanceToNext}
        onInstructionClick={(step) => {
          flyToInstruction(step);
          setShowFullList(false);
        }}
        onStartEndClick={flyToEndpoint}
        onClose={() => setShowFullList(false)}
      />
    );
  }

  return (
    <>
      <NavigationInstructionBanner
        activeInstruction={activeInstruction}
        activeDistance={
          liveDistanceToNext ?? activeInstruction?.distance ?? null
        }
        nextInstruction={nextInstruction}
        arrived={progress.arrived}
        onOpenList={() => setShowFullList(true)}
      />
      <NavigationProgressBar
        remainingDistance={progress.remainingDistance}
        remainingTime={remainingTime}
        locationError={!!progress.error}
        onStop={() => setNavigationMode(false)}
      />
    </>
  );
}
