import Link from "next/link";
import { auth } from "@/auth";
import { fetchJobById, fetchApplicantsForListing } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

interface ApplicantsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicantsPage({ params }: ApplicantsPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    throw new ApiError(
      "You must sign in to view applicants.",
      401,
      "UNAUTHORIZED"
    );
  }

  if (session.user.role !== "employer") {
    throw new ApiError(
      "Only employer accounts can view applicants.",
      403,
      "FORBIDDEN"
    );
  }

  const backendToken = (session as unknown as { backendToken?: string | null })
    .backendToken;

  if (!backendToken) {
    throw new ApiError(
      "Your account isn't fully connected to the backend. Please sign out and sign in again.",
      401,
      "UNAUTHORIZED"
    );
  }

  const job = await fetchJobById(id);

  if (job === null) {
    throw new ApiError("This listing could not be found.", 404, "NOT_FOUND");
  }

  // Ownership is NOT re-checked here — ownership is a business rule that
  // belongs to the API (Question 2, Rule 3). fetchApplicantsForListing
  // will throw a 403 ApiError via parseApiError if this employer doesn't
  // own the listing, which this route's error.tsx already handles as the
  // "Not Your Listing" case.
  const applicants = await fetchApplicantsForListing(id, backendToken);

  return (
    <main className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/listings"
          className="font-meta inline-flex items-center gap-1 text-xs uppercase text-[var(--muted-text)] transition-colors hover:text-[var(--ink)]"
        >
          ← Back to your listings
        </Link>

        <h1 className="font-display mt-6 text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Applicants for {job.title}
        </h1>

        {applicants.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="font-display text-lg font-semibold text-[var(--ink)]">
              No applicants yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {applicants.map((app) => (
              <div
             key={app.applicantId}
                className="rounded-xl bg-[var(--paper)] p-5 ring-1 ring-[var(--line)]"
              >
                <p className="font-display font-semibold text-[var(--ink)]">
                 {app.applicantName}
                </p>
                {app.submittedAt && (
                <p className="mt-1 text-sm text-[var(--muted-text)]">
                    Applied{" "}
                    {new Date(app.submittedAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    })}
                </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}