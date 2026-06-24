import Link from "next/link";
import { fetchJobs } from "@/lib/api";
import { isJobActive } from "@/lib/job-status";
import { CloseJobButton } from "./CloseJobButton";

interface ApplicationStat {
  jobId: string;
  applicationCount: number;
}

async function getApplicationStats(): Promise<ApplicationStat[]> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/applications/stats`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json();
}
// ── Skeleton — five animate-pulse rows ───────────────────────────────────────
export function ListingsTableSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl ring-1 ring-[var(--line)]">
      <div className="border-b border-[var(--line)] bg-[var(--paper)] px-4 py-3">
        <div className="h-3 w-48 rounded bg-[var(--line)]" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`flex gap-4 px-4 py-4 border-b border-[var(--line)] last:border-0
            ${i % 2 === 0 ? "bg-[var(--canvas)]" : "bg-[var(--paper)]"}`}
        >
          <div className="h-3 w-32 rounded bg-[var(--line)]" />
          <div className="h-3 w-24 rounded bg-[var(--line)]" />
          <div className="h-3 w-20 rounded bg-[var(--line)]" />
          <div className="h-3 w-12 rounded bg-[var(--line)]" />
        </div>
      ))}
    </div>
  );
}

// ── Async Server Component ────────────────────────────────────────────────────
// Fetches its own data — self-contained, no props needed.
export async function ListingsTable() {
  const [jobs, stats] = await Promise.all([fetchJobs(), getApplicationStats()]);

  if (jobs.length === 0) {
    return (
      <p className="mt-4 text-sm text-[var(--muted-text)]">
        No job listings found.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-[var(--line)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[var(--paper)]">
            <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Company</th>
            <th className="hidden px-4 py-3 text-left font-semibold text-[var(--ink)] md:table-cell">Location</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Applications</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">View</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, i) => {
            const active = isJobActive(job);
            const count = stats.find((s) => s.jobId === job.id)?.applicationCount ?? 0;
            return (
              <tr
                key={job.id}
                className={`border-b border-[var(--line)] last:border-0
                  ${i % 2 === 0 ? "bg-[var(--canvas)]" : "bg-[var(--paper)]"}`}
              >
                <td className="px-4 py-3 font-medium text-[var(--ink)]">{job.title}</td>
                <td className="px-4 py-3 text-[var(--muted-text)]">{job.companyName}</td>
                <td className="hidden px-4 py-3 text-[var(--muted-text)] md:table-cell">{job.location}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium
                    ${active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}>
                    {active ? "Open" : "Closed"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--muted-text)]">{count}</td>
                <td className="px-4 py-3">
                  <Link href={`/jobs/${job.id}`}
                    className="text-[var(--amber)] underline underline-offset-2 hover:opacity-80">
                    View →
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <CloseJobButton
                    jobId={job.id}
                    jobTitle={job.title}
                    currentStatus={active ? "Open" : "Closed"}
                    />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}