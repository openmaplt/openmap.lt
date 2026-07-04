"use client";

import along from "@turf/along";
import bearingBetween from "@turf/bearing";
import distanceBetween from "@turf/distance";
import { point } from "@turf/helpers";
import length from "@turf/length";
import lineSlice from "@turf/line-slice";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import type { Feature, LineString } from "geojson";
import { useEffect, useRef, useState } from "react";
import { useGeolocation } from "./use-geolocation";

const MIN_MOVE_METERS = 5;
const OFF_ROUTE_METERS = 40;
const OFF_ROUTE_CONFIRM_MS = 6000;
const MIN_RECALCULATE_INTERVAL_MS = 15000;
const BEARING_LOOKAHEAD_METERS = 30;
const ARRIVAL_METERS = 20;
// Fixes with a worse (larger) accuracy radius than this are ignored — common
// in tunnels or between tall buildings — instead of feeding a wild jump into
// off-route detection or the displayed position.
const MAX_ACCURACY_METERS = 60;

interface RouteProgressState {
  position: [number, number] | null;
  remainingDistance: number | null;
  remainingTime: number | null;
  remainingLine: Feature<LineString> | null;
  traveledLine: Feature<LineString> | null;
  currentIndex: number | null;
  bearing: number | null;
  arrived: boolean;
}

const EMPTY_PROGRESS: RouteProgressState = {
  position: null,
  remainingDistance: null,
  remainingTime: null,
  remainingLine: null,
  traveledLine: null,
  currentIndex: null,
  bearing: null,
  arrived: false,
};

export function useRouteProgress(
  routeLine: Feature<LineString> | null,
  totalDistance: number | null,
  totalTime: number | null,
  active: boolean,
  onOffRoute?: (position: [number, number]) => void,
) {
  const {
    position,
    accuracy,
    error,
    start: startWatching,
    stop: stopWatching,
  } = useGeolocation();
  const lastProcessedRef = useRef<[number, number] | null>(null);
  const lastRouteLineRef = useRef<Feature<LineString> | null>(null);
  const offRouteSinceRef = useRef<number | null>(null);
  const lastRecalculateRef = useRef<number>(0);
  const [progress, setProgress] = useState<RouteProgressState>(EMPTY_PROGRESS);

  useEffect(() => {
    if (active) startWatching();
    else stopWatching();
  }, [active, startWatching, stopWatching]);

  // Pausing navigation stops watching position, but deliberately doesn't wipe
  // progress — stats should keep showing "remaining from where you paused"
  // instead of jumping back to the full trip totals. Reset the off-route
  // timer though, so stale timing from before the pause can't immediately
  // trigger a recalculation the moment navigation resumes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: must re-run on every pause/resume transition, even though `active` isn't read in the body
  useEffect(() => {
    offRouteSinceRef.current = null;
  }, [active]);

  // A genuinely new route (fresh trip or an off-route recalculation) is the
  // only time progress should actually reset to empty.
  const resetRouteLineRef = useRef<Feature<LineString> | null>(null);
  useEffect(() => {
    if (routeLine === resetRouteLineRef.current) return;
    resetRouteLineRef.current = routeLine;
    lastProcessedRef.current = null;
    setProgress(EMPTY_PROGRESS);
  }, [routeLine]);

  useEffect(() => {
    if (
      !active ||
      !routeLine ||
      !position ||
      totalDistance == null ||
      totalTime == null
    )
      return;

    if (accuracy != null && accuracy > MAX_ACCURACY_METERS) return;

    const routeLineChanged = lastRouteLineRef.current !== routeLine;
    if (routeLineChanged) offRouteSinceRef.current = null;

    const coords = routeLine.geometry.coordinates as [number, number][];
    const here = point(position);
    const snapped = nearestPointOnLine(routeLine, here, { units: "meters" });
    const deviationMeters = snapped.properties.dist ?? 0;

    // Off-route confirmation runs on every tick (even a stationary one, e.g.
    // stopped at a light) so it isn't starved by the movement throttle below.
    const now = Date.now();
    if (deviationMeters > OFF_ROUTE_METERS) {
      if (offRouteSinceRef.current == null) offRouteSinceRef.current = now;
      const offRouteFor = now - offRouteSinceRef.current;
      const sinceLastRecalc = now - lastRecalculateRef.current;
      if (
        offRouteFor >= OFF_ROUTE_CONFIRM_MS &&
        sinceLastRecalc >= MIN_RECALCULATE_INTERVAL_MS
      ) {
        lastRecalculateRef.current = now;
        offRouteSinceRef.current = null;
        onOffRoute?.(position);
        return;
      }
    } else {
      offRouteSinceRef.current = null;
    }

    const last = lastProcessedRef.current;
    if (
      !routeLineChanged &&
      last &&
      distanceBetween(point(last), point(position), { units: "meters" }) <
        MIN_MOVE_METERS
    )
      return;
    lastProcessedRef.current = position;
    lastRouteLineRef.current = routeLine;

    const traveledMeters = snapped.properties.location ?? 0;
    const totalMeters = length(routeLine, { units: "meters" });
    const remainingMeters = Math.max(totalMeters - traveledMeters, 0);
    const ratio = totalMeters > 0 ? remainingMeters / totalMeters : 0;

    const traveledLine =
      traveledMeters > 0
        ? (lineSlice(
            point(coords[0]),
            snapped,
            routeLine,
          ) as Feature<LineString>)
        : null;
    const remainingLine =
      remainingMeters > 0
        ? (lineSlice(
            snapped,
            point(coords[coords.length - 1]),
            routeLine,
          ) as Feature<LineString>)
        : null;

    let bearing: number | null = null;
    if (remainingLine) {
      const remainingLen = length(remainingLine, { units: "meters" });
      const lookaheadDistance = Math.min(
        BEARING_LOOKAHEAD_METERS,
        remainingLen,
      );
      if (lookaheadDistance > 0) {
        const lookaheadPoint = along(remainingLine, lookaheadDistance, {
          units: "meters",
        });
        const rawBearing = bearingBetween(snapped, lookaheadPoint);
        bearing = (rawBearing + 360) % 360;
      }
    }

    setProgress({
      position,
      remainingDistance: remainingMeters,
      remainingTime: totalTime * ratio,
      traveledLine,
      remainingLine,
      currentIndex: snapped.properties.index ?? null,
      bearing,
      arrived: remainingMeters <= ARRIVAL_METERS,
    });
  }, [
    active,
    routeLine,
    position,
    accuracy,
    totalDistance,
    totalTime,
    onOffRoute,
  ]);

  return { error, ...progress };
}
