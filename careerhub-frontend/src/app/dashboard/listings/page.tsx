import Link from "next/link";
import { fetchJobs } from "@/lib/api";
import { isJobActive } from "@/lib/job-status";

// async Server Component — no "use client". Fetches all jobs server-side;
// no browser fetch will appear in DevTools' Network tab for this data.

export default async function DashboardListingsPage() {
  const jobs = await fetchJobs();

  return (
    <main className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
          Employer Dashboard
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
          All Listings
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
          {jobs.length} {jobs.length === 1 ? "listing" : "listings"}
        </p>

        {jobs.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            No job listings found. Add roles to your API to see them here.
          </p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl ring-1 ring-[var(--line)] dark:ring-[var(--line)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--paper)] dark:border-[var(--line)] dark:bg-[var(--paper)]">
                  <th className="px-4 py-3 text-left font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                    Company
                  </th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-[var(--ink)] dark:text-[var(--ink)] md:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => {
                  const active = isJobActive(job);
                  return (
                    <tr
                      key={job.id}
                      className={`border-b border-[var(--line)] last:border-0
                                  dark:border-[var(--line)]
                                  ${i % 2 === 0 ? "bg-[var(--canvas)] dark:bg-[var(--canvas)]" : "bg-[var(--paper)] dark:bg-[var(--paper)]"}`}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--ink)] dark:text-[var(--ink)]">
                        {job.title}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                        {job.companyName}
                      </td>
                      <td className="hidden px-4 py-3 text-[var(--muted-text)] dark:text-[var(--muted-text)] md:table-cell">
                        {job.location}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium
                                      ${active
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                        : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                      }`}
                        >
                          {active ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-[var(--amber)] underline underline-offset-2
                                     hover:opacity-80"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}