import { featureCollection, point } from "@turf/helpers";
import type { Feature, Geometry, LineString } from "geojson";
import { create } from "xmlbuilder2";
import { type RouteInstruction, RouteSign } from "@/hooks/use-routing";

const WaypointType = {
  Origin: "origin",
  Destination: "destination",
  Waypoint: "waypoint",
} as const;

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getWaypointType(step: RouteInstruction): string {
  if (step.waterway_obstacle) return step.waterway_obstacle;
  if (step.sign === RouteSign.Finish) return WaypointType.Destination;
  return WaypointType.Waypoint;
}

function getWaypointName(step: RouteInstruction, isFirst: boolean): string {
  if (isFirst) return "Pradžia";
  if (step.sign === RouteSign.Finish) return "Pabaiga";
  return step.text;
}

function buildCollection(
  routeLine: Feature<LineString>,
  instructions: RouteInstruction[],
) {
  const seen = new Map<string, { step: RouteInstruction; distance: number }>();
  for (const step of instructions) {
    const key = routeLine.geometry.coordinates[step.interval[0]].join(",");
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, { step, distance: step.distance });
    } else if (!existing.step.waterway_obstacle && step.waterway_obstacle) {
      seen.set(key, { step, distance: existing.distance });
    } else if (existing.step.waterway_obstacle && !step.waterway_obstacle) {
      seen.set(key, { ...existing, distance: step.distance });
    }
  }

  const entries = Array.from(seen.values());
  const waypoints = entries.map(({ step }, i) => {
    const coords = routeLine.geometry.coordinates[step.interval[0]];
    const isFirst = i === 0;
    const type = isFirst ? WaypointType.Origin : getWaypointType(step);
    const name = getWaypointName(step, isFirst);
    const properties: Record<string, string | number> = { name, type };
    if (step.street_name && step.street_name !== name)
      properties.street_name = step.street_name;
    if (step.waterway_obstacle_description)
      properties.description = step.waterway_obstacle_description;
    if (step.waterway_milestone_value != null)
      properties.milestone_km = Number(step.waterway_milestone_value);
    const prevDistanceM = i > 0 ? Math.round(entries[i - 1].distance) : 0;
    if (prevDistanceM > 0) properties.distance_m = prevDistanceM;
    return point(coords, properties);
  });

  return featureCollection<Geometry>([routeLine, ...waypoints]);
}

function buildTimestamps(
  coords: number[][],
  instructions: RouteInstruction[],
): Date[] {
  const startTime = Date.now();
  const timestamps: Date[] = new Array(coords.length);
  let elapsedMs = 0;

  for (const step of instructions) {
    const [startIdx, endIdx] = step.interval;
    const distances = [0];
    for (let i = startIdx + 1; i <= endIdx; i++) {
      const dx = coords[i][0] - coords[i - 1][0];
      const dy = coords[i][1] - coords[i - 1][1];
      distances.push(
        distances[distances.length - 1] + Math.sqrt(dx * dx + dy * dy),
      );
    }
    const totalDist = distances[distances.length - 1];
    for (let i = startIdx; i <= endIdx; i++) {
      const fraction = totalDist > 0 ? distances[i - startIdx] / totalDist : 0;
      timestamps[i] = new Date(startTime + elapsedMs + fraction * step.time);
    }
    elapsedMs += step.time;
  }

  return timestamps;
}

function hasElevationData(coords: number[][]): boolean {
  return coords.some((c) => c.length > 2 && c[2] !== 0);
}

export function downloadGeoJSON(
  routeLine: Feature<LineString>,
  instructions: RouteInstruction[],
) {
  const coords = routeLine.geometry.coordinates;
  const exportLine: Feature<LineString> = hasElevationData(coords)
    ? routeLine
    : {
        ...routeLine,
        geometry: {
          ...routeLine.geometry,
          coordinates: coords.map(([lon, lat]) => [lon, lat]),
        },
      };
  const collection = buildCollection(exportLine, instructions);
  downloadBlob(
    JSON.stringify(collection, null, 2),
    "marsrutas.geojson",
    "application/geo+json",
  );
}

export function downloadGPX(
  routeLine: Feature<LineString>,
  instructions: RouteInstruction[],
) {
  const collection = buildCollection(routeLine, instructions);
  const coords = routeLine.geometry.coordinates;
  const withEle = hasElevationData(coords);
  const timestamps = buildTimestamps(coords, instructions);

  const root = create({ version: "1.0", encoding: "UTF-8" }).ele("gpx", {
    version: "1.1",
    creator: "openmap.lt",
    xmlns: "http://www.topografix.com/GPX/1/1",
  });

  for (const feature of collection.features) {
    if (feature.geometry.type !== "Point") continue;
    const [lon, lat] = feature.geometry.coordinates;
    const props = feature.properties;
    const wpt = root
      .ele("wpt", { lat, lon })
      .ele("name")
      .txt(props?.name ?? "")
      .up()
      .ele("type")
      .txt(props?.type ?? "")
      .up();
    if (props?.description) wpt.ele("desc").txt(String(props.description)).up();
    if (
      props?.street_name ||
      props?.milestone_km != null ||
      props?.distance_m != null
    ) {
      const ext = wpt.ele("extensions");
      if (props.street_name)
        ext.ele("street_name").txt(String(props.street_name)).up();
      if (props.milestone_km != null)
        ext.ele("milestone_km").txt(String(props.milestone_km)).up();
      if (props.distance_m != null)
        ext.ele("distance_m").txt(String(props.distance_m)).up();
      ext.up();
    }
    wpt.up();
  }

  const trk = root.ele("trk").ele("name").txt("Maršrutas").up().ele("trkseg");
  for (let i = 0; i < coords.length; i++) {
    const [lon, lat, ele] = coords[i];
    const trkpt = trk.ele("trkpt", { lat, lon });
    if (withEle && ele != null) trkpt.ele("ele").txt(String(ele)).up();
    if (timestamps[i]) trkpt.ele("time").txt(timestamps[i].toISOString()).up();
    trkpt.up();
  }

  downloadBlob(
    root.end({ prettyPrint: true }),
    "marsrutas.gpx",
    "application/gpx+xml",
  );
}
