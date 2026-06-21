import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-[var(--line)]/60 dark:bg-white/10",
        className
      )}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[var(--paper)] py-5 pl-6 pr-5 ring-1 ring-[var(--line)]">
      {/* Accent bar — neutral placeholder, not the amber "active" colour */}
      <span className="absolute top-0 left-0 h-full w-1.5 bg-[var(--line)]" />

      {/* Heading area: title + employment-type badge */}
      <div className="flex items-start justify-between gap-3">
        <SkeletonBlock className="h-4 w-3/5" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>

      {/* Company · location line */}
      <SkeletonBlock className="mt-2 h-3 w-2/5" />

      {/* Salary line */}
      <SkeletonBlock className="mt-4 h-3.5 w-1/3" />

      {/* Footer: dashed divider, posted date / applicants, status badge */}
      <div className="mt-4 border-t border-dashed border-[var(--line)] pt-3">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-2.5 w-1/4" />
          <SkeletonBlock className="h-2.5 w-1/5" />
        </div>
        <SkeletonBlock className="mt-2 h-4 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function JobListSkeleton() {
  return (
    <div>
      {/* Matches JobList's "Showing N jobs" label region with a placeholder */}
      <SkeletonBlock className="mb-4 h-3 w-28" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}