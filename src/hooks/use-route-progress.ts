"use client";

import distance from "@turf/distance";
import { point } from "@turf/helpers";
import length from "@turf/length";
import lineSlice from "@turf/line-slice";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import type { Feature, LineString } from "geojson";
import { useEffect, useRef, useState } from "react";
import { useGeolocation } from "./use-geolocation";

const MIN_MOVE_METERS = 5;

interface RouteProgressState {
  remainingDistance: number | null;
  remainingTime: number | null;
  remainingLine: Feature<LineString> | null;
  traveledLine: Feature<LineString> | null;
}

const EMPTY_PROGRESS: RouteProgressState = {
  remainingDistance: null,
  remainingTime: null,
  remainingLine: null,
  traveledLine: null,
};

export function useRouteProgress(
  routeLine: Feature<LineString> | null,
  totalDistance: number | null,
  totalTime: number | null,
  active: boolean,
) {
  const {
    position,
    error,
    start: startWatching,
    stop: stopWatching,
  } = useGeolocation();
  const lastProcessedRef = useRef<[number, number] | null>(null);
  const [progress, setProgress] = useState<RouteProgressState>(EMPTY_PROGRESS);

  useEffect(() => {
    if (active) startWatching();
    else stopWatching();
  }, [active, startWatching, stopWatching]);

  useEffect(() => {
    if (active) return;
    lastProcessedRef.current = null;
    setProgress(EMPTY_PROGRESS);
  }, [active]);

  useEffect(() => {
    if (
      !active ||
      !routeLine ||
      !position ||
      totalDistance == null ||
      totalTime == null
    )
      return;

    const last = lastProcessedRef.current;
    if (last && distance(point(last), point(position)) * 1000 < MIN_MOVE_METERS)
      return;
    lastProcessedRef.current = position;

    const coords = routeLine.geometry.coordinates as [number, number][];
    const snapped = nearestPointOnLine(routeLine, point(position));
    const traveledKm = snapped.properties.location ?? 0;
    const totalKm = length(routeLine);
    const remainingKm = Math.max(totalKm - traveledKm, 0);
    const ratio = totalKm > 0 ? remainingKm / totalKm : 0;

    const traveledLine =
      traveledKm > 0
        ? (lineSlice(
            point(coords[0]),
            snapped,
            routeLine,
          ) as Feature<LineString>)
        : null;
    const remainingLine =
      remainingKm > 0
        ? (lineSlice(
            snapped,
            point(coords[coords.length - 1]),
            routeLine,
          ) as Feature<LineString>)
        : null;

    setProgress({
      remainingDistance: remainingKm * 1000,
      remainingTime: totalTime * ratio,
      traveledLine,
      remainingLine,
    });
  }, [active, routeLine, position, totalDistance, totalTime]);

  return { position, error, ...progress };
}
