"use client";

import { useEffect, useRef } from "react";
// maplibre-gl v6 is ESM-only and has NO default export — named imports only.
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";
// Without this the map renders as a blank grey box.
import "maplibre-gl/dist/maplibre-gl.css";

import { DEFAULT_ZOOM, FIT_PADDING, HOUSTON_CENTER, STYLE_URL, WORKER_URL } from "@/lib/map";
import type { ResolvedEvent } from "@/types";

// Must be set before any Map is constructed. See WORKER_URL for why.
setWorkerUrl(WORKER_URL);

const BOLT_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 2 4 14h6l-1.5 8L19 9h-6.2z"/></svg>`;
const DOT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="8"/></svg>`;

interface EventMapProps {
  events: ResolvedEvent[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

function createPinElement(event: ResolvedEvent): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "fpv-pin";
  el.dataset.type = event.type;
  el.setAttribute(
    "aria-label",
    `${event.title} — ${event.type === "racing" ? "Racing" : "Casual"} at ${event.venue.name}`,
  );
  // Static trusted markup; no event data is interpolated into HTML.
  el.innerHTML = `<span class="fpv-pin__glyph">${
    event.type === "racing" ? BOLT_SVG : DOT_SVG
  }</span>`;
  return el;
}

export default function EventMap({ events, selectedSlug, onSelect }: EventMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef(new Map<string, Marker>());

  // Keep the latest callback in a ref so marker click handlers never go stale
  // and never need rebinding. Assigned in an effect, not during render.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Build the map exactly once. The cleanup matters: without map.remove(),
  // React Strict Mode's dev double-invoke leaves two stacked WebGL canvases.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const markers = markersRef.current;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: HOUSTON_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers to the event list.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = markersRef.current;
    const liveSlugs = new Set(events.map((e) => e.slug));

    for (const [slug, marker] of markers) {
      if (!liveSlugs.has(slug)) {
        marker.remove();
        markers.delete(slug);
      }
    }

    for (const event of events) {
      if (markers.has(event.slug)) continue;
      const el = createPinElement(event);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(event.slug);
      });
      markers.set(
        event.slug,
        new Marker({ element: el }).setLngLat([event.venue.lng, event.venue.lat]).addTo(map),
      );
    }

    // The seed spans Katy to Baytown, so frame the actual spread rather than
    // trusting a fixed zoom.
    if (events.length > 1) {
      const bounds = events.reduce(
        (acc, e) => acc.extend([e.venue.lng, e.venue.lat]),
        new LngLatBounds(),
      );
      map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: 12, duration: 0 });
    }
  }, [events]);

  // Reflect selection on the pins and ease the selected one into view.
  useEffect(() => {
    markersRef.current.forEach((marker, slug) => {
      marker.getElement().dataset.selected = String(slug === selectedSlug);
    });

    if (!selectedSlug) return;
    const target = events.find((e) => e.slug === selectedSlug);
    if (!target) return;
    mapRef.current?.easeTo({
      center: [target.venue.lng, target.venue.lat],
      zoom: Math.max(mapRef.current.getZoom(), 11),
      duration: 650,
    });
  }, [selectedSlug, events]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Map of Houston drone meetups" />;
}
