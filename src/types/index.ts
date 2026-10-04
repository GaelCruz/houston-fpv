export type EventType = "racing" | "casual";

export type DroneClass =
  | "5-inch"
  | "7-inch"
  | "whoop"
  | "cinewhoop"
  | "freestyle"
  | "other";

export type VenueSurface = "paved" | "grass" | "indoor" | "mixed";

/** A drone build. `model3d` is the hook for real GLB avatars later. */
export interface Drone {
  id: string;
  name: string;
  class: DroneClass;
  specs?: {
    motors?: string;
    vtx?: string;
    weightGrams?: number;
  };
  /** Flat image shown today. */
  imageUrl: string | null;
  /** Path to a .glb once real models exist. Null everywhere for now. */
  model3d: string | null;
}

/** A pilot. Becomes a row keyed on an auth user id once accounts land. */
export interface Pilot {
  id: string;
  username: string;
  droneId: string;
  homeField?: string;
}

export interface VenuePhoto {
  url: string;
  alt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  surface: VenueSurface;
  photos: VenuePhoto[];
  /** Access rules, AMA membership, airspace warnings. */
  notes?: string;
}

export interface DroneEvent {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  /** ISO 8601 */
  startsAt: string;
  endsAt?: string;
  venueId: string;
  description: string;
  attendeeIds: string[];
  /** Reserved for tournaments. Unused today. */
  tournamentId?: string;
}

/** An event with its venue and attendees already resolved. */
export interface ResolvedEvent extends DroneEvent {
  venue: Venue;
  attendees: { pilot: Pilot; drone: Drone }[];
}

/** The minimum needed to draw a drone. Both seed drones and RSVP'd builds satisfy it. */
export interface DroneLike {
  name: string;
  class: DroneClass;
  imageUrl?: string | null;
}

/** A real pilot who signed up, read from Postgres. */
export interface RsvpAttendee {
  id: number;
  username: string;
  droneName: string;
  droneClass: DroneClass;
  /** True when this row belongs to the viewer. Always false until auth lands. */
  isYou: boolean;
}

/**
 * Seed pilots are illustrative demo content; RSVP rows are real people. A
 * discriminated union forces the UI to handle both and makes it impossible to
 * render a real signup as demo data by accident.
 */
export type Attendee =
  | { kind: "seed"; pilot: Pilot; drone: Drone }
  | { kind: "rsvp"; rsvp: RsvpAttendee };
