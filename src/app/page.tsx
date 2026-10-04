import { Suspense } from "react";

import HeaderAuth from "@/components/HeaderAuth";
import MapExplorer from "@/components/MapExplorer";
import { getResolvedEvents } from "@/lib/data";

/**
 * Drizzle queries don't go through Next's data cache, so without this the DB
 * read would make the public map dynamic. Prerendered and regenerated at most
 * every 5 minutes — admin mutations call revalidatePath("/") so edits show up
 * immediately rather than waiting out the window.
 */
export const revalidate = 300;

export default async function Home() {
  const events = await getResolvedEvents();

  return (
    <main className="flex h-svh flex-col">
      <header className="flex shrink-0 items-baseline gap-3 border-b border-border px-4 py-3">
        <h1 className="shrink-0 text-base font-semibold tracking-tight">
          Houston <span className="text-casual">FPV</span>
        </h1>
        {/* The tagline is the first thing to go when space is tight. */}
        <p className="hidden truncate text-sm text-muted sm:block">
          Drone meetups across the greater Houston area
        </p>
        <HeaderAuth />
      </header>

      <div className="min-h-0 flex-1">
        {/* MapExplorer reads useSearchParams, which needs a Suspense boundary
            for this page to stay statically rendered. */}
        <Suspense fallback={<div className="h-full w-full bg-background" />}>
          <MapExplorer events={events} />
        </Suspense>
      </div>
    </main>
  );
}
