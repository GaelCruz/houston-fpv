import Link from "next/link";

import { VenueRowActions } from "@/components/admin/RowActions";
import { getVenues } from "@/lib/data";

export default async function AdminVenuesPage() {
  const venues = await getVenues();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Venues</h1>
        <Link
          href="/admin/venues/new"
          className="rounded-lg bg-casual px-3 py-2 text-sm font-semibold text-background"
        >
          New venue
        </Link>
      </div>

      {venues.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-10 text-center text-sm text-muted">
          No venues yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {venues.map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-surface px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <Link href={`/admin/venues/${v.id}/edit`} className="font-medium hover:text-casual">
                  {v.name}
                </Link>
                <p className="mt-1 text-sm text-muted">{v.address}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {v.lat}, {v.lng} · {v.surface}
                </p>
              </div>
              <VenueRowActions id={v.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
