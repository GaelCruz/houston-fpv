import DroneAvatar from "@/components/DroneAvatar";
import type { Attendee, DroneLike } from "@/types";

export default function AttendeeList({
  attendees,
  loading = false,
}: {
  attendees: Attendee[];
  loading?: boolean;
}) {
  if (attendees.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
        No one signed up yet. Be the first.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {attendees.map((attendee) =>
          attendee.kind === "seed" ? (
            <Row
              key={`seed-${attendee.pilot.id}`}
              drone={attendee.drone}
              username={attendee.pilot.username}
              detail={`${attendee.drone.name} · ${attendee.drone.class}`}
              trailing={
                attendee.drone.specs?.weightGrams
                  ? `${attendee.drone.specs.weightGrams}g`
                  : undefined
              }
              // Seed pilots are illustrative, not real signups. Say so plainly
              // rather than letting them pass as people who are actually coming.
              tag="demo"
            />
          ) : (
            <Row
              key={`rsvp-${attendee.rsvp.id}`}
              drone={{ name: attendee.rsvp.droneName, class: attendee.rsvp.droneClass }}
              username={attendee.rsvp.username}
              detail={`${attendee.rsvp.droneName} · ${attendee.rsvp.droneClass}`}
              tag={attendee.rsvp.isYou ? "you" : undefined}
              highlight={attendee.rsvp.isYou}
            />
          ),
        )}
      </ul>
      {loading ? <p className="mt-2 text-xs text-muted">Loading signups…</p> : null}
    </>
  );
}

function Row({
  drone,
  username,
  detail,
  trailing,
  tag,
  highlight = false,
}: {
  drone: DroneLike;
  username: string;
  detail: string;
  trailing?: string;
  tag?: "demo" | "you";
  highlight?: boolean;
}) {
  return (
    <li
      className={[
        "flex items-center gap-3 rounded-lg border px-3 py-2.5",
        highlight ? "border-casual/50 bg-casual/5" : "border-border bg-surface",
      ].join(" ")}
    >
      <DroneAvatar drone={drone} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate font-medium">
          <span className="truncate">{username}</span>
          {tag === "demo" ? (
            <span className="shrink-0 rounded border border-border px-1.5 py-px text-[10px] tracking-wide text-muted uppercase">
              demo
            </span>
          ) : null}
          {tag === "you" ? (
            <span className="shrink-0 rounded border border-casual/50 px-1.5 py-px text-[10px] tracking-wide text-casual uppercase">
              you
            </span>
          ) : null}
        </p>
        <p className="truncate text-sm text-muted">{detail}</p>
      </div>
      {trailing ? <span className="shrink-0 font-mono text-xs text-muted">{trailing}</span> : null}
    </li>
  );
}
