// // import { JobListing } from "@/types";
// // import { JobCard } from "./JobCard";

// // interface JobListProps {
// //   jobs: JobListing[];
// //   selectedId: string | null;
// //   onSelect: (id: string) => void;
// // }

// // export function JobList({ jobs, selectedId, onSelect }: JobListProps) {
// //   if (jobs.length === 0) {
// //     return (
// //       <div className="rounded-xl border border-dashed border-[var(--line)] py-16 text-center">
// //         <p className="font-display text-base font-medium text-[var(--ink)]">No listings here yet</p>
// //         <p className="mt-1 text-sm text-[var(--muted-text)]">
// //           Check back soon, or browse a different list from the sidebar.
// //         </p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div>
// //       <p className="font-meta mb-4 text-xs uppercase text-[var(--muted-text)]">
// //         Showing {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
// //       </p>
// //       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
// //         {jobs.map((job) => (
// //           <JobCard key={job.id} job={job} isSelected={job.id === selectedId} onSelect={onSelect} />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// import Image from "next/image";
// import Link from "next/link";
// import { JobListing } from "@/types";
// import { JobStatusBadge, EmploymentTypeBadge } from "@/components/JobStatusBadge";
// import { isJobActive } from "@/lib/job-status";

// interface JobLinkCardProps {
//   job: JobListing;
// }

// export function JobLinkCard({ job }: JobLinkCardProps) {
//   const active = isJobActive(job);
//   //const logoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(job.companyName)}`;
//   const logoUrl = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(job.companyName)}`;
//   return (
//     <Link
//       href={`/jobs/${job.id}`}
//       className="block rounded-xl bg-[var(--paper)] p-5 ring-1 ring-[var(--line)]
//                  transition-colors hover:ring-[var(--amber)]
//                  dark:bg-[var(--paper)] dark:ring-[var(--line)] dark:hover:ring-[var(--amber)]"
//     >
//       <div className="mb-2 flex items-start justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <Image
//             src={logoUrl}
//             alt={`${job.companyName} logo`}
//             width={40}
//             height={40}
//             className="rounded-md"
//           />
//           <h2 className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
//             {job.title}
//           </h2>
//         </div>
//         <EmploymentTypeBadge type={job.type} />
//       </div>
//       <p className="text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//         {job.companyName} · {job.location}
//       </p>
//       <JobStatusBadge isActive={active} />
//     </Link>
//   );
// }

import Image from "next/image";
import Link from "next/link";
import { JobListing } from "@/types";
import { JobStatusBadge, EmploymentTypeBadge } from "@/components/JobStatusBadge";
import { isJobActive } from "@/lib/job-status";

interface JobLinkCardProps {
  job: JobListing;
}

export function JobLinkCard({ job }: JobLinkCardProps) {
  const active = isJobActive(job);
  // companyName is optional in the generated JobResponse schema, but
  // encodeURIComponent requires a string argument — falling back to the
  // job id keeps the dicebear avatar deterministic per-job even when a
  // company name is missing, rather than crashing at render time.
  const logoSeed = job.companyName ?? job.id ?? "unknown";
  const logoUrl = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(logoSeed)}`;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl bg-[var(--paper)] p-5 ring-1 ring-[var(--line)]
                 transition-colors hover:ring-[var(--amber)]
                 dark:bg-[var(--paper)] dark:ring-[var(--line)] dark:hover:ring-[var(--amber)]"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image
            src={logoUrl}
            alt={`${job.companyName ?? "Company"} logo`}
            width={40}
            height={40}
            className="rounded-md"
          />
          <h2 className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
            {job.title}
          </h2>
        </div>
        <EmploymentTypeBadge type={job.type} />
      </div>
      <p className="text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
        {job.companyName} · {job.location}
      </p>
      <JobStatusBadge isActive={active} />
    </Link>
  );
}