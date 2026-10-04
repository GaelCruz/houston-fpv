import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EventCard from "@/components/EventCard";
import PhotoGallery from "@/components/PhotoGallery";
import SiteHeader from "@/components/SiteHeader";
import { bucketOf } from "@/lib/eventTime";
import { getEventsAtVenue, getVenueBySlug, getVenues } from "@/lib/data";
import { getRsvpCounts } from "@/lib/rsvps";
import type { ResolvedEvent } from "@/types";

/**
 * Public and crawlable: someone searching for a Houston flying spot should be
 * able to find this. Regenerated on the same cadence as the map.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  const venues = await getVenues();
  return venues.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) return { title: "Venue not found — Houston FPV" };
  return {
    title: `${venue.name} — Houston FPV`,
    description: `FPV drone meetups at ${venue.name}, ${venue.address}.`,
  };
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  const events = await getEventsAtVenue(venue.id);
  const counts = await getRsvpCounts(events.map((e) => e.slug));
  const now = new Date();

  const upcoming: ResolvedEvent[] = [];
  const past: ResolvedEvent[] = [];
  for (const e of events) {
    (bucketOf(e, now) === "past" ? past : upcoming).push(e);
  }
  past.reverse(); // most recent first reads better for history

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="text-xl font-semibold">{venue.name}</h1>
        <p className="mt-1 text-sm text-muted">{venue.address}</p>
        <p className="mt-1 text-xs tracking-wide text-muted uppercase">
          {venue.surface} surface · {venue.lat.toFixed(4)}, {venue.lng.toFixed(4)}
        </p>

        {venue.notes ? (
          <p className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted">
            {venue.notes}
          </p>
        ) : null}

        {venue.photos.length > 0 ? (
          <div className="mt-4">
            <PhotoGallery photos={venue.photos} />
          </div>
        ) : null}

        <Section title="Upcoming" count={upcoming.length} emptyNote="Nothing scheduled here yet.">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} trailing={<Count n={counts[e.slug] ?? 0} />} />
          ))}
        </Section>

        <Section title="Past meetups" count={past.length} emptyNote="No meetups here yet.">
          {past.map((e) => (
            <EventCard key={e.id} event={e} muted trailing={<Count n={counts[e.slug] ?? 0} />} />
          ))}
        </Section>
      </main>
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="text-xs text-muted">
      {n} {n === 1 ? "pilot" : "pilots"}
    </span>
  );
}

function Section({
  title,
  count,
  emptyNote,
  children,
}: {
  title: string;
  count: number;
  emptyNote: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted uppercase">
        {title} {count > 0 ? `(${count})` : ""}
      </h2>
      {count === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
          {emptyNote}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">{children}</ul>
      )}
    </section>
  );
}
