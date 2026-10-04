"use client";

import { Show } from "@clerk/nextjs";
import Link from "next/link";

/**
 * Client-side, like HeaderAuth: rendering Clerk's <Show> in a server component
 * performs a server auth check during render, which would turn the statically
 * prerendered map dynamic.
 */
export default function MyEventsLink() {
  return (
    <Show when="signed-in">
      <Link href="/my-events" className="text-sm text-muted transition-colors hover:text-foreground">
        My events
      </Link>
    </Show>
  );
}
