import DroneAvatar from "@/components/DroneAvatar";
import type { RsvpAttendee } from "@/types";

/**
 * Real signups only. Demo pilots were removed when events moved into the
 * database — invented attendees on a site with real users could mislead someone
 * into thinking a meetup is better attended than it is.
 */
export default function AttendeeList({
  attendees,
  loading = false,
}: {
  attendees: RsvpAttendee[];
  loading?: boolean;
}) {
  if (attendees.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
        {loading ? "Loading signups…" : "No one signed up yet. Be the first."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {attendees.map((a) => (
        <li
          key={a.id}
          className={[
            "flex items-center gap-3 rounded-lg border px-3 py-2.5",
            a.isYou ? "border-casual/50 bg-casual/5" : "border-border bg-surface",
          ].join(" ")}
        >
          <DroneAvatar drone={{ name: a.droneName, class: a.droneClass }} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 truncate font-medium">
              <span className="truncate">{a.username}</span>
              {a.isYou ? (
                <span className="shrink-0 rounded border border-casual/50 px-1.5 py-px text-[10px] tracking-wide text-casual uppercase">
                  you
                </span>
              ) : null}
            </p>
            <p className="truncate text-sm text-muted">
              {a.droneName} · {a.droneClass}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
