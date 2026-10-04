import type { DroneLike } from "@/types";

/**
 * The drone-avatar seam. Today this renders a flat glyph; when real .glb models
 * land, only this file's internals change — every call site stays as-is. That is
 * why `Drone.model3d` already exists on the type.
 */
export default function DroneAvatar({ drone }: { drone: DroneLike }) {
  return (
    <div
      className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-surface-raised"
      title={`${drone.name} (${drone.class})`}
    >
      {drone.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- seed art is a local SVG; no optimisation needed yet
        <img src={drone.imageUrl} alt={`${drone.name} drone`} className="size-full object-cover" />
      ) : (
        <QuadGlyph />
      )}
    </div>
  );
}

/** Placeholder until pilots upload real builds. */
function QuadGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="size-7 text-muted" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="13" cy="13" r="6" />
        <circle cx="35" cy="13" r="6" />
        <circle cx="13" cy="35" r="6" />
        <circle cx="35" cy="35" r="6" />
        <path d="M17.5 17.5 21 21M30.5 17.5 27 21M17.5 30.5 21 27M30.5 30.5 27 27" />
        <rect x="19" y="19" width="10" height="10" rx="2.5" />
      </g>
    </svg>
  );
}
