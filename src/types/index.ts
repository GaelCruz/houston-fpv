export type EventType = "racing" | "casual";

/**
 * Declared as a const array so the same list is available at runtime. The server
 * actions validate submitted drone classes against it — a type alone would give
 * no protection against a hand-crafted request.
 */
export const DRONE_CLASSES = [
  "5-inch",
  "7-inch",
  "whoop",
  "cinewhoop",
  "freestyle",
  "other",
] as const;

export type DroneClass = (typeof DRONE_CLASSES)[number];

export const VENUE_SURFACES = ["paved", "grass", "indoor", "mixed"] as const;

export type VenueSurface = (typeof VENUE_SURFACES)[number];

export interface VenuePhoto {
  url: string;
  alt: string;
}

export interface Venue {
  id: number;
  /** Stable public handle, independent of the serial id. */
  slug: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  surface: VenueSurface;
  photos: VenuePhoto[];
  /** Access rules, AMA membership, airspace warnings. */
  notes?: string | null;
}

export interface DroneEvent {
  id: number;
  /** Used in ?event=<slug> links and referenced by rsvps.event_slug. */
  slug: string;
  title: string;
  type: EventType;
  /** ISO 8601. Stored as timestamptz; serialised here so it crosses to the client. */
  startsAt: string;
  endsAt?: string | null;
  venueId: number;
  description: string;
  /** Drafts never reach the public map or the public API. */
  published: boolean;
}

/** An event with its venue already resolved — what the map and panel consume. */
export interface ResolvedEvent extends DroneEvent {
  venue: Venue;
}

/** The minimum needed to draw a drone. */
export interface DroneLike {
  name: string;
  class: DroneClass;
  imageUrl?: string | null;
}

/** A pilot who signed up, read from Postgres. */
export interface RsvpAttendee {
  id: number;
  pilotId: number;
  username: string;
  droneName: string;
  droneClass: DroneClass;
  /** True when this row belongs to the person viewing the page. */
  isYou: boolean;
}

/**
 * Who is looking at this event, resolved server-side. The RSVP button needs all
 * three to pick its state, and bundling them with the attendee list means the
 * panel makes one request instead of three.
 */
export interface Viewer {
  signedIn: boolean;
  hasProfile: boolean;
  rsvped: boolean;
}
