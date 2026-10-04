import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getEventBySlug } from "@/lib/data";
import { getEventRsvps, getPilotByClerkId } from "@/lib/rsvps";
import type { Viewer } from "@/types";

/**
 * Attendees for one event, plus who is asking.
 *
 * This endpoint exists so the map page can stay statically prerendered. Fetching
 * RSVPs during the page render would make the whole public map dynamic, and
 * personal state ("did I RSVP?") would risk leaking into a shared cache. Instead
 * the detail panel calls this when it opens — one small query per event a
 * visitor actually looks at.
 *
 * Bundling the viewer in means the RSVP button needs no request of its own.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  // Next 16 hands route params in as a promise.
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Validate against the seed so arbitrary strings never reach a query.
  if (!getEventBySlug(slug)) {
    return NextResponse.json({ error: "Unknown event" }, { status: 404 });
  }

  const { userId } = await auth();
  const me = userId ? await getPilotByClerkId(userId) : null;

  const rows = await getEventRsvps(slug);
  const attendees = rows.map((r) => ({ ...r, isYou: me ? r.pilotId === me.id : false }));

  const viewer: Viewer = {
    signedIn: Boolean(userId),
    hasProfile: Boolean(me),
    rsvped: attendees.some((a) => a.isYou),
  };

  return NextResponse.json({ attendees, viewer });
}
