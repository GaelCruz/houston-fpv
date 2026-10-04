import { and, asc, eq } from "drizzle-orm";

import { tryGetDb } from "@/db";
import { events, venues } from "@/db/schema";
import type { EventRow, VenueRow } from "@/db/schema";
import type { DroneEvent, ResolvedEvent, Venue } from "@/types";

/**
 * Events and venues — the editorial half of the data layer. Pilots and RSVPs
 * live in src/lib/rsvps.ts. Between them, these two modules are the only places
 * that know data comes from Postgres; components never do.
 *
 * Public reads filter `published = true` AT THE QUERY LEVEL. That single rule is
 * what keeps drafts out of the map, out of the attendees API, and out of the
 * RSVP actions — all three validate through getEventBySlug.
 */

function toVenue(row: VenueRow): Venue {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    surface: row.surface,
    photos: row.photos,
    notes: row.notes,
  };
}

function toEvent(row: EventRow): DroneEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    // Serialised so the value survives the crossing into client components.
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    venueId: row.venueId,
    description: row.description,
    published: row.published,
  };
}

/** Published events with their venues, soonest first. The public map's source. */
export async function getResolvedEvents(): Promise<ResolvedEvent[]> {
  const db = tryGetDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({ event: events, venue: venues })
      .from(events)
      .innerJoin(venues, eq(events.venueId, venues.id))
      .where(eq(events.published, true))
      .orderBy(asc(events.startsAt));

    return rows.map((r) => ({ ...toEvent(r.event), venue: toVenue(r.venue) }));
  } catch (error) {
    console.error("[data] failed to load events:", error);
    return [];
  }
}

/**
 * Published events only. Used to validate slugs in the attendees route handler
 * and in rsvpToEvent, so an unpublished event behaves as if it does not exist.
 */
export async function getEventBySlug(slug: string): Promise<DroneEvent | undefined> {
  const db = tryGetDb();
  if (!db) return undefined;

  try {
    const [row] = await db
      .select()
      .from(events)
      .where(and(eq(events.slug, slug), eq(events.published, true)))
      .limit(1);
    return row ? toEvent(row) : undefined;
  } catch (error) {
    console.error(`[data] failed to load event "${slug}":`, error);
    return undefined;
  }
}

export async function getVenues(): Promise<Venue[]> {
  const db = tryGetDb();
  if (!db) return [];

  try {
    const rows = await db.select().from(venues).orderBy(asc(venues.name));
    return rows.map(toVenue);
  } catch (error) {
    console.error("[data] failed to load venues:", error);
    return [];
  }
}

export async function getVenueById(id: number): Promise<Venue | undefined> {
  const db = tryGetDb();
  if (!db) return undefined;

  try {
    const [row] = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
    return row ? toVenue(row) : undefined;
  } catch (error) {
    console.error(`[data] failed to load venue ${id}:`, error);
    return undefined;
  }
}

/* ------------------------------------------------------------------ *
 * Admin reads. Deliberately separate names, and deliberately NOT
 * filtered by `published`, so a public call site can never reach a
 * draft by picking the wrong function.
 * ------------------------------------------------------------------ */

export async function adminGetAllEvents(): Promise<ResolvedEvent[]> {
  const db = tryGetDb();
  if (!db) return [];

  const rows = await db
    .select({ event: events, venue: venues })
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .orderBy(asc(events.startsAt));

  return rows.map((r) => ({ ...toEvent(r.event), venue: toVenue(r.venue) }));
}

export async function adminGetEventById(id: number): Promise<DroneEvent | undefined> {
  const db = tryGetDb();
  if (!db) return undefined;

  const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return row ? toEvent(row) : undefined;
}
