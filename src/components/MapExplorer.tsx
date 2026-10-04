"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import EventDetailPanel from "@/components/EventDetailPanel";
import type { ResolvedEvent } from "@/types";

/**
 * MapLibre touches `window` at import time, so the map must never render on the
 * server. `ssr: false` is only legal inside a client component in the App
 * Router — which is why this file carries "use client".
 */
const EventMap = dynamic(() => import("@/components/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-background text-sm text-muted">
      Loading map…
    </div>
  ),
});

export default function MapExplorer({ events }: { events: ResolvedEvent[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the single source of truth, so links like ?event=slug are
  // shareable and browser back/forward moves between events for free.
  const requested = searchParams.get("event");
  const selected = events.find((e) => e.slug === requested) ?? null;
  const selectedSlug = selected?.slug ?? null;

  const select = useCallback(
    (slug: string) => {
      router.replace(`${pathname}?event=${encodeURIComponent(slug)}`, { scroll: false });
    },
    [router, pathname],
  );

  const clear = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <EventMap events={events} selectedSlug={selectedSlug} onSelect={select} />

      {/* Legend sits opposite the panel so the two never collide. */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg border border-border bg-background/85 px-3 py-2.5 backdrop-blur">
        <p className="mb-2 text-[10px] font-semibold tracking-widest text-muted uppercase">
          {events.length} meetups
        </p>
        <ul className="flex flex-col gap-1.5 text-xs">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rotate-45 border-2 border-racing bg-racing/25" />
            Racing
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-full border-2 border-casual bg-casual/25" />
            Casual
          </li>
        </ul>
      </div>

      <EventDetailPanel event={selected} onClose={clear} />
    </div>
  );
}
