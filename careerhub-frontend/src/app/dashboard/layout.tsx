import Link from "next/link";

// Server Component — no "use client". This layout wraps every route under
// /dashboard. React does not unmount it when navigating between
// /dashboard/listings and any future /dashboard/* route — the component
// function is not called again, the DOM node for the sidebar is not
// destroyed, and any state inside this layout (if it had any) would be
// preserved. This is what "layout persists" means: the layout is mounted
// once and its children slot is swapped as the route changes.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — fixed width, full height, renders once */}
      <aside
        className="w-56 shrink-0 border-r border-[var(--line)] bg-[var(--paper)]
                   px-4 py-8 dark:border-[var(--line)] dark:bg-[var(--paper)]"
      >
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
      </aside>

      {/* Content area — receives the matched child page */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}