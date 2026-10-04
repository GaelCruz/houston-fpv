import type { DroneEvent } from "@/types";

export const events: DroneEvent[] = [
  {
    id: "e-01",
    slug: "scobee-spec-race-night",
    title: "Scobee Spec Race Night",
    type: "racing",
    startsAt: "2026-10-10T18:00:00-05:00",
    endsAt: "2026-10-10T21:30:00-05:00",
    venueId: "v-bush-park",
    description:
      "Six-gate spec class on the paved runway. Three heats, then a bracket. Bring four packs minimum and a spare set of props — the tarmac is unforgiving.",
    attendeeIds: ["p-01", "p-02", "p-06", "p-08"],
  },
  {
    id: "e-02",
    slug: "cullen-sunday-freestyle",
    title: "Cullen Sunday Freestyle",
    type: "casual",
    startsAt: "2026-10-12T09:00:00-05:00",
    endsAt: "2026-10-12T12:00:00-05:00",
    venueId: "v-cullen-park",
    description:
      "No clock, no brackets. Open field, big sky, and whoever shows up. Good spot to shake down a new build or teach someone their first hover.",
    attendeeIds: ["p-02", "p-04", "p-08"],
  },
  {
    id: "e-03",
    slug: "bear-creek-long-range",
    title: "Bear Creek Long Range Meet",
    type: "casual",
    startsAt: "2026-10-17T16:00:00-05:00",
    endsAt: "2026-10-17T19:00:00-05:00",
    venueId: "v-bear-creek",
    description:
      "Seven-inch and up. Cruise the treeline, chase the sunset. Spotters required for anything leaving visual range.",
    attendeeIds: ["p-03", "p-05"],
  },
  {
    id: "e-04",
    slug: "tom-bass-gate-practice",
    title: "Tom Bass Gate Practice",
    type: "racing",
    startsAt: "2026-10-18T08:30:00-05:00",
    endsAt: "2026-10-18T11:30:00-05:00",
    venueId: "v-tom-bass",
    description:
      "Low-key gate drills on the south side. Four gates, one split-S, repeat until your thumbs hurt. Timing system on site.",
    attendeeIds: ["p-01", "p-06", "p-07"],
  },
  {
    id: "e-05",
    slug: "clear-lake-whoop-jam",
    title: "Clear Lake Whoop Jam",
    type: "casual",
    startsAt: "2026-10-24T17:30:00-05:00",
    endsAt: "2026-10-24T20:00:00-05:00",
    venueId: "v-sylvan-rodriguez",
    description:
      "Tiny whoops and micro builds only. Low, slow, and close enough that nobody needs a spotter. Beginner friendly — loaner goggles usually floating around.",
    attendeeIds: ["p-04", "p-07"],
  },
  {
    id: "e-06",
    slug: "baytown-cinematic-session",
    title: "Baytown Cinematic Session",
    type: "casual",
    startsAt: "2026-10-31T07:00:00-05:00",
    endsAt: "2026-10-31T10:00:00-05:00",
    venueId: "v-baytown-nature",
    description:
      "Golden-hour cinewhoop flying over the water. Bring ND filters. We stay clear of the posted wildlife zones — no exceptions.",
    attendeeIds: ["p-05", "p-03", "p-01"],
  },
];
