import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type { DroneClass, EventType, VenuePhoto, VenueSurface } from "@/types";

/**
 * Events and venues live here rather than in static files because the admin
 * page edits them from a browser — a web form cannot write to compiled
 * TypeScript. Demo pilots and drones used to be seed files too; they were
 * removed, so attendee lists show only real signups.
 */

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  surface: text("surface").$type<VenueSurface>().notNull(),
  /** Access rules, AMA membership, airspace warnings. */
  notes: text("notes"),
  /**
   * Photo uploads are deferred, not abandoned. Keeping the column carries the
   * migrated placeholder art and leaves room for real uploads later without
   * another migration.
   */
  photos: jsonb("photos").$type<VenuePhoto[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    /**
     * Public handle, used in ?event=<slug> links and referenced by rsvps.
     * Renaming one cascades to RSVPs rather than orphaning them (see rsvps).
     */
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    type: text("type").$type<EventType>().notNull(),
    /**
     * timestamptz rather than the offset-bearing ISO strings the seed files
     * used, so the instant is unambiguous. Display still pins America/Chicago.
     */
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    venueId: integer("venue_id")
      .notNull()
      // A venue in use by an event must not silently disappear.
      .references(() => venues.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    /** Drafts are invisible to the public map and the public API. */
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("events_published_starts_idx").on(t.published, t.startsAt)],
);

export const pilots = pgTable("pilots", {
  id: serial("id").primaryKey(),
  /**
   * Unique column rather than the primary key, so the auth provider stays
   * swappable and the rsvps foreign key doesn't depend on Clerk.
   */
  clerkUserId: text("clerk_user_id").notNull().unique(),
  username: text("username").notNull().unique(),
  droneName: text("drone_name").notNull(),
  droneClass: text("drone_class").$type<DroneClass>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rsvps = pgTable(
  "rsvps",
  {
    id: serial("id").primaryKey(),
    /**
     * A real foreign key now that events live in Postgres. The two rules below
     * fix both hazards the file-based version only documented:
     *
     * - onUpdate cascade: renaming a slug follows through to existing RSVPs
     *   instead of orphaning them, so slugs are editable again.
     * - onDelete restrict: deleting an event real people signed up for FAILS
     *   rather than silently erasing their RSVPs. The admin UI catches this and
     *   offers unpublish instead.
     */
    eventSlug: text("event_slug")
      .notNull()
      .references(() => events.slug, { onUpdate: "cascade", onDelete: "restrict" }),
    pilotId: integer("pilot_id")
      .notNull()
      .references(() => pilots.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    // The database, not the UI's disabled state, is what prevents double-RSVP.
    uniqueIndex("rsvps_event_pilot_idx").on(t.eventSlug, t.pilotId),
    // Listing attendees for one event is the hot path.
    index("rsvps_event_slug_idx").on(t.eventSlug),
  ],
);

export type PilotRow = typeof pilots.$inferSelect;
export type RsvpRow = typeof rsvps.$inferSelect;
export type VenueRow = typeof venues.$inferSelect;
export type EventRow = typeof events.$inferSelect;
