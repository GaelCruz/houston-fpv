import type { DroneEvent } from "@/types";

/**
 * One place that decides where an event sits in time. The "my events" page, the
 * map filter and the venue pages all classify the same way, so they can never
 * disagree about whether something is finished.
 */
export type TimeBucket = "past" | "now" | "today" | "soon" | "later";

/** Assumed length of an event with no end time recorded. */
const ASSUMED_DURATION_MS = 3 * 60 * 60 * 1000;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const TZ = "America/Chicago";

/** "2026-10-04" for the Houston calendar day an instant falls on. */
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function houstonDayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

type Timed = Pick<DroneEvent, "startsAt" | "endsAt">;

export function startInstant(event: Timed): Date {
  return new Date(event.startsAt);
}

/**
 * When an event is over. `endsAt` is optional, so without one we assume a few
 * hours rather than treating the event as finished the moment it starts.
 */
export function endInstant(event: Timed): Date {
  if (event.endsAt) return new Date(event.endsAt);
  return new Date(startInstant(event).getTime() + ASSUMED_DURATION_MS);
}

export function bucketOf(event: Timed, now: Date = new Date()): TimeBucket {
  const start = startInstant(event);
  const end = endInstant(event);

  if (end.getTime() < now.getTime()) return "past";
  // Genuinely underway — the useful answer to "should I head over?"
  if (start.getTime() <= now.getTime()) return "now";
  if (houstonDayKey(start) === houstonDayKey(now)) return "today";
  if (start.getTime() - now.getTime() <= WEEK_MS) return "soon";
  return "later";
}

export function isPast(event: Timed, now: Date = new Date()): boolean {
  return bucketOf(event, now) === "past";
}

/** The map's filter options. "all" means every upcoming event, never past ones. */
export type WhenFilter = "all" | "today" | "week" | "later";

export const WHEN_FILTERS: { value: WhenFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "week", label: "7 days" },
  { value: "later", label: "Later" },
];

export function isWhenFilter(value: string | null): value is WhenFilter {
  return value === "all" || value === "today" || value === "week" || value === "later";
}

export function matchesWhen(event: Timed, filter: WhenFilter, now: Date = new Date()): boolean {
  const bucket = bucketOf(event, now);
  if (bucket === "past") return false; // never on the map, whatever the filter
  switch (filter) {
    case "all":
      return true;
    case "today":
      return bucket === "now" || bucket === "today";
    case "week":
      return bucket === "now" || bucket === "today" || bucket === "soon";
    case "later":
      return bucket === "later";
  }
}
