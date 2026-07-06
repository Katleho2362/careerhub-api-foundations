import dynamic from "next/dynamic";
import Link from "next/link";
import { auth } from "@/auth";
import { fetchJobById } from "@/lib/api";
import { isJobActive } from "@/lib/job-status";
import { ApiError } from "@/lib/api-error";

interface ApplyPageProps {
  params: Promise<{ jobId: string }>;
}

const ApplicationWizard = dynamic(
  () =>
    import("@/components/ApplicationWizard").then((mod) => ({
      default: mod.ApplicationWizard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 animate-pulse rounded-xl bg-[var(--paper)] ring-1 ring-[var(--line)]" />
    ),
  }
);

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;
  const session = await auth();

  // Thrown ApiErrors here are caught by this route's error.tsx, which
  // branches on error.code to show the right message/action per the
  // Assignment 3.4 Part 2 Step 4 spec.
  if (!session) {
    throw new ApiError(
      "You must sign in to apply for this job.",
      401,
      "UNAUTHORIZED"
    );
  }

  if (session.user.role !== "candidate") {
    throw new ApiError(
      "Only candidate accounts can apply for jobs.",
      403,
      "FORBIDDEN"
    );
  }

  const job = await fetchJobById(jobId);

  if (job === null) {
    throw new ApiError("This job listing could not be found.", 404, "NOT_FOUND");
  }

  const active = isJobActive(job);

  if (!active) {
    return (
      <main className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
            CareerHub
          </p>
          <h1 className="font-display mt-3 text-2xl font-semibold text-[var(--ink)]">
            Applications are closed
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-text)]">
            This role is no longer accepting applications.{" "}
            <Link
              href="/jobs"
              className="underline underline-offset-2 hover:text-[var(--ink)]"
            >
              Browse open roles
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/jobs/${job.id}`}
          className="font-meta inline-flex items-center gap-1 text-xs uppercase text-[var(--muted-text)] transition-colors hover:text-[var(--ink)]"
        >
          ← Back to job details
        </Link>

        <h1 className="font-display mt-6 text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Apply for {job.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          {job.companyName} · {job.location}
        </p>

       <ApplicationWizard
          jobId={job.id ?? jobId}
          jobTitle={job.title ?? "this role"}
          userRole={session.user.role}
          applicantName={session.user.name ?? ""}
        />
      </div>
    </main>
  );
}