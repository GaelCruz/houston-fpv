import type { DroneEvent } from "@/types";

/**
 * Timezone is pinned to Houston explicitly. Without it, the server and the
 * browser format in different zones and React reports a hydration mismatch.
 */
const TZ = "America/Chicago";

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: TZ,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: TZ,
});

/** e.g. "Sat, Oct 10 · 6:00 PM – 9:30 PM" */
export function formatEventWhen(event: DroneEvent): string {
  const start = new Date(event.startsAt);
  const day = dayFormatter.format(start);
  const from = timeFormatter.format(start);
  if (!event.endsAt) return `${day} · ${from}`;
  return `${day} · ${from} – ${timeFormatter.format(new Date(event.endsAt))}`;
}

/** Short form for list rows. */
export function formatEventDay(event: DroneEvent): string {
  return dayFormatter.format(new Date(event.startsAt));
}
