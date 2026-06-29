import { JobLinkCard } from "@/components/JobLinkCard";
import { JobFilters } from "@/components/JobFilters";
import { fetchJobs } from "@/lib/api";

interface JobsPageProps {
  searchParams: Promise<{ q?: string; location?: string; status?: string }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { q, location, status } = await searchParams;

  const [filteredJobs, allJobs] = await Promise.all([
    fetchJobs({ q, location, status }),
    fetchJobs(),
  ]);

  const dbIsEmpty = allJobs.length === 0;
  const hasActiveFilters = !!(q || location || status);

  return (
    <main className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
          CareerHub
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
          Open roles
        </h1>

        <div className="mt-6">
          <JobFilters />
        </div>

        {filteredJobs.length === 0 ? (
          dbIsEmpty ? (
            <div className="mt-12 text-center">
              <p className="font-display text-lg font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                No jobs are currently listed.
              </p>
              <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                Check back soon — new roles are added regularly.
              </p>
            </div>
          ) : (
            <div className="mt-12 text-center">
              <p className="font-display text-lg font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                No jobs match your search.
              </p>
              {hasActiveFilters && (
                <p className="mt-1 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                  {[
                    q && `"${q}"`,
                    location && `in ${location}`,
                    status && `status: ${status}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <a
                href="/jobs"
                className="font-meta mt-4 inline-block rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase text-[var(--ink)] transition-colors hover:border-[var(--ink)] dark:text-[var(--ink)]"
              >
                Clear all filters
              </a>
            </div>
          )
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobLinkCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
