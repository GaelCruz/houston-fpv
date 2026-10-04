import { notFound } from "next/navigation";

import EventForm from "@/components/admin/EventForm";
import { adminGetEventById, getVenues } from "@/lib/data";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) notFound();

  const [event, venues] = await Promise.all([adminGetEventById(eventId), getVenues()]);
  if (!event) notFound();

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">Edit event</h1>
      <EventForm event={event} venues={venues} />
    </div>
  );
}
