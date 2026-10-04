import { NextResponse } from "next/server";

import { getEventBySlug } from "@/lib/data";
import { getEventRsvps } from "@/lib/rsvps";

/**
 * Attendees for one event.
 *
 * This endpoint exists so the map page can stay statically prerendered. Fetching
 * RSVPs during the page render would make the whole public map dynamic, and
 * personal state ("did I RSVP?") would risk leaking into a shared cache. Instead
 * the detail panel calls this when it opens — one small query per event a
 * visitor actually looks at.
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

  const attendees = await getEventRsvps(slug);
  return NextResponse.json({ attendees });
}
