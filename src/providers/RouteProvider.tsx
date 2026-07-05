"use client";

import { point } from "@turf/helpers";
import type { Feature, LineString, Point } from "geojson";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RouteProfile } from "@/config/map-profiles";
import { useMapSync } from "@/hooks/use-map-sync";
import { useRouteProgress } from "@/hooks/use-route-progress";
import { type RouteInstruction, useRouting } from "@/hooks/use-routing";
import { getInitialRoute, type RouteState } from "@/lib/urlHash";
import {
  useMapConfig,
  useMapSelection,
  useMapTransform,
} from "@/providers/MapProvider";

const ARRIVED_AUTO_STOP_MS = 4000;

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

interface RouteResultContextType {
  routeLine: Feature<LineString> | null;
  distance: number | null;
  time: number | null;
  instructions: RouteInstruction[];
  loading: boolean;
  error: string | null;
}

interface NavigationProgressContextType {
  position: [number, number] | null;
  remainingDistance: number | null;
  remainingTime: number | null;
  remainingLine: Feature<LineString> | null;
  traveledLine: Feature<LineString> | null;
  currentIndex: number | null;
  bearing: number | null;
  arrived: boolean;
  error: GeolocationPositionError | null;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);
const RouteResultContext = createContext<RouteResultContextType | undefined>(
  undefined,
);
const NavigationProgressContext = createContext<
  NavigationProgressContextType | undefined
>(undefined);

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (!context) throw new Error("useRoute must be used within RouteProvider");
  return context;
};

/** The currently computed route: line geometry, distance/time, turn-by-turn instructions. */
export const useRouteResult = () => {
  const context = useContext(RouteResultContext);
  if (!context)
    throw new Error("useRouteResult must be used within RouteProvider");
  return context;
};

/** Live GPS progress along the route while navigation is active (or paused). */
export const useNavigationProgress = () => {
  const context = useContext(NavigationProgressContext);
  if (!context)
    throw new Error("useNavigationProgress must be used within RouteProvider");
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

  const vehicle =
    selectedRouteProfile || activeMapProfile.routingProfiles?.[0] || "car";
  const rawRouteResult = useRouting(
    routeStart,
    routeEnd,
    vehicle,
    activeMapProfile.routingUrl,
  );
  // useRouting() returns a fresh object every render even when nothing
  // changed; rebuild it through useMemo so context consumers don't
  // re-render on every unrelated RouteProvider render.
  const routeResult = useMemo(
    () => ({
      routeLine: rawRouteResult.routeLine,
      distance: rawRouteResult.distance,
      time: rawRouteResult.time,
      instructions: rawRouteResult.instructions,
      loading: rawRouteResult.loading,
      error: rawRouteResult.error,
    }),
    [
      rawRouteResult.routeLine,
      rawRouteResult.distance,
      rawRouteResult.time,
      rawRouteResult.instructions,
      rawRouteResult.loading,
      rawRouteResult.error,
    ],
  );

  const handleOffRoute = useCallback((position: [number, number]) => {
    setRouteStart(
      point(position, {
        name: "Mano dabartinė vietovė",
        isLiveLocation: true,
      }),
    );
  }, []);

  const rawProgress = useRouteProgress(
    routeResult.routeLine,
    routeResult.distance,
    routeResult.time,
    navigationMode,
    handleOffRoute,
  );
  // Same reasoning as routeResult above: stabilize the reference so it only
  // changes when a field actually does.
  const progress = useMemo(
    () => ({
      position: rawProgress.position,
      remainingDistance: rawProgress.remainingDistance,
      remainingTime: rawProgress.remainingTime,
      remainingLine: rawProgress.remainingLine,
      traveledLine: rawProgress.traveledLine,
      currentIndex: rawProgress.currentIndex,
      bearing: rawProgress.bearing,
      arrived: rawProgress.arrived,
      error: rawProgress.error,
    }),
    [
      rawProgress.position,
      rawProgress.remainingDistance,
      rawProgress.remainingTime,
      rawProgress.remainingLine,
      rawProgress.traveledLine,
      rawProgress.currentIndex,
      rawProgress.bearing,
      rawProgress.arrived,
      rawProgress.error,
    ],
  );

  useEffect(() => {
    if (!progress.arrived) return;
    const timer = setTimeout(
      () => setNavigationMode(false),
      ARRIVED_AUTO_STOP_MS,
    );
    return () => clearTimeout(timer);
  }, [progress.arrived]);

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
    <RouteContext.Provider value={value}>
      <RouteResultContext.Provider value={routeResult}>
        <NavigationProgressContext.Provider value={progress}>
          {children}
        </NavigationProgressContext.Provider>
      </RouteResultContext.Provider>
    </RouteContext.Provider>
  );
}
