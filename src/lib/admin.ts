import { auth } from "@clerk/nextjs/server";

/**
 * Single admin, identified by Clerk user id held in a server-only env var.
 *
 * ADMIN_USER_ID deliberately has no NEXT_PUBLIC_ prefix, so the value never
 * reaches the browser bundle. Nobody can be granted admin through a UI, which
 * means there is no misconfiguration path either.
 */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  const adminId = process.env.ADMIN_USER_ID;
  // An unset variable means NOBODY is admin — never "everybody".
  if (!userId || !adminId) return false;
  return userId === adminId;
}

/**
 * For server actions. Every admin action must call this independently: actions
 * are separately addressable HTTP endpoints, so guarding the page does nothing
 * for them.
 */
export async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  return (await isAdmin())
    ? { ok: true }
    : { ok: false, error: "Not authorised." };
}
