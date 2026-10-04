import Link from "next/link";

import EventTypeBadge from "@/components/EventTypeBadge";
import { formatEventWhen } from "@/lib/format";
import type { ResolvedEvent } from "@/types";

/** Shared row used by /my-events and the venue pages. */
export default function EventCard({
  event,
  muted = false,
  trailing,
}: {
  event: ResolvedEvent;
  /** Dims finished events so history doesn't compete with what's coming. */
  muted?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <li
      className={[
        "flex flex-wrap items-start gap-3 rounded-lg border border-border px-3 py-3",
        muted ? "bg-surface/50 opacity-70" : "bg-surface",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <EventTypeBadge type={event.type} size="sm" />
          <Link href={`/?event=${encodeURIComponent(event.slug)}`} className="font-medium hover:text-casual">
            {event.title}
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">{formatEventWhen(event)}</p>
        <Link
          href={`/venues/${encodeURIComponent(event.venue.slug)}`}
          className="mt-0.5 inline-block text-sm text-muted underline decoration-border underline-offset-2 hover:text-casual"
        >
          {event.venue.name}
        </Link>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </li>
  );
}
