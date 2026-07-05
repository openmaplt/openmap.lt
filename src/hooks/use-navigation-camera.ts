"use client";

import { LngLatBounds } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { useMapActions } from "@/providers/MapProvider";
import {
  useNavigationProgress,
  useRoute,
  useRouteResult,
} from "@/providers/RouteProvider";
import { useIsMobile } from "./useIsMobile";

/** Keeps the map centered/rotated on the traveler while navigating, resets it
 * afterward, and fits the whole route in view once a fresh one is computed. */
export function useNavigationCamera() {
  const { navigationMode } = useRoute();
  const { routeLine } = useRouteResult();
  const progress = useNavigationProgress();
  const { mapRef } = useMapActions();
  const isMobile = useIsMobile();
  const navigationStartedRef = useRef(false);

  useEffect(() => {
    if (!navigationMode || !progress.position) {
      navigationStartedRef.current = false;
      return;
    }
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Defer to the next frame and let the cleanup below cancel it if this
    // effect fires twice back-to-back (React StrictMode double-invokes
    // effects in dev), otherwise two competing easeTo calls fight over zoom.
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      const justStarted = !navigationStartedRef.current;
      navigationStartedRef.current = true;

      map.easeTo({
        center: progress.position as [number, number],
        bearing: progress.bearing ?? map.getBearing(),
        ...(justStarted ? { zoom: 17 } : {}),
        padding: isMobile ? { bottom: 300 } : { left: 400 },
        duration: justStarted ? 1500 : 1000,
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [navigationMode, progress.position, progress.bearing, mapRef, isMobile]);

  useEffect(() => {
    if (navigationMode) return;
    const map = mapRef.current?.getMap();
    if (!map || map.getBearing() === 0) return;
    map.easeTo({ bearing: 0, duration: 800 });
  }, [navigationMode, mapRef]);

  useEffect(() => {
    if (navigationMode) return;
    if (routeLine && routeLine.geometry.type === "LineString") {
      const coords = routeLine.geometry.coordinates;
      if (coords.length > 0) {
        const bounds = new LngLatBounds(
          coords[0] as [number, number],
          coords[0] as [number, number],
        );
        for (const coord of coords) {
          bounds.extend(coord as [number, number]);
        }

        // Ensure map is fitting the bounds smoothly after a short delay so the line has time to render
        requestAnimationFrame(() => {
          mapRef.current?.fitBounds(bounds, {
            padding: 80,
            duration: 800,
          });
        });
      }
    }
  }, [routeLine, mapRef, navigationMode]);
}
