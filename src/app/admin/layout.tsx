import Link from "next/link";
import { notFound } from "next/navigation";

import { isAdmin } from "@/lib/admin";

/**
 * notFound() rather than a redirect or a 403: a 404 doesn't confirm that /admin
 * exists at all to someone probing for it.
 *
 * This gate protects the pages. It does NOT protect the server actions — those
 * check themselves, because they can be called without ever loading this layout.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) notFound();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3">
        <Link href="/admin" className="text-base font-semibold tracking-tight">
          Houston <span className="text-casual">FPV</span>
          <span className="ml-2 rounded border border-racing/50 px-1.5 py-px text-[10px] tracking-widest text-racing uppercase">
            admin
          </span>
        </Link>
        <nav className="flex gap-3 text-sm text-muted">
          <Link href="/admin" className="hover:text-foreground">
            Events
          </Link>
          <Link href="/admin/venues" className="hover:text-foreground">
            Venues
          </Link>
        </nav>
        <Link href="/" className="ml-auto text-sm text-muted hover:text-foreground">
          View site →
        </Link>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
