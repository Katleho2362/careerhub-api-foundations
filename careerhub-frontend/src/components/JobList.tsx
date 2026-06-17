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
      <p className="py-12 text-center text-gray-500">
        No job listings are currently open. Check back soon.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">Showing {jobs.length} jobs</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isSelected={job.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}