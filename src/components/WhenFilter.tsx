"use client";

import { WHEN_FILTERS, type WhenFilter } from "@/lib/eventTime";

export default function WhenFilterControl({
  value,
  counts,
  onChange,
}: {
  value: WhenFilter;
  counts: Record<WhenFilter, number>;
  onChange: (next: WhenFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter meetups by when they happen"
      className="flex rounded-lg border border-border bg-background/85 p-0.5 backdrop-blur"
    >
      {WHEN_FILTERS.map((f) => {
        const selected = f.value === value;
        const count = counts[f.value];
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            aria-pressed={selected}
            // Nothing in this range: still selectable, but say so up front
            // rather than letting someone click into a blank map and wonder.
            disabled={count === 0 && !selected}
            className={[
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              selected
                ? "bg-casual text-background"
                : count === 0
                  ? "text-muted/40"
                  : "text-muted hover:text-foreground",
            ].join(" ")}
          >
            {f.label}
            <span className={selected ? "ml-1 opacity-70" : "ml-1 opacity-50"}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
