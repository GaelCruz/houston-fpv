"use client";

import { Show, UserButton } from "@clerk/nextjs";

/**
 * Deliberately a client component.
 *
 * Rendering Clerk's <Show> directly in page.tsx performs a server-side auth
 * check during the page render, which silently turns the whole public map from
 * static into dynamic — the build output flips / from ○ to ƒ. Behind a client
 * boundary the check happens in the browser against ClerkProvider instead, and
 * the map stays prerendered for anonymous visitors.
 *
 * Core 3 removed <SignedIn>/<SignedOut> in favour of <Show when>.
 */
export default function HeaderAuth() {
  return (
    <Show when="signed-in">
      <div className="ml-auto flex items-center">
        <UserButton />
      </div>
    </Show>
  );
}
