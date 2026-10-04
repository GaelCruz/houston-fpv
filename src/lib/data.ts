import { drones } from "@/data/drones";
import { events } from "@/data/events";
import { pilots } from "@/data/pilots";
import { venues } from "@/data/venues";
import type { Drone, DroneEvent, Pilot, ResolvedEvent, Venue } from "@/types";

/**
 * The only module that knows the data is static. Swapping in a real database
 * means rewriting this file and nothing else.
 */

const venuesById = new Map(venues.map((v) => [v.id, v]));
const pilotsById = new Map(pilots.map((p) => [p.id, p]));
const dronesById = new Map(drones.map((d) => [d.id, d]));

export function getVenue(id: string): Venue | undefined {
  return venuesById.get(id);
}

export function getPilot(id: string): Pilot | undefined {
  return pilotsById.get(id);
}

export function getDrone(id: string): Drone | undefined {
  return dronesById.get(id);
}

export function getVenues(): Venue[] {
  return venues;
}

/** Chronological, soonest first. */
export function getEvents(): DroneEvent[] {
  return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getEventBySlug(slug: string): DroneEvent | undefined {
  return events.find((e) => e.slug === slug);
}

export function getEventAttendees(event: DroneEvent): { pilot: Pilot; drone: Drone }[] {
  return event.attendeeIds.flatMap((id) => {
    const pilot = getPilot(id);
    const drone = pilot ? getDrone(pilot.droneId) : undefined;
    // Drop dangling ids rather than rendering a half-empty row.
    return pilot && drone ? [{ pilot, drone }] : [];
  });
}

/**
 * Events with venue and attendees inlined, ready to hand to client components.
 * Events whose venue id doesn't resolve are dropped — a pin with no location
 * can't be placed on a map anyway.
 */
export function getResolvedEvents(): ResolvedEvent[] {
  return getEvents().flatMap((event) => {
    const venue = getVenue(event.venueId);
    if (!venue) return [];
    return [{ ...event, venue, attendees: getEventAttendees(event) }];
  });
}
