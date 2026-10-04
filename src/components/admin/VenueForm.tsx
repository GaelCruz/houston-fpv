"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createVenue, updateVenue } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import { VENUE_SURFACES, type Venue } from "@/types";

export default function VenueForm({ venue }: { venue?: Venue }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [slug, setSlug] = useState(venue?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(venue));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = venue ? await updateVenue(venue.id, form) : await createVenue(form);
      if (result.ok) router.push("/admin/venues");
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          defaultValue={venue?.name}
          onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" htmlFor="slug">
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

      <Field label="Address" htmlFor="address">
        <input id="address" name="address" required defaultValue={venue?.address} className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Latitude" htmlFor="lat" hint="e.g. 29.7435">
          <input
            id="lat"
            name="lat"
            type="number"
            step="any"
            required
            defaultValue={venue?.lat}
            className={inputClass}
          />
        </Field>
        <Field label="Longitude" htmlFor="lng" hint="e.g. -95.6872">
          <input
            id="lng"
            name="lng"
            type="number"
            step="any"
            required
            defaultValue={venue?.lng}
            className={inputClass}
          />
        </Field>
        <Field label="Surface" htmlFor="surface">
          <select id="surface" name="surface" defaultValue={venue?.surface ?? "grass"} className={inputClass}>
            {VENUE_SURFACES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes" hint="Access rules, membership, airspace warnings.">
        <textarea id="notes" name="notes" rows={3} defaultValue={venue?.notes ?? ""} className={inputClass} />
      </Field>

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
          {pending ? "Saving…" : venue ? "Save changes" : "Create venue"}
        </button>
        <Link
          href="/admin/venues"
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
