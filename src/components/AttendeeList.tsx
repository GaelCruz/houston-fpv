import DroneAvatar from "@/components/DroneAvatar";
import type { Drone, Pilot } from "@/types";

export default function AttendeeList({
  attendees,
}: {
  attendees: { pilot: Pilot; drone: Drone }[];
}) {
  if (attendees.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
        No one signed up yet. Be the first.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {attendees.map(({ pilot, drone }) => (
        <li
          key={pilot.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
        >
          <DroneAvatar drone={drone} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{pilot.username}</p>
            <p className="truncate text-sm text-muted">
              {drone.name} · {drone.class}
            </p>
          </div>
          {drone.specs?.weightGrams ? (
            <span className="shrink-0 font-mono text-xs text-muted">
              {drone.specs.weightGrams}g
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
