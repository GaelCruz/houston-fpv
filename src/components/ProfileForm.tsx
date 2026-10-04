"use client";

import { useState, useTransition } from "react";

import { saveProfile } from "@/app/actions";
import { DRONE_CLASSES } from "@/types";

/**
 * Shown inline in the event sheet, never on a separate page. Sending someone to
 * /onboarding and bouncing them back is exactly the context loss the whole RSVP
 * flow is designed to avoid — they'd lose the map, the event, and their place.
 */
export default function ProfileForm({
  onSaved,
  onCancel,
}: {
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState("");
  const [droneName, setDroneName] = useState("");
  const [droneClass, setDroneClass] = useState<string>(DRONE_CLASSES[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveProfile({ username, droneName, droneClass });
      if (result.ok) onSaved();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-surface p-3">
      <p className="mb-3 text-sm text-muted">
        One-time setup so other pilots know who&apos;s flying.
      </p>

      <Field label="Pilot name" htmlFor="pf-username">
        <input
          id="pf-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="bayou_ripper"
          autoComplete="off"
          required
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:border-casual"
        />
      </Field>

      <Field label="Drone name" htmlFor="pf-drone">
        <input
          id="pf-drone"
          value={droneName}
          onChange={(e) => setDroneName(e.target.value)}
          placeholder="Apex 5"
          autoComplete="off"
          required
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:border-casual"
        />
      </Field>

      <Field label="Class" htmlFor="pf-class">
        <select
          id="pf-class"
          value={droneClass}
          onChange={(e) => setDroneClass(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:border-casual"
        >
          {DRONE_CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-racing">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-casual px-3 py-2 text-sm font-semibold text-background transition-opacity disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save and RSVP"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
