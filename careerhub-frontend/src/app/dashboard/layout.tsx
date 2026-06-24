import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutEmployer } from "@/app/actions/auth";

// Server Component — no "use client". This layout wraps every route under
// /dashboard. React does not unmount it when navigating between
// /dashboard/listings and any future /dashboard/* route — the component
// function is not called again, the DOM node for the sidebar is not
// destroyed, and any state inside this layout (if it had any) would be
// preserved. This is what "layout persists" means: the layout is mounted
// once and its children slot is swapped as the route changes.
//
// getSession() is safe to call directly here because this is a Server
// Component — it reads the httpOnly cookie server-side. By the time this
// layout renders, middleware has already guaranteed a valid Employer
// session exists (unauthenticated requests to /dashboard/* never reach
// this far), so `session` should never actually be null in practice —
// but we still guard for it defensively rather than assuming.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession("Employer");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — fixed width, full height, renders once */}
      <aside
        className="flex w-56 shrink-0 flex-col justify-between border-r border-[var(--line)]
                   bg-[var(--paper)] px-4 py-8 dark:border-[var(--line)] dark:bg-[var(--paper)]"
      >
        <div>
          <p className="font-meta mb-6 text-[11px] uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            Employer Dashboard
          </p>

          <nav className="flex flex-col gap-1">
            <Link
              href="/dashboard/listings"
              className="rounded-lg px-3 py-2 text-sm text-[var(--ink)] transition-colors
                         hover:bg-[var(--canvas)] dark:text-[var(--ink)]
                         dark:hover:bg-[var(--canvas)]"
            >
              All Listings
            </Link>
            <Link
              href="/jobs"
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted-text)] transition-colors
                         hover:bg-[var(--canvas)] hover:text-[var(--ink)]
                         dark:text-[var(--muted-text)] dark:hover:bg-[var(--canvas)]
                         dark:hover:text-[var(--ink)]"
            >
              View as Candidate
            </Link>
          </nav>
        </div>

        {/* Session footer — who's logged in + logout. Sits at the bottom
            of the sidebar via the parent's justify-between. */}
        {session && (
          <div className="border-t border-[var(--line)] pt-4 dark:border-[var(--line)]">
            <p className="font-meta text-[11px] uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
              Signed in as
            </p>
            <p className="mt-0.5 text-sm font-medium text-[var(--ink)] dark:text-[var(--ink)]">
              {session.username}
            </p>

            <form action={logoutEmployer} className="mt-3">
              <button
                type="submit"
                className="w-full rounded-lg border border-[var(--line)] px-3 py-1.5
                           text-xs font-medium text-[var(--muted-text)] transition-colors
                           hover:bg-[var(--canvas)] hover:text-[var(--ink)]
                           dark:border-[var(--line)] dark:text-[var(--muted-text)]
                           dark:hover:bg-[var(--canvas)] dark:hover:text-[var(--ink)]"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* Content area — receives the matched child page */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}