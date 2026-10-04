import { Suspense } from "react";

import MapExplorer from "@/components/MapExplorer";
import { getResolvedEvents } from "@/lib/data";

export default function Home() {
  const events = getResolvedEvents();

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
