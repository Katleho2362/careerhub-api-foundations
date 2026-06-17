import { JobListing } from "@/types";
import { JobCard } from "./JobCard";

interface JobListProps {
  jobs: JobListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function JobList({ jobs, selectedId, onSelect }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line)] py-16 text-center">
        <p className="font-display text-base font-medium text-[var(--ink)]">No listings here yet</p>
        <p className="mt-1 text-sm text-[var(--muted-text)]">
          Check back soon, or browse a different list from the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-meta mb-4 text-xs uppercase text-[var(--muted-text)]">
        Showing {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isSelected={job.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}