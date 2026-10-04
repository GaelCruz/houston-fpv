import type { VenuePhoto } from "@/types";

/**
 * Venue photos. Seed art is local SVG in /public/venues, so next/image
 * optimisation buys nothing yet and plain <img> keeps the build simple. Switch
 * to next/image once real photographs land.
 */
export default function PhotoGallery({ photos }: { photos: VenuePhoto[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
      {photos.map((photo) => (
        <figure
          key={photo.url}
          className="w-56 shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-surface-raised"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG placeholder art */}
          <img
            src={photo.url}
            alt={photo.alt}
            className="aspect-[4/3] w-full max-w-full object-cover"
            loading="lazy"
          />
        </figure>
      ))}
    </div>
  );
}
