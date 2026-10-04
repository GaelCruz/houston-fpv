"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { events, rsvps, venues } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { houstonLocalToDate } from "@/lib/format";
import { VENUE_SURFACES, type EventType, type VenueSurface } from "@/types";

/**
 * Admin mutations.
 *
 * Every one of these re-checks requireAdmin(). Server actions are separately
 * addressable HTTP endpoints — the /admin layout gate does nothing for them, so
 * this is the check that actually protects anything.
 *
 * Results are returned rather than thrown so forms can render real messages.
 */
export type AdminResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Anything the browser sends is untrusted, including values from our own form. */
function validateEvent(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim();
  const type = String(form.get("type") ?? "");
  const description = String(form.get("description") ?? "").trim();
  const startsAt = String(form.get("startsAt") ?? "");
  const endsAt = String(form.get("endsAt") ?? "");
  const venueId = Number(form.get("venueId"));
  const published = form.get("published") === "on";

  if (title.length < 3 || title.length > 120) return "Title must be 3–120 characters.";
  if (!SLUG_RE.test(slug)) return "Slug must be lowercase words separated by hyphens.";
  if (type !== "racing" && type !== "casual") return "Pick an event type.";
  if (description.length < 10) return "Give the event a description (at least 10 characters).";
  if (!startsAt) return "Pick a start date and time.";
  if (!Number.isInteger(venueId) || venueId <= 0) return "Pick a venue.";

  let start: Date;
  let end: Date | null = null;
  try {
    start = houstonLocalToDate(startsAt);
    if (endsAt) end = houstonLocalToDate(endsAt);
  } catch {
    return "That date and time couldn't be read.";
  }
  if (end && end <= start) return "The end time must be after the start time.";

  return {
    title,
    slug,
    type: type as EventType,
    description,
    startsAt: start,
    endsAt: end,
    venueId,
    published,
  };
}

export async function createEvent(form: FormData): Promise<AdminResult<{ id: number }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = validateEvent(form);
  if (typeof parsed === "string") return { ok: false, error: parsed };

  try {
    const [row] = await getDb().insert(events).values(parsed).returning({ id: events.id });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, data: { id: row.id } };
  } catch (error) {
    if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
      return { ok: false, error: `The slug "${parsed.slug}" is already used by another event.` };
    }
    console.error("[admin] createEvent failed:", error);
    return { ok: false, error: "Couldn't create the event." };
  }
}

export async function updateEvent(id: number, form: FormData): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = validateEvent(form);
  if (typeof parsed === "string") return { ok: false, error: parsed };

  try {
    // A slug change cascades to rsvps.event_slug, so renaming is safe.
    await getDb()
      .update(events)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(events.id, id));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
      return { ok: false, error: `The slug "${parsed.slug}" is already used by another event.` };
    }
    console.error("[admin] updateEvent failed:", error);
    return { ok: false, error: "Couldn't save the event." };
  }
}

export async function setEventPublished(id: number, published: boolean): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    await getDb()
      .update(events)
      .set({ published, updatedAt: new Date() })
      .where(eq(events.id, id));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("[admin] setEventPublished failed:", error);
    return { ok: false, error: "Couldn't change the publish state." };
  }
}

export async function deleteEvent(id: number): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const db = getDb();
  try {
    const [event] = await db
      .select({ slug: events.slug })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    if (!event) return { ok: false, error: "That event no longer exists." };

    // The FK is ON DELETE RESTRICT, so this would fail anyway — but checking
    // first lets us say how many people would be affected instead of surfacing
    // a constraint violation.
    const signups = await db
      .select({ id: rsvps.id })
      .from(rsvps)
      .where(eq(rsvps.eventSlug, event.slug));

    if (signups.length > 0) {
      return {
        ok: false,
        error: `${signups.length} pilot${signups.length === 1 ? " has" : "s have"} RSVP'd to this event, so it can't be deleted. Unpublish it instead to hide it from the map.`,
      };
    }

    await db.delete(events).where(eq(events.id, id));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("[admin] deleteEvent failed:", error);
    return { ok: false, error: "Couldn't delete the event." };
  }
}

/* ----------------------------- venues ----------------------------- */

function validateVenue(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  const surface = String(form.get("surface") ?? "");
  const notes = String(form.get("notes") ?? "").trim();
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));

  if (name.length < 3 || name.length > 120) return "Name must be 3–120 characters.";
  if (!SLUG_RE.test(slug)) return "Slug must be lowercase words separated by hyphens.";
  if (address.length < 3) return "Give the venue an address.";
  if (!VENUE_SURFACES.includes(surface as VenueSurface)) return "Pick a surface.";
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return "Latitude must be between -90 and 90.";
  if (!Number.isFinite(lng) || lng < -180 || lng > 180)
    return "Longitude must be between -180 and 180.";

  return { name, slug, address, surface: surface as VenueSurface, notes: notes || null, lat, lng };
}

export async function createVenue(form: FormData): Promise<AdminResult<{ id: number }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = validateVenue(form);
  if (typeof parsed === "string") return { ok: false, error: parsed };

  try {
    const [row] = await getDb().insert(venues).values(parsed).returning({ id: venues.id });
    revalidatePath("/");
    revalidatePath("/admin/venues");
    return { ok: true, data: { id: row.id } };
  } catch (error) {
    if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
      return { ok: false, error: `The slug "${parsed.slug}" is already used by another venue.` };
    }
    console.error("[admin] createVenue failed:", error);
    return { ok: false, error: "Couldn't create the venue." };
  }
}

export async function updateVenue(id: number, form: FormData): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = validateVenue(form);
  if (typeof parsed === "string") return { ok: false, error: parsed };

  try {
    await getDb()
      .update(venues)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(venues.id, id));
    revalidatePath("/");
    revalidatePath("/admin/venues");
    return { ok: true };
  } catch (error) {
    console.error("[admin] updateVenue failed:", error);
    return { ok: false, error: "Couldn't save the venue." };
  }
}

export async function deleteVenue(id: number): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const db = getDb();
  try {
    const used = await db.select({ id: events.id }).from(events).where(eq(events.venueId, id));
    if (used.length > 0) {
      return {
        ok: false,
        error: `${used.length} event${used.length === 1 ? " uses" : "s use"} this venue, so it can't be deleted. Move or delete those events first.`,
      };
    }
    await db.delete(venues).where(eq(venues.id, id));
    revalidatePath("/");
    revalidatePath("/admin/venues");
    return { ok: true };
  } catch (error) {
    console.error("[admin] deleteVenue failed:", error);
    return { ok: false, error: "Couldn't delete the venue." };
  }
}
