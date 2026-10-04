/**
 * One-off migration: moves the static seed events and venues into Postgres.
 *
 * Slugs are preserved VERBATIM. A real RSVP already points at
 * "bear-creek-long-range", and the rsvps foreign key added after this script
 * runs will reject the migration if that slug is missing — so an exact copy is
 * not cosmetic, it's load-bearing.
 *
 * Idempotent: re-running inserts nothing new and reports what already exists.
 *
 *   npx tsx scripts/migrate-seed-to-db.ts
 */
import { eq } from "drizzle-orm";

import { events as seedEvents } from "../src/data/events";
import { venues as seedVenues } from "../src/data/venues";

/**
 * Env must be loaded before src/db is evaluated — it reads DATABASE_URL at
 * module scope, and static imports are hoisted above any statement here. Hence
 * the dynamic imports inside main().
 */
process.loadEnvFile(".env.local");

async function main() {
  const { getDb } = await import("../src/db");
  const { events, venues } = await import("../src/db/schema");
  const db = getDb();

  // Venues first: events carry a NOT NULL foreign key to them.
  const venueIdBySlug = new Map<string, number>();

  for (const v of seedVenues) {
    const [row] = await db
      .insert(venues)
      .values({
        slug: v.id, // seed ids ("v-cullen-park") become the venue slugs
        name: v.name,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        surface: v.surface,
        notes: v.notes ?? null,
        photos: v.photos,
      })
      .onConflictDoNothing({ target: venues.slug })
      .returning({ id: venues.id });

    if (row) {
      venueIdBySlug.set(v.id, row.id);
      console.log(`  + venue  ${v.id}`);
    } else {
      const [existing] = await db
        .select({ id: venues.id })
        .from(venues)
        .where(eq(venues.slug, v.id));
      venueIdBySlug.set(v.id, existing.id);
      console.log(`  = venue  ${v.id} (already present)`);
    }
  }

  for (const e of seedEvents) {
    const venueId = venueIdBySlug.get(e.venueId);
    if (!venueId) throw new Error(`Event ${e.slug} references unknown venue ${e.venueId}`);

    const [row] = await db
      .insert(events)
      .values({
        slug: e.slug,
        title: e.title,
        type: e.type,
        // The seed strings carry -05:00 offsets; Date parses them to the right
        // instant, and timestamptz stores it unambiguously from here on.
        startsAt: new Date(e.startsAt),
        endsAt: e.endsAt ? new Date(e.endsAt) : null,
        venueId,
        description: e.description,
        // Everything already public stays public.
        published: true,
      })
      .onConflictDoNothing({ target: events.slug })
      .returning({ id: events.id });

    console.log(row ? `  + event  ${e.slug}` : `  = event  ${e.slug} (already present)`);
  }

  const allVenues = await db.select({ slug: venues.slug }).from(venues);
  const allEvents = await db.select({ slug: events.slug }).from(events);

  console.log(`\n${allVenues.length} venues, ${allEvents.length} events in the database.`);

  // The canary: the one slug a real person's RSVP depends on.
  const canary = allEvents.some((e) => e.slug === "bear-creek-long-range");
  console.log(canary ? "✓ bear-creek-long-range present" : "✗ bear-creek-long-range MISSING");
  if (!canary) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
