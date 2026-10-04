import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import type { DroneClass } from "@/types";

/**
 * Only pilot profiles and RSVPs live in Postgres. Events, venues and drones stay
 * as static seed files in src/data — they're editorial content, not user data.
 */

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
     * Deliberately NOT a foreign key: events live in static TS files, so Postgres
     * cannot enforce this reference.
     *
     * Consequence: an event slug is permanent once published. Renaming one
     * silently orphans real RSVPs. Deleting an event leaves rows that no query
     * will ever surface (everything is keyed by slug), which is harmless but
     * wants a deliberate cleanup rather than a cascade.
     */
    eventSlug: text("event_slug").notNull(),
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
