import type { Venue } from "@/types";

/**
 * Apple devices get Apple Maps, everything else gets Google Maps. Neither URL
 * needs an API key.
 *
 * This reads `navigator`, so it must only ever be called from an event handler —
 * never during render. Deciding at render time would produce a different href on
 * the server than in the browser and trip a hydration mismatch.
 */
export function directionsUrl(venue: Pick<Venue, "lat" | "lng">): string {
  const { lat, lng } = venue;
  return isApplePlatform()
    ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  // Matching Macintosh also covers iPadOS 13+, which reports a desktop Safari UA.
  return /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
}

/** Opens the venue in the platform's maps app. Safe to call from onClick. */
export function openDirections(venue: Pick<Venue, "lat" | "lng">): void {
  window.open(directionsUrl(venue), "_blank", "noopener,noreferrer");
}
