"use client";

import { useEffect } from "react";

import AttendeeList from "@/components/AttendeeList";
import EventTypeBadge from "@/components/EventTypeBadge";
import PhotoGallery from "@/components/PhotoGallery";
import { openDirections } from "@/lib/directions";
import { formatEventWhen } from "@/lib/format";
import type { ResolvedEvent } from "@/types";

/**
 * A sheet, not a modal: covering the map would hide the spatial context that is
 * the whole point of the page. Right-hand sheet from `md:` up, bottom sheet on
 * phones, map visible either way.
 */
export default function EventDetailPanel({
  event,
  onClose,
}: {
  event: ResolvedEvent | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!event) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  const { venue, attendees } = event;

  return (
    <aside
      aria-label={`Details for ${event.title}`}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex max-h-[62svh] flex-col border-t border-border bg-background/95 backdrop-blur md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[400px] md:border-t-0 md:border-l"
    >
      <header className="flex items-start gap-3 border-b border-border px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <EventTypeBadge type={event.type} />
          <h2 className="mt-2 text-lg leading-tight font-semibold">{event.title}</h2>
          <p className="mt-1 text-sm text-muted">{formatEventWhen(event)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close event details"
          className="-mr-1 grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-casual focus-visible:outline-none"
        >
          <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="text-sm leading-relaxed text-foreground/85">{event.description}</p>

        <Section title="Location">
          <p className="font-medium">{venue.name}</p>
          <p className="text-sm text-muted">{venue.address}</p>
          <p className="mt-1 text-xs tracking-wide text-muted uppercase">{venue.surface} surface</p>
          <button
            type="button"
            onClick={() => openDirections(venue)}
            aria-label={`Directions to ${venue.name}`}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:border-casual/50 hover:text-casual focus-visible:ring-2 focus-visible:ring-casual focus-visible:outline-none"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            Directions
          </button>
          {venue.notes ? (
            <p className="mt-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted">
              {venue.notes}
            </p>
          ) : null}
          <div className="mt-3">
            <PhotoGallery photos={venue.photos} />
          </div>
        </Section>

        <Section title={`Pilots flying (${attendees.length})`}>
          <AttendeeList attendees={attendees} />
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-border pt-4">
      <h3 className="mb-2 text-xs font-semibold tracking-widest text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}
