import EventForm from "@/components/admin/EventForm";
import { getVenues } from "@/lib/data";

export default async function NewEventPage() {
  const venues = await getVenues();

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">New event</h1>
      {venues.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-10 text-center text-sm text-muted">
          Add a venue first — an event needs somewhere to happen.
        </p>
      ) : (
        <EventForm venues={venues} />
      )}
    </div>
  );
}
