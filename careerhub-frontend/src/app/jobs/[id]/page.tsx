import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchJobById } from "@/lib/api";
import { isJobActive } from "@/lib/job-status";
import { auth } from "@/auth";
//import { ApplicationForm } from "@/components/ApplicationForm";

import { ApplicationWizard } from "@/components/ApplicationWizard";
import { EmploymentTypeBadge, JobStatusBadge } from "@/components/JobStatusBadge";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  // Run job fetch and session read in parallel
  const [job, session] = await Promise.all([fetchJobById(id), auth()]);

  if (job === null) {
    notFound();
  }

  const active = isJobActive(job);

  return (
    <main className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/jobs"
          className="font-meta inline-flex items-center gap-1 text-xs uppercase
                     text-[var(--muted-text)] transition-colors
                     hover:text-[var(--ink)] dark:text-[var(--muted-text)]
                     dark:hover:text-[var(--ink)]"
        >
          ← Back to jobs
        </Link>

        <div className="mt-6">
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="font-display flex-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
              {job.title}
            </h1>
            <EmploymentTypeBadge type={job.type} />
          </div>

          <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            {job.companyName} · {job.location}
          </p>

          <div className="mt-2">
            <JobStatusBadge isActive={active} />
          </div>
        </div>

        {(job.salaryMin != null || job.salaryMax != null) && (
          <div
            className="mt-6 inline-block rounded-lg border border-[var(--line)]
                       bg-[var(--paper)] px-4 py-2 dark:border-[var(--line)]
                       dark:bg-[var(--paper)]"
          >
            <p className="font-meta text-[11px] uppercase text-[var(--muted-text)]">
              Salary
            </p>
            <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
              {job.salaryMin != null && job.salaryMax != null
                ? `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`
                : job.salaryMin != null
                  ? `From $${job.salaryMin.toLocaleString()}`
                  : `Up to $${job.salaryMax!.toLocaleString()}`}
            </p>
          </div>
        )}

        <div
          className="mt-8 rounded-xl bg-[var(--paper)] p-6 ring-1 ring-[var(--line)]
                     dark:bg-[var(--paper)] dark:ring-[var(--line)]"
        >
          <h2 className="font-display mb-3 font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
            About the role
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            {job.description}
          </p>
        </div>

        <p className="mt-4 text-xs text-[var(--muted-text)] dark:text-[var(--muted-text)]">
          {active
            ? `Applications close ${new Date(job.closingDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`
            : `Closed ${new Date(job.closingDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`}
        </p>

        <div className="mt-10">
          {session?.user?.role === "employer" ? (
            // Employer — can view but cannot apply
            <div
              className="rounded-xl border border-[var(--line)] bg-[var(--paper)]
                         px-6 py-8 text-center dark:border-[var(--line)]
                         dark:bg-[var(--paper)]"
            >
              <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                Employers cannot apply for jobs.
              </p>
            </div>

          ) : !session ? (
            // Signed out — show sign-in prompt
            <div
              className="rounded-xl border border-[var(--line)] bg-[var(--paper)]
                         px-6 py-8 text-center dark:border-[var(--line)]
                         dark:bg-[var(--paper)]"
            >
              <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                Sign in to apply
              </p>
              <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                You must be signed in to apply.{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-2 hover:text-[var(--ink)]"
                >
                  Sign in here.
                </Link>
              </p>
            </div>

          ) : active ? (
            // Candidate + job open — show form
            <ApplicationWizard
              jobId={job.id}
              jobTitle={job.title}
              userRole={session?.user?.role}
              applicantName={session?.user?.name ?? ""}
            />

          ) : (
            // Candidate + job closed
            <div
              className="rounded-xl border border-[var(--line)] bg-[var(--paper)]
                         px-6 py-8 text-center dark:border-[var(--line)]
                         dark:bg-[var(--paper)]"
            >
              <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                Applications are closed
              </p>
              <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                This role is no longer accepting applications.{" "}
                <Link
                  href="/jobs"
                  className="underline underline-offset-2 hover:text-[var(--ink)]"
                >
                  Browse open roles
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}