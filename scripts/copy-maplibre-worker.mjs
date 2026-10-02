// Copies maplibre-gl's web worker (and every sibling module it imports) from
// node_modules into public/maplibre/, run by the `predev`/`prebuild` hooks.
//
// Why not let the bundler handle it: maplibre-gl v6 needs `setWorkerUrl()`, and
// Turbopack content-hashes any file referenced via `new URL(..., import.meta.url)`.
// The worker imports `./maplibre-gl-shared.mjs` by its plain name, but only the
// worker gets a hashed copy, so that import resolves to the app's catch-all page
// (HTML, status 200) and the worker dies with "Worker failed to load" — a blank
// map with no other symptom. Serving the files unhashed from /public avoids it.
//
// Copying at build time (instead of committing the files) keeps them in sync with
// the installed maplibre-gl version; the import list is read from the worker
// itself, so a new internal chunk in a future version is copied automatically and
// a renamed/missing one fails the build loudly instead of breaking the map.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const distDir = fileURLToPath(
  new URL("../node_modules/maplibre-gl/dist/", import.meta.url),
);
const outDir = fileURLToPath(new URL("../public/maplibre/", import.meta.url));
const ENTRY = "maplibre-gl-worker.mjs";

const files = new Set();
const queue = [ENTRY];
while (queue.length > 0) {
  const name = queue.pop();
  if (files.has(name)) continue;
  if (!existsSync(distDir + name)) {
    throw new Error(
      `maplibre-gl/dist/${name} not found — the worker layout changed, update scripts/copy-maplibre-worker.mjs`,
    );
  }
  files.add(name);
  const source = readFileSync(distDir + name, "utf8");
  for (const match of source.matchAll(
    /(?:from|import)\s*\(?\s*["']\.\/([^"']+\.mjs)["']/g,
  )) {
    queue.push(match[1]);
  }
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const name of files) cpSync(distDir + name, outDir + name);
console.log(
  `maplibre worker: copied ${[...files].join(", ")} -> public/maplibre/`,
);
