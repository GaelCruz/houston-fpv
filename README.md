# Houston FPV

A map of FPV drone meetups across the greater Houston area. Open it, see what's
flying near you, tell a race from a casual fly-in at a glance, and see what the
location actually looks like before driving out there.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MapLibre](https://img.shields.io/badge/MapLibre-6-orange)

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run lint
npx tsc --noEmit
```

## What's here (v1)

- Dark Houston map with a pin per meetup — **racing** pins are orange diamonds,
  **casual** pins are cyan circles (shape differs as well as colour, so the type
  never depends on colour alone).
- Click a pin for the event: type, date, description, venue with access and
  airspace notes, location photos, and every pilot with their drone.
- `?event=<slug>` is shareable — the link opens straight to that event, and
  browser back/forward moves between them.
- Bottom sheet on phones, side sheet on desktop. The map stays visible either way.

Deliberately **not** in v1: accounts, 3D drone models, tournaments. See
[Where this is going](#where-this-is-going).

## Data

There is no database yet. Seed data lives in `src/data/` as typed `.ts` modules
(not JSON) so typos fail the build instead of the page.

`src/lib/data.ts` is the **only** module that knows the data is static. Swapping
in a real backend means rewriting that one file — every component calls through
its helpers and none of them care where the rows come from.

Records are normalised by id (`Pilot.droneId`, `DroneEvent.venueId`,
`DroneEvent.attendeeIds`) rather than denormalised into each event. A pilot flies
many meetups; copying their build into each one guarantees drift the moment they
rebuild.

### ⚠️ About the seed venues

Venue coordinates are real and geocoded against OpenStreetMap, **but drone flying
is not verified as permitted at any of them.** Park rules and FAA airspace both
apply, and much of the metro sits under Houston Class B. Treat the seed as demo
content. Real listings should come from pilots who actually fly these spots, with
access and airspace warnings recorded in `Venue.notes`.

## Map

Basemap is [OpenFreeMap](https://openfreemap.org/) (`dark`) rendered by MapLibre
GL JS — no API key, no account, no billing. Attribution to OpenFreeMap,
OpenMapTiles and OpenStreetMap is required; it is rendered from the style's own
metadata, so **don't remove the attribution control.**

It is a free community service with no SLA. Everything map-related is
configured in `src/lib/map.ts`, so switching to the light style, to Versatiles,
or to a paid provider like MapTiler is a one-line change.

### The MapLibre worker

MapLibre parses vector tiles in a web worker whose URL it derives from
`import.meta.url`. Under Turbopack that resolves into `/_next/static/chunks/`,
where the worker file is never emitted — the worker 404s and the map renders as
a **black rectangle with working markers on top**, which is a confusing way to
fail.

So `scripts/copy-maplibre-worker.mjs` copies the worker (and the shared chunk it
imports) into `public/maplibre/`, and `EventMap.tsx` points `setWorkerUrl()` at
that copy. It runs on `predev`, `prebuild` and `postinstall`, so it can't drift
from the installed version. `public/maplibre/` is gitignored — it's generated.

Two other MapLibre gotchas worth knowing:

- v6 is ESM-only and has **no default export**. `import maplibregl from "maplibre-gl"`
  fails; use named imports.
- `maplibre-gl/dist/maplibre-gl.css` must be imported or the map is a grey box.

## Structure

```
src/
  app/          layout, page, global styles
  components/   MapExplorer (state) → EventMap (MapLibre) + EventDetailPanel
  data/         seed: events, pilots, drones, venues
  lib/          data.ts (backend seam), map.ts (basemap config), format.ts
  types/        the shared data model
scripts/        maplibre worker copy
```

## Where this is going

The data model already carries the hooks, so these land without a rewrite:

| Next | The seam that's waiting for it |
|---|---|
| 3D drone avatars | `Drone.model3d` (`.glb` path, null today). Only `DroneAvatar.tsx` changes — swap its internals for a react-three-fiber canvas and every call site stays put. |
| Pilot accounts | `Pilot.id` becomes an auth user id; `src/lib/data.ts` becomes queries. |
| Tournaments | `DroneEvent.tournamentId`, unused today. |

Adding a meetup currently means editing `src/data/events.ts` and redeploying.
That's the accepted v1 tradeoff — and `src/lib/data.ts` is what keeps the
migration to a real backend cheap.
