

import Link from "next/link";
import { JobListing } from "@/types";
import { JobStatusBadge, EmploymentTypeBadge } from "@/components/JobStatusBadge";
import { isJobActive } from "@/lib/job-status";

// No "use client" — this is a Server Component. It has no event handlers
// and no state of its own. <Link> from next/link works inside Server
// Components: clicking it triggers client-side navigation handled by
// Next.js's router, but the JobLinkCard component itself never needs to
// run any code in the browser to make that happen — it just renders an
// <a>-like element with the right href.

interface JobLinkCardProps {
  job: JobListing;
}

export function JobLinkCard({ job }: JobLinkCardProps) {
  const active = isJobActive(job);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl bg-[var(--paper)] p-5 ring-1 ring-[var(--line)]
                 transition-colors hover:ring-[var(--amber)]
                 dark:bg-[var(--paper)] dark:ring-[var(--line)] dark:hover:ring-[var(--amber)]"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
          {job.title}
        </h2>
        <EmploymentTypeBadge type={job.type} />
      </div>
      <p className="text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
        {job.companyName} · {job.location}
      </p>
      {/* JobStatusBadge renders nothing when the job is active — it only
          shows a "Closed" badge when isActive is false. */}
      <JobStatusBadge isActive={active} />
    </Link>
  );
}
