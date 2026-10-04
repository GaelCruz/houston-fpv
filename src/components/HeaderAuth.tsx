"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

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
  /**
   * usePathname rather than useSearchParams: the latter opts a page into dynamic
   * rendering unless it sits inside a Suspense boundary, and this header renders
   * outside the one on the map page. Signing in is a modal anyway, so it almost
   * never navigates — this only matters when Clerk redirects out for email
   * verification, and landing back on the right page beats landing on the map.
   */
  const pathname = usePathname();

  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal" forceRedirectUrl={pathname} signUpForceRedirectUrl={pathname}>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-casual/50 hover:text-casual focus-visible:ring-2 focus-visible:ring-casual focus-visible:outline-none"
          >
            Sign in
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
