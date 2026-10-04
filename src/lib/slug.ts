/**
 * Lives outside the "use server" action module on purpose: every export of a
 * server-action file must be an async server function, and this is a sync
 * helper the admin forms call in the browser to preview a slug.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}
