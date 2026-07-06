"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api-error";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (error instanceof ApiError && error.isUnauthorized) {
    return (
      <ErrorShell heading="Session Expired">
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          Your session has expired. Please sign in again to access your
          dashboard.
        </p>
        <Link href="/login" className={primaryLinkCn}>
          Sign in
        </Link>
      </ErrorShell>
    );
  }

  if (error instanceof ApiError && error.isForbidden) {
    return (
      <ErrorShell heading="Employer Access Required">
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          The dashboard is only available to employer accounts. If you&apos;re
          looking for jobs to apply to, head back to the listings.
        </p>
        <Link href="/jobs" className={secondaryLinkCn}>
          Back to jobs
        </Link>
      </ErrorShell>
    );
  }

  if (error instanceof ApiError && error.code === "NOT_FOUND") {
    return (
      <ErrorShell heading="Dashboard Not Found">
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          We couldn&apos;t find the resource you were looking for.
        </p>
        <Link href="/jobs" className={secondaryLinkCn}>
          Back to jobs
        </Link>
      </ErrorShell>
    );
  }

  return (
    <ErrorShell heading="Something went wrong">
      <p className="mt-2 text-sm text-[var(--muted-text)]">{error.message}</p>
      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={reset} className={primaryBtnCn}>
          Try again
        </button>
        <Link href="/jobs" className={secondaryLinkCn}>
          Back to jobs
        </Link>
      </div>
    </ErrorShell>
  );
}

function ErrorShell({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
        CareerHub
      </p>
      <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        {heading}
      </h1>
      {children}
    </main>
  );
}

const primaryBtnCn =
  "font-meta rounded-full bg-[var(--amber)] px-5 py-2.5 text-xs uppercase text-[var(--ink)] transition-opacity hover:opacity-90";

const primaryLinkCn = `${primaryBtnCn} mt-6 inline-block`;

const secondaryLinkCn =
  "font-meta mt-6 inline-block rounded-full border border-[var(--line)] px-5 py-2.5 text-xs uppercase text-[var(--muted-text)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]";