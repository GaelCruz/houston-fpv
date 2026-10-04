import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

import EventCard from "@/components/EventCard";
import SiteHeader from "@/components/SiteHeader";
import { bucketOf } from "@/lib/eventTime";
import { getEventsForPilot } from "@/lib/rsvps";
import type { ResolvedEvent } from "@/types";

export const metadata: Metadata = {
  title: "My events — Houston FPV",
  description: "The Houston FPV meetups you've signed up for.",
};

export default async function MyEventsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <Shell>
        <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
          Sign in to see the meetups you&apos;ve signed up for.
        </p>
        <div className="mt-3 flex justify-center">
          <SignInButton mode="modal" forceRedirectUrl="/my-events">
            <button
              type="button"
              className="rounded-lg bg-casual px-4 py-2.5 text-sm font-semibold text-background"
            >
              Sign in
            </button>
          </SignInButton>
        </div>
      </Shell>
    );
  }

  const events = await getEventsForPilot(userId);
  const now = new Date();

  // One pass, so an event can't land in two buckets.
  const happeningNow: ResolvedEvent[] = [];
  const upcoming: ResolvedEvent[] = [];
  const past: ResolvedEvent[] = [];
  for (const e of events) {
    const bucket = bucketOf(e, now);
    if (bucket === "past") past.push(e);
    else if (bucket === "now") happeningNow.push(e);
    else upcoming.push(e);
  }
  // Most recent first reads better for history than oldest-first.
  past.reverse();

  return (
    <Shell>
      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
          You haven&apos;t signed up for anything yet.{" "}
          <Link href="/" className="text-casual underline underline-offset-2">
            Find a meetup
          </Link>
          .
        </p>
      ) : (
        <>
          <Section title="Happening now" count={happeningNow.length} accent>
            {happeningNow.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </Section>
          <Section title="Upcoming" count={upcoming.length}>
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </Section>
          <Section title="Past" count={past.length}>
            {past.map((e) => (
              <EventCard key={e.id} event={e} muted />
            ))}
          </Section>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="mb-5 text-lg font-semibold">My events</h1>
        {children}
      </main>
    </div>
  );
}

function Section({
  title,
  count,
  accent = false,
  children,
}: {
  title: string;
  count: number;
  accent?: boolean;
  children: React.ReactNode;
}) {
  // Empty sections are hidden rather than shown as "(0)" — three empty headings
  // is noise, not information.
  if (count === 0) return null;
  return (
    <section className="mb-6">
      <h2
        className={[
          "mb-2 text-xs font-semibold tracking-widest uppercase",
          accent ? "text-casual" : "text-muted",
        ].join(" ")}
      >
        {title} ({count})
      </h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </section>
  );
}
