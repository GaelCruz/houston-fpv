/**
 * MapLibre spins up a web worker to parse vector tiles. By default it derives
 * the worker URL from `import.meta.url`, which under Turbopack points into
 * /_next/static/chunks/ where the worker file was never emitted — the worker
 * 404s, no tiles ever parse, and the map renders as a black rectangle with
 * working markers on top.
 *
 * So we serve the worker ourselves and point `setWorkerUrl` at it. The worker is
 * an ES module that imports ./maplibre-gl-shared.mjs relatively, so both files
 * have to land in the same public directory.
 *
 * This runs before dev/build and after install, so the copy can never drift
 * from the installed maplibre-gl version. public/maplibre/ is gitignored.
 */
import { createRequire } from "node:module";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];
const outDir = path.join(process.cwd(), "public", "maplibre");

await mkdir(outDir, { recursive: true });

for (const file of FILES) {
  let src;
  try {
    src = require.resolve(`maplibre-gl/dist/${file}`);
  } catch {
    console.error(
      `[maplibre] Could not resolve maplibre-gl/dist/${file}. Is maplibre-gl installed?`,
    );
    process.exit(1);
  }
  await copyFile(src, path.join(outDir, file));
}

console.log(`[maplibre] worker assets copied to public/maplibre/`);
