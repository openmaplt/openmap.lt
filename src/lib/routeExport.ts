import type { Feature, LineString } from "geojson";

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadGeoJSON(routeLine: Feature<LineString>) {
  downloadBlob(
    JSON.stringify(routeLine, null, 2),
    "marsrutas.geojson",
    "application/geo+json",
  );
}

export function downloadGPX(routeLine: Feature<LineString>) {
  const coords = routeLine.geometry.coordinates;

  const trkpts = coords
    .map(([lon, lat]) => `    <trkpt lat="${lat}" lon="${lon}"/>`)
    .join("\n");

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="openmap.lt" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Maršrutas</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;

  downloadBlob(gpx, "marsrutas.gpx", "application/gpx+xml");
}
