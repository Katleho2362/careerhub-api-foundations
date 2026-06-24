// import Link from "next/link";
// import { fetchJobs } from "@/lib/api";
// import { isJobActive } from "@/lib/job-status";

// interface ApplicationStat {
//   jobId: string;
//   applicationCount: number;
// }

// // cache: "no-store" — applications are submitted at any time by candidates,
// // no employer action can cleanly trigger invalidation, so always-fresh is correct.
// async function getApplicationStats(): Promise<ApplicationStat[]> {
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//   const res = await fetch(`${baseUrl}/api/applications/stats`, {
//     cache: "no-store",
//   });
//   if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
//   return res.json();
// }

// export default async function DashboardListingsPage() {
//   // Parallel — both requests fire at the same time, not one after the other
//   const [jobs, stats] = await Promise.all([fetchJobs(), getApplicationStats()]);

//   return (
//     <main className="px-6 py-10 md:px-10">
//       <div className="mx-auto max-w-5xl">
//         <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//           Employer Dashboard
//         </p>
//         <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
//           All Listings
//         </h1>
//         <p className="mt-1 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//           {jobs.length} {jobs.length === 1 ? "listing" : "listings"}
//         </p>

//         {jobs.length === 0 ? (
//           <p className="mt-8 text-sm text-[var(--muted-text)]">
//             No job listings found.
//           </p>
//         ) : (
//           <div className="mt-8 overflow-hidden rounded-xl ring-1 ring-[var(--line)]">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-[var(--line)] bg-[var(--paper)]">
//                   <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Title</th>
//                   <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Company</th>
//                   <th className="hidden px-4 py-3 text-left font-semibold text-[var(--ink)] md:table-cell">Location</th>
//                   <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Status</th>
//                   <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Applications</th>
//                   <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">View</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {jobs.map((job, i) => {
//                   const active = isJobActive(job);
//                   const stat = stats.find((s) => s.jobId === job.id);
//                   const count = stat?.applicationCount ?? 0;
//                   return (
//                     <tr
//                       key={job.id}
//                       className={`border-b border-[var(--line)] last:border-0
//                         ${i % 2 === 0 ? "bg-[var(--canvas)]" : "bg-[var(--paper)]"}`}
//                     >
//                       <td className="px-4 py-3 font-medium text-[var(--ink)]">{job.title}</td>
//                       <td className="px-4 py-3 text-[var(--muted-text)]">{job.companyName}</td>
//                       <td className="hidden px-4 py-3 text-[var(--muted-text)] md:table-cell">{job.location}</td>
//                       <td className="px-4 py-3">
//                         <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium
//                           ${active
//                             ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
//                             : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}>
//                           {active ? "Open" : "Closed"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-[var(--muted-text)]">{count}</td>
//                       <td className="px-4 py-3">
//                         <Link href={`/jobs/${job.id}`}
//                           className="text-[var(--amber)] underline underline-offset-2 hover:opacity-80">
//                           View →
//                         </Link>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

import { Suspense } from "react";
import { ApplicationsSummary, ApplicationsSummarySkeleton } from "@/components/ApplicationsSummary";
import { ListingsTable, ListingsTableSkeleton } from "@/components/ListingsTable";

// The page itself performs no awaits — it renders the heading immediately
// and delegates all data fetching to the two components behind their own
// independent Suspense boundaries.
export default async function DashboardListingsPage() {
  return (
    <main className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            Employer Dashboard
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
            All Listings
          </h1>
        </div>

        {/* Boundary 1 — resolves as soon as stats arrive (one fetch, small payload) */}
        <Suspense fallback={<ApplicationsSummarySkeleton />}>
          <ApplicationsSummary />
        </Suspense>

        {/* Boundary 2 — resolves after jobs + stats join (two fetches) */}
        <Suspense fallback={<ListingsTableSkeleton />}>
          <ListingsTable />
        </Suspense>
      </div>
    </main>
  );
}