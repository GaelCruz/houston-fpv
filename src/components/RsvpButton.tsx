"use client";

import { SignInButton } from "@clerk/nextjs";
import { useEffect, useOptimistic, useState, useTransition } from "react";

import { cancelRsvp, rsvpToEvent } from "@/app/actions";
import ProfileForm from "@/components/ProfileForm";
import type { Viewer } from "@/types";

/**
 * Remembers which event a pilot was signing up for. Creating an account can
 * leave the page entirely — email verification navigates away, and Clerk then
 * returns to a fresh load — so the intent has to survive outside React state.
 * sessionStorage is the right scope: this tab, this visit, cleared on use.
 */
const PENDING_KEY = "houston-fpv:pending-rsvp";

function readPending(): string | null {
  try {
    return sessionStorage.getItem(PENDING_KEY);
  } catch {
    return null; // private browsing, storage disabled
  }
}

function writePending(slug: string) {
  try {
    sessionStorage.setItem(PENDING_KEY, slug);
  } catch {
    // Not fatal: the redirect still lands on the right event, the pilot just
    // taps RSVP once more.
  }
}

function clearPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * The commitment point — the one place the site asks anyone to sign in.
 *
 * Signed out, the button is wrapped in a modal sign-in. The modal opens on the
 * current route, so the URL keeps ?event=<slug>, the panel stays open and the
 * map never reloads. Account creation can still navigate away for email
 * verification, which is why both a return URL and a stored intent exist.
 */
export default function RsvpButton({
  slug,
  viewer,
  onChanged,
}: {
  slug: string;
  viewer: Viewer;
  onChanged: () => void;
}) {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const [pending, startTransition] = useTransition();

  // Flips immediately on click and reverts if the server disagrees, so the
  // button never feels like it's waiting on a Neon cold start.
  const [optimisticRsvped, setOptimisticRsvped] = useOptimistic(viewer.rsvped);

  /**
   * Clerk sends the pilot back here after signing in or signing up. Pick the
   * flow back up where they left it instead of making them find the event and
   * click RSVP a second time.
   */
  useEffect(() => {
    if (resumed || !viewer.signedIn) return;
    if (readPending() !== slug) return;

    startTransition(async () => {
      setResumed(true);
      clearPending();

      // A brand-new account has no profile yet — that form is the next step.
      if (!viewer.hasProfile) {
        setShowProfileForm(true);
        return;
      }
      if (viewer.rsvped) return;

      const result = await rsvpToEvent(slug);
      if (result.ok) onChanged();
      else setError(result.error);
    });
  }, [resumed, viewer, slug, onChanged]);

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticRsvped(!viewer.rsvped);
      const result = viewer.rsvped ? await cancelRsvp(slug) : await rsvpToEvent(slug);
      if (result.ok) {
        onChanged();
        return;
      }
      // The optimistic value unwinds on its own when the transition ends.
      if (result.code === "NO_PROFILE") {
        setShowProfileForm(true);
        return;
      }
      setError(result.error);
    });
  }

  if (showProfileForm) {
    return (
      <ProfileForm
        onSaved={() => {
          setShowProfileForm(false);
          // Finish what they originally clicked, rather than making them ask twice.
          startTransition(async () => {
            const result = await rsvpToEvent(slug);
            if (!result.ok) setError(result.error);
            onChanged();
          });
        }}
        onCancel={() => setShowProfileForm(false)}
      />
    );
  }

  if (!viewer.signedIn) {
    // Bring them back to this exact event, not the bare map. These override the
    // NEXT_PUBLIC_CLERK_*_FALLBACK_REDIRECT_URL values, which both point at "/".
    const returnUrl = `/?event=${encodeURIComponent(slug)}`;
    return (
      <SignInButton
        mode="modal"
        forceRedirectUrl={returnUrl}
        signUpForceRedirectUrl={returnUrl}
      >
        <button type="button" onClick={() => writePending(slug)} className={primaryClass}>
          I&apos;m flying this
        </button>
      </SignInButton>
    );
  }

  // Signed in but no profile yet: go straight to the form rather than letting
  // them click into a guaranteed error.
  if (!viewer.hasProfile) {
    return (
      <button type="button" onClick={() => setShowProfileForm(true)} className={primaryClass}>
        I&apos;m flying this
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={optimisticRsvped}
        className={optimisticRsvped ? goingClass : primaryClass}
      >
        {optimisticRsvped ? (
          <>
            <span className="group-hover:hidden">You&apos;re in ✓</span>
            <span className="hidden group-hover:inline">Cancel RSVP</span>
          </>
        ) : (
          "I'm flying this"
        )}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-racing">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const base =
  "group w-full rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-casual focus-visible:outline-none";

const primaryClass = `${base} bg-casual text-background hover:bg-casual/90`;

const goingClass = `${base} border border-casual/50 bg-casual/10 text-casual hover:border-racing/50 hover:bg-racing/10 hover:text-racing`;
