/**
 * Single source of truth for basemap config.
 *
 * OpenFreeMap is keyless with no registration and no request limits, and the
 * dark style makes the event pins pop. If it ever goes down, swap STYLE_URL for
 * one of the fallbacks below — nothing else in the app needs to change.
 */
export const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

export const STYLE_FALLBACKS = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  /** Different operator entirely — use if OpenFreeMap itself is unreachable. */
  versatiles: "https://tiles.versatiles.org/assets/styles/colorful/style.json",
} as const;

/** Downtown Houston, [lng, lat] as MapLibre expects. */
export const HOUSTON_CENTER: [number, number] = [-95.3698, 29.7604];

export const DEFAULT_ZOOM = 9;

/** Padding used when fitting the map to all venues. */
export const FIT_PADDING = 72;

/**
 * Served from /public by scripts/copy-maplibre-worker.mjs. MapLibre's default
 * worker URL is derived from import.meta.url, which Turbopack resolves into
 * /_next/static/chunks/ where no worker file is emitted — so we point it at our
 * own copy instead. Without this, tiles never parse and the map renders black.
 */
export const WORKER_URL = "/maplibre/maplibre-gl-worker.mjs";
