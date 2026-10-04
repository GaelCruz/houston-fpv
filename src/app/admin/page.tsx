import Link from "next/link";

import { EventRowActions } from "@/components/admin/RowActions";
import EventTypeBadge from "@/components/EventTypeBadge";
import { adminGetAllEvents } from "@/lib/data";
import { formatEventWhen } from "@/lib/format";

export default async function AdminEventsPage() {
  const events = await adminGetAllEvents();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Events</h1>
        <Link
          href="/admin/events/new"
          className="rounded-lg bg-casual px-3 py-2 text-sm font-semibold text-background"
        >
          New event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-10 text-center text-sm text-muted">
          No events yet. Create the first one.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-surface px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <EventTypeBadge type={e.type} size="sm" />
                  {e.published ? null : (
                    <span className="rounded border border-border px-1.5 py-px text-[10px] tracking-wide text-muted uppercase">
                      draft
                    </span>
                  )}
                  <Link href={`/admin/events/${e.id}/edit`} className="font-medium hover:text-casual">
                    {e.title}
                  </Link>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatEventWhen(e)} · {e.venue.name}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted">{e.slug}</p>
              </div>
              <EventRowActions id={e.id} published={e.published} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
