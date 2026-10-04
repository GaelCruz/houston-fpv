import { notFound } from "next/navigation";

import VenueForm from "@/components/admin/VenueForm";
import { getVenueById } from "@/lib/data";

export default async function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venueId = Number(id);
  if (!Number.isInteger(venueId)) notFound();

  const venue = await getVenueById(venueId);
  if (!venue) notFound();

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">Edit venue</h1>
      <VenueForm venue={venue} />
    </div>
  );
}
