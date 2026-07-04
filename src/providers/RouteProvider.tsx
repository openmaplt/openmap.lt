"use client";

import { point } from "@turf/helpers";
import type { Feature, Point } from "geojson";
import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RouteProfile } from "@/config/map-profiles";
import { useMapSync } from "@/hooks/use-map-sync";
import { getInitialRoute, type RouteState } from "@/lib/urlHash";
import {
  useMapConfig,
  useMapSelection,
  useMapTransform,
} from "@/providers/MapProvider";

interface RouteContextType {
  routingMode: boolean;
  navigationMode: boolean;
  routeStart: Feature | null;
  routeEnd: Feature | null;
  selectedRouteProfile: RouteProfile | null;
  highlightedRoutePoint: [number, number] | null;
  setRoutingMode: (mode: boolean) => void;
  setNavigationMode: (mode: boolean) => void;
  setRouteStart: (feature: Feature | null) => void;
  setRouteEnd: (feature: Feature | null) => void;
  setSelectedRouteProfile: (profile: RouteProfile | null) => void;
  setHighlightedRoutePoint: (point: [number, number] | null) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (!context) throw new Error("useRoute must be used within RouteProvider");
  return context;
};

const initialRoute = getInitialRoute();

export function RouteProvider({ children }: { children: ReactNode }) {
  const { viewState } = useMapTransform();
  const { activeMapProfile } = useMapConfig();
  const { selectedFeature } = useMapSelection();

  const [routingMode, setRoutingMode] = useState(() => initialRoute !== null);
  const [navigationMode, setNavigationMode] = useState(false);
  const [routeStart, setRouteStart] = useState<Feature | null>(() =>
    initialRoute
      ? point([initialRoute.startLng, initialRoute.startLat], {
          name: initialRoute.startName ?? "",
        })
      : null,
  );
  const [routeEnd, setRouteEnd] = useState<Feature | null>(() =>
    initialRoute
      ? point([initialRoute.endLng, initialRoute.endLat], {
          name: initialRoute.endName ?? "",
        })
      : null,
  );
  const [selectedRouteProfile, setSelectedRouteProfile] =
    useState<RouteProfile | null>(
      () =>
        (initialRoute?.profile as RouteProfile) ??
        activeMapProfile.routingProfiles?.[0] ??
        null,
    );
  const [highlightedRoutePoint, setHighlightedRoutePoint] = useState<
    [number, number] | null
  >(null);

  const prevProfileRef = useRef(activeMapProfile);
  useEffect(() => {
    if (prevProfileRef.current === activeMapProfile) return;
    prevProfileRef.current = activeMapProfile;
    setRouteStart(null);
    setRouteEnd(null);
    setRoutingMode(false);
    setNavigationMode(false);
    setHighlightedRoutePoint(null);
    setSelectedRouteProfile(activeMapProfile.routingProfiles?.[0] ?? null);
  }, [activeMapProfile]);

  useEffect(() => {
    if (!routeStart || !routeEnd) setNavigationMode(false);
  }, [routeStart, routeEnd]);

  const routeStateForUrl = useMemo<RouteState | null>(() => {
    if (!routeStart || !routeEnd) return null;
    const [startLng, startLat] = (routeStart.geometry as Point).coordinates;
    const [endLng, endLat] = (routeEnd.geometry as Point).coordinates;
    return {
      startLat,
      startLng,
      startName: routeStart.properties?.name || undefined,
      endLat,
      endLng,
      endName: routeEnd.properties?.name || undefined,
      profile: selectedRouteProfile ?? undefined,
    };
  }, [routeStart, routeEnd, selectedRouteProfile]);

  useMapSync(viewState, activeMapProfile, selectedFeature, routeStateForUrl);

  const value = useMemo(
    () => ({
      routingMode,
      navigationMode,
      routeStart,
      routeEnd,
      selectedRouteProfile,
      highlightedRoutePoint,
      setRoutingMode,
      setNavigationMode,
      setRouteStart,
      setRouteEnd,
      setSelectedRouteProfile,
      setHighlightedRoutePoint,
    }),
    [
      routingMode,
      navigationMode,
      routeStart,
      routeEnd,
      selectedRouteProfile,
      highlightedRoutePoint,
    ],
  );

  return (
    <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
  );
}
