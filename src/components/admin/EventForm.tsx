"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createEvent, updateEvent } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import { dateToHoustonLocal } from "@/lib/format";
import type { DroneEvent, Venue } from "@/types";

export default function EventForm({
  event,
  venues,
}: {
  event?: DroneEvent;
  venues: Venue[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(event));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = event ? await updateEvent(event.id, form) : await createEvent(form);
      if (result.ok) router.push("/admin");
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          defaultValue={event?.title}
          // Slug follows the title until it's edited by hand, so new events get
          // a sensible URL without anyone thinking about it.
          onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))}
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint={
          event
            ? "Changing this updates existing RSVPs automatically."
            : "Appears in the shareable link: /?event=<slug>"
        }
      >
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="type">
          <select id="type" name="type" defaultValue={event?.type ?? "casual"} className={inputClass}>
            <option value="casual">Casual</option>
            <option value="racing">Racing</option>
          </select>
        </Field>
        <Field label="Venue" htmlFor="venueId" hint="Need a new one? Add it under Venues.">
          <select id="venueId" name="venueId" defaultValue={event?.venueId} required className={inputClass}>
            <option value="">Select a venue…</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts" htmlFor="startsAt" hint="Houston time">
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={event ? dateToHoustonLocal(event.startsAt) : ""}
            className={inputClass}
          />
        </Field>
        <Field label="Ends" htmlFor="endsAt" hint="Optional">
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={event?.endsAt ? dateToHoustonLocal(event.endsAt) : ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={event?.description}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={event?.published ?? false}
          className="size-4 accent-[var(--casual)]"
        />
        <span>
          Published
          <span className="block text-xs text-muted">
            Unpublished events are hidden from the map and the public API.
          </span>
        </span>
      </label>

      {error ? (
        <p role="alert" className="rounded-lg border border-racing/40 bg-racing/10 px-3 py-2 text-sm text-racing">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-casual px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-60"
        >
          {pending ? "Saving…" : event ? "Save changes" : "Create event"}
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-casual";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
