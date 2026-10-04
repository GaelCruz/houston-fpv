import type { EventType } from "@/types";

const LABELS: Record<EventType, string> = {
  racing: "Racing",
  casual: "Casual",
};

export default function EventTypeBadge({
  type,
  size = "md",
}: {
  type: EventType;
  size?: "sm" | "md";
}) {
  const isRacing = type === "racing";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide uppercase",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        isRacing
          ? "border-racing/45 bg-racing/12 text-racing"
          : "border-casual/45 bg-casual/12 text-casual",
      ].join(" ")}
    >
      {/* Shape differs as well as colour, so the type is never colour-only. */}
      <span
        aria-hidden="true"
        className={
          isRacing
            ? "size-1.5 rotate-45 bg-racing"
            : "size-1.5 rounded-full bg-casual"
        }
      />
      {LABELS[type]}
    </span>
  );
}
