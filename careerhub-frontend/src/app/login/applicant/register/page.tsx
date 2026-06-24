"use client";

import { useActionState } from "react";
import { registerApplicant, type RegisterState } from "@/app/actions/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Client Component — useActionState requires it.
// Structure mirrors ApplicantLoginPage exactly.

export default function ApplicantRegisterPage() {
  const [state, action, isPending] = useActionState<RegisterState, FormData>(
    registerApplicant,
    null
  );

  return (
    <main className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-sm">
        <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
          CareerHub
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Create account
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          Register to apply for jobs and track your applications.
        </p>

        <form
          action={action}
          noValidate
          className="mt-6 space-y-4 rounded-xl bg-[var(--paper)] p-6
                     ring-1 ring-[var(--line)]"
        >
          {state?.status === "error" && (
            <div
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-3
                         dark:border-red-900 dark:bg-red-950/40"
              role="alert"
            >
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {state.message}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="fullName"
              className="font-meta text-xs uppercase text-[var(--muted-text)]"
            >
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              className={cn(
                "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2",
                "text-sm text-[var(--ink)] border-[var(--line)]"
              )}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="font-meta text-xs uppercase text-[var(--muted-text)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={cn(
                "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2",
                "text-sm text-[var(--ink)] border-[var(--line)]"
              )}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="font-meta text-xs uppercase text-[var(--muted-text)]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className={cn(
                "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2",
                "text-sm text-[var(--ink)] border-[var(--line)]"
              )}
            />
            <p className="mt-1 text-xs text-[var(--muted-text)]">
              Minimum 8 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "font-meta w-full rounded-full px-4 py-2.5 text-xs uppercase transition-colors",
              isPending
                ? "cursor-not-allowed bg-[var(--muted-text)] text-[var(--paper)]"
                : "bg-[var(--amber)] text-[var(--ink)] hover:opacity-90"
            )}
          >
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted-text)]">
          Already have an account?{" "}
          <Link
            href="/login/applicant"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}