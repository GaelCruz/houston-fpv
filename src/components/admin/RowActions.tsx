"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteEvent, deleteVenue, setEventPublished } from "@/app/admin/actions";

/**
 * Delete surfaces the reason it was refused rather than failing silently. The
 * database enforces this with ON DELETE RESTRICT; this just explains it in
 * words, and points at unpublish as the non-destructive alternative.
 */
export function EventRowActions({
  id,
  published,
}: {
  id: number;
  published: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function togglePublish() {
    setError(null);
    startTransition(async () => {
      const result = await setEventPublished(id, !published);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  function remove() {
    if (!confirm("Delete this event? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteEvent(id);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button type="button" onClick={togglePublish} disabled={pending} className={btn}>
          {published ? "Unpublish" : "Publish"}
        </button>
        <button type="button" onClick={remove} disabled={pending} className={dangerBtn}>
          Delete
        </button>
      </div>
      {error ? (
        <p role="alert" className="max-w-xs text-right text-xs text-racing">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function VenueRowActions({ id }: { id: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!confirm("Delete this venue?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteVenue(id);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={remove} disabled={pending} className={dangerBtn}>
        Delete
      </button>
      {error ? (
        <p role="alert" className="max-w-xs text-right text-xs text-racing">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const btn =
  "rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50";
const dangerBtn =
  "rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-racing/50 hover:text-racing disabled:opacity-50";
