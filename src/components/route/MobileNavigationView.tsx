"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRoute } from "@/providers/RouteProvider";
import { NavigationInstructionBanner } from "./NavigationInstructionBanner";
import { NavigationProgressBar } from "./NavigationProgressBar";
import { NavigationStepsSheet } from "./NavigationStepsSheet";

/** Compact turn-by-turn navigation UI shown over the map on mobile. */
export function MobileNavigationView() {
  const isMobile = useIsMobile();
  const [showFullList, setShowFullList] = useState(false);
  const { routingMode, navigationMode } = useRoute();

  const isActive = navigationMode && isMobile && routingMode;

  useEffect(() => {
    if (!isActive) setShowFullList(false);
  }, [isActive]);

  if (!isActive) return null;

  if (showFullList) {
    return <NavigationStepsSheet onClose={() => setShowFullList(false)} />;
  }

  return (
    <>
      <NavigationInstructionBanner onOpenList={() => setShowFullList(true)} />
      <NavigationProgressBar />
    </>
  );
}
