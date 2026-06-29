import { JobListSkeleton } from "@/components/JobCardSkeleton";

export default function JobsLoading() {
  return (
    <main className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Mirror the heading block from page.tsx */}
        <div className="h-3 w-20 animate-pulse rounded bg-[var(--line)]" />
        <div className="mt-2 h-8 w-48 animate-pulse rounded bg-[var(--line)]" />

        {/* Mirror the filters bar */}
        <div className="mt-6 h-10 w-full animate-pulse rounded-xl bg-[var(--line)]" />

        {/* Skeleton grid */}
        <div className="mt-8">
          <JobListSkeleton />
        </div>
      </div>
    </main>
  );
}