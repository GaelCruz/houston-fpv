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

/**
 * `datetime-local` inputs have no timezone. The admin is entering Houston local
 * time, so these two convert between that and the UTC instants Postgres stores.
 *
 * The trick: format the instant in the target zone, read it back as if it were
 * UTC, and the difference is that zone's offset at that moment — which handles
 * CST/CDT without hard-coding either.
 */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asIfUtc - date.getTime();
}

/** "2026-10-10T18:00" entered as Houston time → the correct UTC instant. */
export function houstonLocalToDate(local: string): Date {
  const naive = new Date(`${local}:00Z`);
  if (Number.isNaN(naive.getTime())) throw new Error(`Invalid date/time: ${local}`);
  return new Date(naive.getTime() - zoneOffsetMs(naive, TZ));
}

/** UTC instant → "2026-10-10T18:00" for a datetime-local input. */
export function dateToHoustonLocal(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const shifted = new Date(date.getTime() + zoneOffsetMs(date, TZ));
  return shifted.toISOString().slice(0, 16);
}
