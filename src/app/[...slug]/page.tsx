"use client";

import {
  AttributionControl,
  ScaleControl,
  type LngLatBounds,
  Map as MapLibreMap,
  type MapProps,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature } from "geojson";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { CraftbeerFeature } from "@/components/CraftbeerFeature";
import { MapStyleSwitcher } from "@/components/MapStyleSwitcher";
import { PlacesProfileComponents } from "@/components/PlacesProfileComponents";
import { PoiDetails } from "@/components/PoiDetailsSheet";
import { PoiInteraction } from "@/components/PoiInteraction";
import { MAPS, MapConfig, type MapProfile } from "@/config/map";
import { findMapsByType } from "@/lib/utils";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getPointExtent } from "@/lib/api";
import { getObjectId } from "@/lib/poiData";
import { getPoiFromObjectId } from "@/lib/poiHelpers";

export default function Page() {
  const mapRef = useRef<MapRef>(null);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const { slug } = params;
  const [profile, slugId] =
    slug && Array.isArray(slug) ? slug : [slug, undefined];
  const pointId = slugId !== "map" ? slugId : undefined;

  // URL is the source of truth
  const z = searchParams.get("z");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const bearing = searchParams.get("bearing");
  const pitch = searchParams.get("pitch");

  const viewState = {
    latitude: lat ? parseFloat(lat) : MapConfig.DEFAULT_LATITUDE,
    longitude: lng ? parseFloat(lng) : MapConfig.DEFAULT_LONGITUDE,
    zoom: z ? parseFloat(z) : MapConfig.DEFAULT_ZOOM,
    bearing: bearing ? parseFloat(bearing) : 0,
    pitch: pitch ? parseFloat(pitch) : 0,
  };

  const [activeMapProfile, setActiveMapProfile] = useState<MapProfile>(() => {
    const mapProfile = findMapsByType(profile) ?? MAPS[0];
    return mapProfile;
  });

  const [bbox, setBbox] = useState<LngLatBounds | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [mobileActiveMode, setMobileActiveMode] = useState<
    "search" | "filter" | null
  >(null);

  // Handle pointId URL without position
  useEffect(() => {
    if (pointId && (!z || !lat || !lng)) {
      getPointExtent(pointId).then((extent) => {
        if (extent && mapRef.current) {
          const camera = mapRef.current.cameraForBounds(extent, {
            padding: 100,
          });

          const newSearchParams = new URLSearchParams();
          newSearchParams.set("z", camera.zoom.toFixed(2));
          newSearchParams.set("lat", camera.center.lat.toFixed(5));
          newSearchParams.set("lng", camera.center.lng.toFixed(5));
          newSearchParams.set("bearing", camera.bearing.toFixed(0));
          newSearchParams.set("pitch", camera.pitch.toFixed(0));
          router.replace(
            `/${profile}/${pointId}?${newSearchParams.toString()}`,
          );
        }
      });
    }
  }, [pointId, z, lat, lng, profile, router]);

  // Update URL when map moves
  const handleMoveEnd = useCallback(
    ({ viewState: newViewState }: ViewStateChangeEvent) => {
      const objectId = selectedFeature
        ? getObjectId(
            selectedFeature.properties,
            (selectedFeature as any).layer.id,
          )
        : null;
      const path = objectId
        ? `/${activeMapProfile.mapType}/${objectId}`
        : `/${activeMapProfile.mapType}/map`;

      const newSearchParams = new URLSearchParams();
      newSearchParams.set("z", newViewState.zoom.toFixed(2));
      newSearchParams.set("lat", newViewState.latitude.toFixed(5));
      newSearchParams.set("lng", newViewState.longitude.toFixed(5));
      newSearchParams.set("bearing", newViewState.bearing.toFixed(0));
      newSearchParams.set("pitch", newViewState.pitch.toFixed(0));
      router.replace(`${path}?${newSearchParams.toString()}`);
    },
    [selectedFeature, activeMapProfile.mapType, router],
  );

  // Update URL when feature is selected/deselected
  useEffect(() => {
    const objectId = selectedFeature
      ? getObjectId(
          selectedFeature.properties,
          (selectedFeature as any).layer.id,
        )
      : null;
    const path = objectId
      ? `/${activeMapProfile.mapType}/${objectId}`
      : `/${activeMapProfile.mapType}/map`;
    router.replace(`${path}?${searchParams.toString()}`);
  }, [selectedFeature, activeMapProfile.mapType, router, searchParams]);

  // Select feature on initial load if pointId is present
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !pointId) {
      return;
    }

    const selectFeature = () => {
      console.log("Attempting to select feature for pointId:", pointId);
      const feature = getPoiFromObjectId(map, pointId);
      if (feature) {
        console.log("Feature found:", feature);
        setSelectedFeature(feature);
      } else {
        console.log("Feature not found for pointId:", pointId);
      }
    };

    const handleSourceData = (e: ViewStateChangeEvent) => {
      if (e.isSourceLoaded) {
        selectFeature();
        map.off("sourcedata", handleSourceData);
      }
    };

    if (map.isStyleLoaded()) {
      selectFeature();
    } else {
      map.on("sourcedata", handleSourceData);
    }
  }, [pointId]);

  const TypedMapLibreMap = MapLibreMap as React.ForwardRefExoticComponent<
    MapProps & React.RefAttributes<MapRef>
  >;

  const FeatureComponent =
    activeMapProfile.featureComponent &&
    {
      places: PlacesProfileComponents,
      craftbeer: CraftbeerFeature,
    }[activeMapProfile.featureComponent];

  return (
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
      {FeatureComponent && (
        <FeatureComponent
          bbox={bbox}
          onSelectFeature={setSelectedFeature}
          selectedFeature={selectedFeature}
          mobileActiveMode={mobileActiveMode}
          setMobileActiveMode={setMobileActiveMode}
          mapCenter={{ lat: viewState.latitude, lng: viewState.longitude }}
        />
      )}
      <PoiInteraction
        activeMapProfile={activeMapProfile}
        onSelectFeature={setSelectedFeature}
      />
      <MapStyleSwitcher
        activeMapProfile={activeMapProfile}
        onChangeMapProfile={(profile) => {
          setActiveMapProfile(profile);
          // when profile changes, we want to clear the selected feature
          setSelectedFeature(null);
        }}
      />
      <PoiDetails
        open={!!selectedFeature}
        onOpenChange={(open) => !open && setSelectedFeature(null)}
        feature={selectedFeature}
      />
      <AttributionControl position="bottom-left" />
      <ScaleControl position="bottom-left" maxWidth={200} />
    </TypedMapLibreMap>
  );
}
