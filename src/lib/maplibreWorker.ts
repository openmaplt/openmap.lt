import { setWorkerUrl } from "maplibre-gl";

// maplibre-gl v6 no longer auto-configures its worker under a bundler. The
// files come from /public (scripts/copy-maplibre-worker.mjs), not from a
// bundled `new URL(..., import.meta.url)`: Turbopack hashes that and breaks
// the worker's relative import of its sibling module.
//
// Importing this module for its side effect, before any <Map> renders, is all a
// component needs (MapProvider and the profile preview map both do). Doing it
// at module load keeps it to a single call however many maps are on the page.
if (typeof window !== "undefined") {
  setWorkerUrl(
    new URL(
      "/maplibre/maplibre-gl-worker.mjs",
      window.location.origin,
    ).toString(),
  );
}
