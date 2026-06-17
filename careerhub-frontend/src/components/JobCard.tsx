import { JobListing } from "@/types";
import { isJobActive } from "@/lib/job-status";
import { EmploymentTypeBadge, JobStatusBadge } from "@/components/JobStatusBadge";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: JobListing;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function formatSalary(min: number | null, max: number | null, fallback: string): string {
  if (min === null && max === null) {
    return fallback || "Salary not disclosed";
  }
  const fmt = new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 });
  if (min !== null && max !== null) {
    return `R${fmt.format(min)} – R${fmt.format(max)} / mo`;
  }
  const single = min ?? max ?? 0;
  return `R${fmt.format(single)} / mo`;
}

function relativeDate(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  const isActive = isJobActive(job);

  return (
   <div
  onClick={() => onSelect(job.id)}
  className={cn(
    "relative cursor-pointer overflow-hidden rounded-xl bg-[var(--paper)] py-5 pl-6 pr-5 transition-all duration-200",
    "shadow-[0_1px_2px_rgba(28,35,33,0.06)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(28,35,33,0.08)]",
    "dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]",
    isSelected ? "ring-2 ring-[var(--amber)]" : "ring-1 ring-[var(--line)]",
    !isActive && "opacity-70 saturate-50"
  )}
>
  <span
    className={cn(
      "absolute top-0 left-0 h-full w-1.5",
      isActive ? "bg-[var(--amber)]" : "bg-[var(--line)]"
    )}
  />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold leading-snug text-[var(--ink)]">{job.title}</h3>
        <EmploymentTypeBadge type={job.type} />
      </div>

      <p className="mt-1 text-sm text-[var(--muted-text)]">
        {job.companyName} · {job.location}
      </p>

      <p className="font-meta mt-3 text-sm font-medium text-[var(--ink)]">
        {formatSalary(job.salaryMin, job.salaryMax, job.salaryDisplay)}
      </p>

      <div className="mt-4 border-t border-dashed border-[var(--line)] pt-3">
        <div className="flex items-center justify-between">
          <span className="font-meta text-[11px] uppercase text-[var(--muted-text)]">
            Posted {relativeDate(job.postedAt)}
          </span>
          {job.applicationCount > 0 && (
            <span className="font-meta text-[11px] uppercase text-[var(--muted-text)]">
              {job.applicationCount} applicants
            </span>
          )}
        </div>
        <JobStatusBadge isActive={isActive} />
      </div>
    </div>
  );
}