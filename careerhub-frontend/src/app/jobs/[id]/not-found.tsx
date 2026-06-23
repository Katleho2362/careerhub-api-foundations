import Link from "next/link";

// Server Component — no "use client". This file is the not-found boundary
// for the /jobs/[id] subtree. When page.tsx calls notFound(), Next.js
// renders this instead of page.tsx, and sets the HTTP response status to
// 404 — so DevTools' Network tab will show 404, not 200. The root layout
// (header, ThemeToggle, fonts) wraps this automatically because it sits
// in app/layout.tsx, which applies to all routes.

export default function JobNotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
        404
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
        Job not found
      </h1>
      <p className="mt-3 max-w-sm text-center text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
        This listing may have been removed or the link might be incorrect.
        Check the URL and try again, or browse all open roles.
      </p>
      <Link
        href="/jobs"
        className="font-meta mt-8 rounded-full bg-[var(--amber)] px-5 py-2.5 text-xs
                   uppercase text-[var(--ink)] transition-opacity hover:opacity-80"
      >
        ← Back to jobs
      </Link>
    </main>
  );
}