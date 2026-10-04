import Link from "next/link";

import HeaderAuth from "@/components/HeaderAuth";
import MyEventsLink from "@/components/MyEventsLink";

/** Shared chrome so the map and /my-events don't drift apart. */
export default function SiteHeader() {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
      <Link href="/" className="shrink-0 text-base font-semibold tracking-tight">
        Houston <span className="text-casual">FPV</span>
      </Link>
      {/* The tagline is the first thing to go when space is tight. */}
      <p className="hidden truncate text-sm text-muted lg:block">
        Drone meetups across the greater Houston area
      </p>
      <div className="ml-auto flex items-center gap-3">
        <MyEventsLink />
        <HeaderAuth />
      </div>
    </header>
  );
}
