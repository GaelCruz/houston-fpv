"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import EventDetailPanel from "@/components/EventDetailPanel";
import WhenFilterControl from "@/components/WhenFilter";
import { WHEN_FILTERS, isWhenFilter, matchesWhen, type WhenFilter } from "@/lib/eventTime";
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
  // Both selection and filter live in the URL, so "meetups this week" is a
  // shareable link and browser back moves between views.
  const whenParam = searchParams.get("when");
  const when: WhenFilter = isWhenFilter(whenParam) ? whenParam : "all";

  const { visible, counts } = useMemo(() => {
    const now = new Date();
    const counts = Object.fromEntries(
      WHEN_FILTERS.map((f) => [f.value, events.filter((e) => matchesWhen(e, f.value, now)).length]),
    ) as Record<WhenFilter, number>;
    return { visible: events.filter((e) => matchesWhen(e, when, now)), counts };
  }, [events, when]);

  const requested = searchParams.get("event");
  // Only selectable while visible, so the panel can never describe a pin that
  // the current filter has hidden.
  const selected = visible.find((e) => e.slug === requested) ?? null;
  const selectedSlug = selected?.slug ?? null;

  const buildUrl = useCallback(
    (next: { event?: string | null; when?: WhenFilter }) => {
      const params = new URLSearchParams(searchParams.toString());
      const slug = next.event === undefined ? params.get("event") : next.event;
      const whenValue = next.when ?? when;

      params.delete("event");
      params.delete("when");
      if (slug) params.set("event", slug);
      if (whenValue !== "all") params.set("when", whenValue);

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams, when],
  );

  const select = useCallback(
    (slug: string) => router.replace(buildUrl({ event: slug }), { scroll: false }),
    [router, buildUrl],
  );

  const clear = useCallback(
    () => router.replace(buildUrl({ event: null }), { scroll: false }),
    [router, buildUrl],
  );

  const setWhen = useCallback(
    (next: WhenFilter) => {
      // Drop a selection the new filter would hide, so the panel and the pins
      // never disagree.
      const keep = selectedSlug && events.some((e) => e.slug === selectedSlug && matchesWhen(e, next))
        ? selectedSlug
        : null;
      router.replace(buildUrl({ event: keep, when: next }), { scroll: false });
    },
    [router, buildUrl, selectedSlug, events],
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <EventMap events={visible} selectedSlug={selectedSlug} onSelect={select} />

      {/* Filter and legend sit opposite the panel so they never collide. */}
      <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
        <WhenFilterControl value={when} counts={counts} onChange={setWhen} />
        <div className="pointer-events-none rounded-lg border border-border bg-background/85 px-3 py-2.5 backdrop-blur">
        <p className="mb-2 text-[10px] font-semibold tracking-widest text-muted uppercase">
          {visible.length} {visible.length === 1 ? "meetup" : "meetups"}
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
      </div>

      <EventDetailPanel event={selected} onClose={clear} />
    </div>
  );
}
