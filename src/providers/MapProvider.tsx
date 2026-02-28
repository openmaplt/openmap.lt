"use client";

import type { Feature } from "geojson";
import type { LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { usePathname } from "next/navigation";
import {
  createContext,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AttributionControl,
  type LngLatBounds,
  Map as MapLibreMap,
  type MapProps,
  type MapRef,
  ScaleControl,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { MapConfig } from "@/config/config";
import { MAP_PROFILES, type MapProfile } from "@/config/map-profiles";
import { useMapSync } from "@/hooks/use-map-sync";
import { getMapState } from "@/lib/urlHash";
import { findMapsByType } from "@/lib/utils";

// Transform Context - For high-frequency updates (panning, zooming)
interface MapTransformContextType {
  viewState: MapProps["initialViewState"];
  bbox: LngLatBounds | null;
}

// Selection Context - For features and POIs
interface MapSelectionContextType {
  selectedFeature: Feature | null;
  selectedPoiId: string | null;
  routeStart: Feature | null;
  routeEnd: Feature | null;
}

// Config Context - For map profile and UI modes
interface MapConfigContextType {
  activeMapProfile: MapProfile;
  mobileActiveMode: "search" | "filter" | "routing" | null;
  routingMode: boolean;
  selectedVehicle: "car" | "bike" | "foot" | "river" | null;
}

// Actions Context - For stable functions and refs
interface MapActionsContextType {
  mapRef: RefObject<MapRef | null>;
  setViewState: (viewState: MapProps["initialViewState"]) => void;
  setActiveMapProfile: (profile: MapProfile) => void;
  setBbox: (bbox: LngLatBounds | null) => void;
  setSelectedFeature: (feature: Feature | null) => void;
  setSelectedPoiId: (id: string | null) => void;
  setRouteStart: (feature: Feature | null) => void;
  setRouteEnd: (feature: Feature | null) => void;
  setMobileActiveMode: (mode: "search" | "filter" | "routing" | null) => void;
  setRoutingMode: (mode: boolean) => void;
  setSelectedVehicle: (
    vehicle: "car" | "bike" | "foot" | "river" | null,
  ) => void;
  handleOnChangeMapProfile: (profile: MapProfile) => void;
  handleOnPoiDetailsClose: () => void;
}

const MapTransformContext = createContext<MapTransformContextType | undefined>(
  undefined,
);
const MapSelectionContext = createContext<MapSelectionContextType | undefined>(
  undefined,
);
const MapConfigContext = createContext<MapConfigContextType | undefined>(
  undefined,
);
const MapActionsContext = createContext<MapActionsContextType | undefined>(
  undefined,
);

export const useMapTransform = () => {
  const context = useContext(MapTransformContext);
  if (!context)
    throw new Error("useMapTransform must be used within MapProvider");
  return context;
};

export const useMapSelection = () => {
  const context = useContext(MapSelectionContext);
  if (!context)
    throw new Error("useMapSelection must be used within MapProvider");
  return context;
};

export const useMapConfig = () => {
  const context = useContext(MapConfigContext);
  if (!context) throw new Error("useMapConfig must be used within MapProvider");
  return context;
};

export const useMapActions = () => {
  const context = useContext(MapActionsContext);
  if (!context)
    throw new Error("useMapActions must be used within MapProvider");
  return context;
};

interface MapProviderProps {
  children: ReactNode;
  initialPoiData:
    | (Feature & {
        extent: LngLatBoundsLike;
        filter: string;
      })
    | null;
}

const TypedMapLibreMap = MapLibreMap as ForwardRefExoticComponent<
  MapProps & RefAttributes<MapRef>
>;

export function MapProvider({ children, initialPoiData }: MapProviderProps) {
  const pathname = usePathname();
  const [, mapTypeInUrl, poiSlug] = pathname.split("/");
  const poiIdFromUrl = poiSlug !== "map" ? poiSlug?.split("-")[0] : undefined;

  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState<MapProps["initialViewState"]>(
    () => {
      const state = getMapState();
      const initialState: MapProps["initialViewState"] = {
        latitude: state.latitude,
        longitude: state.longitude,
        zoom: state.zoom,
        bearing: state.bearing,
        pitch: state.pitch,
      };

      if (initialPoiData?.extent) {
        initialState.bounds = initialPoiData.extent;
        initialState.fitBoundsOptions = {
          padding: 50,
          maxZoom: MapConfig.MAX_ZOOM,
        };
      }

      return initialState;
    },
  );

  const [activeMapProfile, setActiveMapProfile] = useState<MapProfile>(() => {
    const state = getMapState();
    return (
      findMapsByType(mapTypeInUrl?.length > 0 ? mapTypeInUrl : state.mapType) ??
      MAP_PROFILES[0]
    );
  });

  const [bbox, setBbox] = useState<LngLatBounds | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(
    initialPoiData,
  );
  const [mobileActiveMode, setMobileActiveMode] = useState<
    "search" | "filter" | "routing" | null
  >(null);
  const [routingMode, setRoutingMode] = useState(false);
  const [routeStart, setRouteStart] = useState<Feature | null>(null);
  const [routeEnd, setRouteEnd] = useState<Feature | null>(null);
  const [selectedPoiId, setSelectedPoiId] = useState(poiIdFromUrl ?? null);
  const [selectedVehicle, setSelectedVehicle] = useState<
    "car" | "bike" | "foot" | "river" | null
  >(() => (activeMapProfile.routingProfiles?.[0] as any) || null);

  // Sync map state to URL and LocalStorage
  useMapSync(viewState, activeMapProfile, selectedFeature);

  useEffect(() => {
    if (selectedFeature) {
      setSelectedPoiId(selectedFeature.properties?.id ?? selectedFeature.id);
    }
  }, [selectedFeature]);

  const handleMoveEnd = useCallback(
    ({ viewState, target }: ViewStateChangeEvent) => {
      const { latitude, longitude, zoom, bearing, pitch } = viewState;
      setViewState({ latitude, longitude, zoom, bearing, pitch });
      setBbox(target.getBounds());
    },
    [],
  );

  const handleOnChangeMapProfile = useCallback((profile: MapProfile) => {
    setActiveMapProfile(profile);
    setSelectedPoiId(null);
    setSelectedFeature(null);
    setRouteStart(null);
    setRouteEnd(null);
    setRoutingMode(false);
    setMobileActiveMode(null);
    setSelectedVehicle((profile.routingProfiles?.[0] as any) || null);
  }, []);

  const handleOnPoiDetailsClose = useCallback(() => {
    setSelectedFeature(null);
    setSelectedPoiId(null);
  }, []);

  // Memoize values for each context
  const transformValue = useMemo(
    () => ({ viewState, bbox }),
    [viewState, bbox],
  );
  const selectionValue = useMemo(
    () => ({ selectedFeature, selectedPoiId, routeStart, routeEnd }),
    [selectedFeature, selectedPoiId, routeStart, routeEnd],
  );
  const configValue = useMemo(
    () => ({
      activeMapProfile,
      mobileActiveMode,
      routingMode,
      selectedVehicle,
    }),
    [activeMapProfile, mobileActiveMode, routingMode, selectedVehicle],
  );

  const actionsValue = useMemo(
    () => ({
      mapRef,
      setViewState,
      setActiveMapProfile,
      setBbox,
      setSelectedFeature,
      setSelectedPoiId,
      setRouteStart,
      setRouteEnd,
      setMobileActiveMode,
      setRoutingMode,
      setSelectedVehicle,
      handleOnChangeMapProfile,
      handleOnPoiDetailsClose,
    }),
    [handleOnChangeMapProfile, handleOnPoiDetailsClose],
  );

  return (
    <MapTransformContext.Provider value={transformValue}>
      <MapSelectionContext.Provider value={selectionValue}>
        <MapConfigContext.Provider value={configValue}>
          <MapActionsContext.Provider value={actionsValue}>
            <TypedMapLibreMap
              ref={mapRef}
              mapStyle={activeMapProfile.mapStyles[0].style}
              initialViewState={viewState}
              minZoom={MapConfig.MIN_ZOOM}
              maxZoom={MapConfig.MAX_ZOOM}
              maxBounds={MapConfig.BOUNDS}
              onMoveEnd={handleMoveEnd}
              onLoad={(e) => setBbox(e.target.getBounds())}
              attributionControl={false}
            >
              {children}
              <AttributionControl position="bottom-left" />
              <ScaleControl position="bottom-left" maxWidth={200} />
            </TypedMapLibreMap>
          </MapActionsContext.Provider>
        </MapConfigContext.Provider>
      </MapSelectionContext.Provider>
    </MapTransformContext.Provider>
  );
}
