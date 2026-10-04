"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { pilots, rsvps } from "@/db/schema";
import { getEventBySlug } from "@/lib/data";
import { getPilotByClerkId } from "@/lib/rsvps";
import { DRONE_CLASSES, type DroneClass } from "@/types";

/**
 * Write paths for RSVPs.
 *
 * Results are returned, never thrown, so the UI can show real error text
 * instead of a crashed boundary. `code` lets the button distinguish "you need a
 * profile first" from a genuine failure.
 */
export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; code?: "NO_AUTH" | "NO_PROFILE" };

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * The user id always comes from the session, never from a client argument.
 * A server action is a public HTTP endpoint — anything the caller sends is
 * untrusted.
 */
async function requireUserId(): Promise<
  { ok: true; userId: string } | { ok: false; error: string; code: "NO_AUTH" }
> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Sign in to RSVP.", code: "NO_AUTH" };
  }
  return { ok: true, userId };
}

export async function rsvpToEvent(slug: string): Promise<ActionResult> {
  const session = await requireUserId();
  if (!session.ok) return session;

  // Published-only lookup, so arbitrary strings AND drafts are both rejected.
  if (!(await getEventBySlug(slug))) {
    return { ok: false, error: "That event doesn't exist." };
  }

  const pilot = await getPilotByClerkId(session.userId);
  if (!pilot) {
    return { ok: false, error: "Set up your pilot profile first.", code: "NO_PROFILE" };
  }

  try {
    // The unique index is the real guard against double-RSVP; this just makes a
    // double-click a no-op instead of an error.
    await getDb()
      .insert(rsvps)
      .values({ eventSlug: slug, pilotId: pilot.id })
      .onConflictDoNothing();
    return { ok: true };
  } catch (error) {
    console.error("[actions] rsvpToEvent failed:", error);
    return { ok: false, error: "Couldn't save your RSVP. Try again." };
  }
}

export async function cancelRsvp(slug: string): Promise<ActionResult> {
  const session = await requireUserId();
  if (!session.ok) return session;

  const pilot = await getPilotByClerkId(session.userId);
  if (!pilot) return { ok: false, error: "No profile to cancel for.", code: "NO_PROFILE" };

  try {
    // Scoped to this pilot, so nobody can cancel someone else's RSVP.
    await getDb()
      .delete(rsvps)
      .where(and(eq(rsvps.eventSlug, slug), eq(rsvps.pilotId, pilot.id)));
    return { ok: true };
  } catch (error) {
    console.error("[actions] cancelRsvp failed:", error);
    return { ok: false, error: "Couldn't cancel. Try again." };
  }
}

export async function saveProfile(input: {
  username: string;
  droneName: string;
  droneClass: string;
}): Promise<ActionResult> {
  const session = await requireUserId();
  if (!session.ok) return session;

  const username = input.username.trim();
  const droneName = input.droneName.trim();

  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      error: "Pilot name must be 3–20 characters: letters, numbers or underscores.",
    };
  }
  if (droneName.length < 1 || droneName.length > 40) {
    return { ok: false, error: "Drone name must be 1–40 characters." };
  }
  if (!DRONE_CLASSES.includes(input.droneClass as DroneClass)) {
    return { ok: false, error: "Pick a drone class from the list." };
  }
  const droneClass = input.droneClass as DroneClass;

  try {
    await getDb()
      .insert(pilots)
      .values({ clerkUserId: session.userId, username, droneName, droneClass })
      // Lets a pilot edit their build later without a separate update path.
      .onConflictDoUpdate({
        target: pilots.clerkUserId,
        set: { username, droneName, droneClass },
      });
    return { ok: true };
  } catch (error) {
    // username has a unique index; a collision is a normal outcome, not a crash.
    if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
      return { ok: false, error: `"${username}" is taken. Pick another.` };
    }
    console.error("[actions] saveProfile failed:", error);
    return { ok: false, error: "Couldn't save your profile. Try again." };
  }
}
