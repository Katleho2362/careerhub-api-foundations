import { JobListing, JobType } from "@/types";

interface JobCardProps {
  job: JobListing;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const badgeStyles: Record<JobType, string> = {
  FullTime: "bg-green-100 text-green-800",
  PartTime: "bg-blue-100 text-blue-800",
  Contract: "bg-amber-100 text-amber-800",
  Internship: "bg-purple-100 text-purple-800",
};

function formatSalary(min: number | null, max: number | null, fallback: string): string {
  if (min === null && max === null) {
    return fallback || "Salary not disclosed";
  }
  const fmt = new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 });
  if (min !== null && max !== null) {
    return `R${fmt.format(min)} – R${fmt.format(max)} pm`;
  }
  const single = min ?? max ?? 0;
  return `R${fmt.format(single)} pm`;
}

function relativeDate(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  const isActive = new Date(job.closingDate).getTime() > Date.now();

  return (
    <div
      onClick={() => onSelect(job.id)}
      className={`relative cursor-pointer rounded-lg border p-4 transition ${
        isSelected ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200"
      }`}
    >
      <span className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[job.type]}`}>
        {job.type}
      </span>

      <h3 className="pr-20 font-semibold text-gray-900">{job.title}</h3>
      <p className="text-sm text-gray-500">{job.companyName} · {job.location}</p>
      <p className="mt-2 text-sm font-medium text-gray-700">
        {formatSalary(job.salaryMin, job.salaryMax, job.salaryDisplay)}
      </p>
      <p className="text-xs text-gray-400">Posted {relativeDate(job.postedAt)}</p>

      {!isActive && (
        <span className="mt-2 inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          Closed
        </span>
      )}

      {job.applicationCount > 0 && (
        <p className="mt-1 text-xs text-gray-400">{job.applicationCount} applicants</p>
      )}
    </div>
  );
}