import type { Venue } from "@/types";

/**
 * Coordinates verified against OpenStreetMap geocoding.
 *
 * NOTE: these are real places, but drone flying is NOT verified as permitted at
 * each one. Park rules and FAA airspace both apply, and much of the metro sits
 * under Houston Class B. Treat this as demo content until pilots who actually
 * fly these spots confirm them.
 */
export const venues: Venue[] = [
  {
    id: "v-bush-park",
    name: "George Bush Park — Dick Scobee Airfield",
    address: "Challenger Rd, Houston, TX 77082",
    lat: 29.7435,
    lng: -95.6872,
    surface: "paved",
    photos: [
      { url: "/venues/bush-park-1.svg", alt: "Paved runway at Dick Scobee Memorial Airfield" },
      { url: "/venues/bush-park-2.svg", alt: "Open field beside the runway" },
    ],
    notes:
      "AMA club field with a 630x80ft paved runway and a dedicated multirotor area. Membership required. Coordinate is the park centroid — the airfield sits inside it.",
  },
  {
    id: "v-cullen-park",
    name: "Cullen Park",
    address: "19008 Saums Rd, Houston, TX 77084",
    lat: 29.7981,
    lng: -95.6937,
    surface: "mixed",
    photos: [
      { url: "/venues/cullen-park-1.svg", alt: "Wide open grass expanse at Cullen Park" },
    ],
    notes: "Large open park adjoining George Bush Park. Plenty of unobstructed line of sight.",
  },
  {
    id: "v-bear-creek",
    name: "Bear Creek Pioneers Park",
    address: "3535 War Memorial Dr, Houston, TX 77084",
    lat: 29.8207,
    lng: -95.6278,
    surface: "grass",
    photos: [
      { url: "/venues/bear-creek-1.svg", alt: "Grass field ringed by treeline at Bear Creek" },
    ],
    notes: "Open fields on the northwest side. Busy on weekends — pick an edge away from crowds.",
  },
  {
    id: "v-tom-bass",
    name: "Tom Bass Regional Park (Sec. III)",
    address: "15108 Cullen Blvd, Houston, TX 77047",
    lat: 29.5887,
    lng: -95.3552,
    surface: "grass",
    photos: [
      { url: "/venues/tom-bass-1.svg", alt: "Flat grass field at Tom Bass Regional Park" },
    ],
    notes: "South-side option with long sightlines. Check Hobby airport airspace before flying.",
  },
  {
    id: "v-sylvan-rodriguez",
    name: "Sylvan Rodriguez Park",
    address: "1201 Clear Lake City Blvd, Houston, TX 77062",
    lat: 29.5864,
    lng: -95.1544,
    surface: "grass",
    photos: [
      { url: "/venues/sylvan-rodriguez-1.svg", alt: "Open lawn at Sylvan Rodriguez Park" },
    ],
    notes: "Clear Lake area. Close to Ellington Field — verify airspace before every session.",
  },
  {
    id: "v-baytown-nature",
    name: "Baytown Nature Center",
    address: "6213 Bayway Dr, Baytown, TX 77520",
    lat: 29.7545,
    lng: -95.0453,
    surface: "mixed",
    photos: [
      { url: "/venues/baytown-1.svg", alt: "Waterfront clearing at Baytown Nature Center" },
    ],
    notes: "East-side waterfront with scenic backdrops. Wildlife area — respect posted restrictions.",
  },
];
