import { auth } from "@/auth";
import { fetchMyApplications } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session) {
    throw new ApiError(
      "You must sign in to view your applications.",
      401,
      "UNAUTHORIZED"
    );
  }

  if (session.user.role !== "candidate") {
    throw new ApiError(
      "Only candidate accounts have an applications page.",
      403,
      "FORBIDDEN"
    );
  }

  // backendToken and applicantId are both relayed onto the session in
  // auth.ts's session callback. Cast is needed until the session type
  // is augmented to include them.
  const { backendToken, applicantId } = session as unknown as {
    backendToken?: string | null;
    applicantId?: string | null;
  };

  if (!backendToken) {
    // This is the exact "silent backend login failure" gap flagged in
    // Question 1 — a user with a valid app session but no backendToken
    // (e.g. employer2 in MOCK_USERS, or any backend login failure) hits
    // this branch. Surfacing it here as UNAUTHORIZED is more honest than
    // letting fetchMyApplications fail with a confusing generic error.
    throw new ApiError(
      "Your account isn't fully connected to the backend. Please sign out and sign in again.",
      401,
      "UNAUTHORIZED"
    );
  }

  if (!applicantId) {
    // Distinct from the backendToken check above: this fires if login
    // succeeded and a token came back, but the applicantId claim could
    // not be decoded from it (e.g. the claim name assumed in auth.ts's
    // jwt callback doesn't match what the real token contains). Worth
    // keeping separate from the UNAUTHORIZED case above since the fix
    // for each is different — one is "sign in again," the other is
    // "the JWT claim mapping in auth.ts is wrong."
    throw new ApiError(
      "Could not determine your applicant identity from your session. Please sign out and sign in again.",
      401,
      "UNAUTHORIZED"
    );
  }

  const applications = await fetchMyApplications(applicantId, backendToken);

  return (
    <main className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
          CareerHub
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Your applications
        </h1>
        {applications.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="font-display text-lg font-semibold text-[var(--ink)]">
              You haven&apos;t applied to any jobs yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {/*
              ApplicationResponse has no `id` and no `jobId` field — see
              api.generated.ts's ApplicationResponse schema. The real
              identity of an application is the (jobListingId, applicantId)
              pair, and there is no job title on this DTO at all (only
              applicantName). Using that composite pair as the React key
              avoids a duplicate/undefined-key warning; showing
              applicantName in place of a job title is a placeholder until
              the backend either includes the job title on this response
              or the frontend does a second lookup per listing.
            */}
            {applications.map((app) => (
              <div
                key={`${app.jobListingId}-${app.applicantId}`}
                className="rounded-xl bg-[var(--paper)] p-5 ring-1 ring-[var(--line)]"
              >
                <p className="font-display font-semibold text-[var(--ink)]">
                  {app.applicantName}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-text)]">
                  Status: {app.status}
                </p>
                  {app.submittedAt && (
                  <p className="mt-1 text-sm text-[var(--muted-text)]">
                    Submitted{" "}
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