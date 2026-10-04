import { Suspense } from "react";

import MapExplorer from "@/components/MapExplorer";
import SiteHeader from "@/components/SiteHeader";
import { getUpcomingEvents } from "@/lib/data";

/**
 * Drizzle queries don't go through Next's data cache, so without this the DB
 * read would make the public map dynamic. Prerendered and regenerated at most
 * every 5 minutes — admin mutations call revalidatePath("/") so edits show up
 * immediately rather than waiting out the window.
 */
export const revalidate = 300;

export default async function Home() {
  // Upcoming only. Finished meetups live on their venue's page instead of
  // accumulating as dead pins on the map.
  const events = await getUpcomingEvents();

  return (
    <main className="flex h-svh flex-col">
      <SiteHeader />
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
