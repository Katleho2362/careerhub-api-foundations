import { JobLinkCard } from "@/components/JobLinkCard";
import { fetchJobs } from "@/lib/api";

// async function, no "use client" — this is a Server Component. Next.js
// runs this on the server, awaits the fetch, and sends finished HTML to
// the browser. There is no loading spinner managed by React state here —
// the equivalent loading UI is handled entirely by loading.tsx in this
// same folder, which Next.js shows automatically while this component
// is still awaiting its data.

export default async function JobsPage() {
  const jobs = await fetchJobs();

  return (
    <main className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
          CareerHub
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
          Open roles
        </h1>

        {jobs.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            No job listings are available right now.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobLinkCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}