"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook for Sentry (Part 5, Step 4) — every uncaught error that reaches
    // this boundary gets logged here regardless of which route it came from.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
        CareerHub
      </p>

      <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-md text-sm text-[var(--muted-text)]">
        {error.message || "An unexpected error occurred."}
      </p>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="font-meta rounded-full bg-[var(--amber)] px-5 py-2.5 text-xs uppercase text-[var(--ink)] transition-opacity hover:opacity-90"
        >
          Try again
        </button>

        <Link
          href="/"
          className="font-meta rounded-full border border-[var(--line)] px-5 py-2.5 text-xs uppercase text-[var(--muted-text)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}