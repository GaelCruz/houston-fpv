import { asc, eq, inArray, sql } from "drizzle-orm";

import { tryGetDb } from "@/db";
import { events, pilots, rsvps, venues } from "@/db/schema";
import { toEvent, toVenue } from "@/lib/data";
import type { ResolvedEvent, RsvpAttendee } from "@/types";

/**
 * The async, database-backed half of the data layer.
 *
 * src/lib/data.ts stays synchronous and owns the static seed content. This
 * module owns everything that lives in Postgres. Between them, those two files
 * are the only places that know where data comes from — components never do.
 *
 * Every read degrades to empty rather than throwing. The map is the product and
 * RSVPs are an addition to it: with no DATABASE_URL, or with Neon briefly
 * unreachable, the site must still browse perfectly.
 */

/** Pilots who have RSVP'd to one event, oldest signup first. */
export async function getEventRsvps(slug: string): Promise<RsvpAttendee[]> {
  const db = tryGetDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({
        id: rsvps.id,
        pilotId: rsvps.pilotId,
        username: pilots.username,
        droneName: pilots.droneName,
        droneClass: pilots.droneClass,
      })
      .from(rsvps)
      .innerJoin(pilots, eq(rsvps.pilotId, pilots.id))
      .where(eq(rsvps.eventSlug, slug))
      .orderBy(asc(rsvps.createdAt));

    // isYou is resolved by the caller, which is the only place that knows who
    // is looking at the page.
    return rows.map((r) => ({ ...r, isYou: false }));
  } catch (error) {
    console.error(`[rsvps] failed to load attendees for "${slug}":`, error);
    return [];
  }
}

/** RSVP counts for many events in one query, for map pins and list badges. */
export async function getRsvpCounts(slugs: string[]): Promise<Record<string, number>> {
  const db = tryGetDb();
  if (!db || slugs.length === 0) return {};

  try {
    const rows = await db
      .select({ slug: rsvps.eventSlug, count: sql<number>`count(*)::int` })
      .from(rsvps)
      .where(inArray(rsvps.eventSlug, slugs))
      .groupBy(rsvps.eventSlug);

    return Object.fromEntries(rows.map((r) => [r.slug, r.count]));
  } catch (error) {
    console.error("[rsvps] failed to load counts:", error);
    return {};
  }
}

/**
 * The viewer's pilot profile, or null if they haven't made one yet. Null is the
 * signal that the RSVP flow should show the profile form first.
 */
export async function getPilotByClerkId(clerkUserId: string) {
  const db = tryGetDb();
  if (!db) return null;

  try {
    const [pilot] = await db
      .select()
      .from(pilots)
      .where(eq(pilots.clerkUserId, clerkUserId))
      .limit(1);
    return pilot ?? null;
  } catch (error) {
    console.error("[rsvps] failed to load pilot profile:", error);
    return null;
  }
}

/**
 * Every event a pilot has RSVP'd to, with its venue — past ones included,
 * because "what have I flown this year" is half the point of the page.
 *
 * Joined through clerk_user_id so the caller passes a session id and never has
 * to resolve the pilot first.
 */
export async function getEventsForPilot(clerkUserId: string): Promise<ResolvedEvent[]> {
  const db = tryGetDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({ event: events, venue: venues })
      .from(rsvps)
      .innerJoin(pilots, eq(rsvps.pilotId, pilots.id))
      .innerJoin(events, eq(rsvps.eventSlug, events.slug))
      .innerJoin(venues, eq(events.venueId, venues.id))
      .where(eq(pilots.clerkUserId, clerkUserId))
      .orderBy(asc(events.startsAt));

    return rows.map((r) => ({
      ...toEvent(r.event),
      venue: toVenue(r.venue),
    }));
  } catch (error) {
    console.error("[rsvps] failed to load events for pilot:", error);
    return [];
  }
}
