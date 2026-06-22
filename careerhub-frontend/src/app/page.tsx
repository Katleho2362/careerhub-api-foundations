// "use client";

// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { JobList } from "@/components/JobList";
// import { JobListSkeleton } from "@/components/JobCardSkeleton";
// import { Sidebar, ViewFilter } from "@/components/Sidebar";
// import { isJobActive } from "@/lib/job-status";
// import { fetchJobs } from "@/lib/api";

// const STORAGE_KEY = "careerhub:selectedJobId";

// export default function Home() {
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [view, setView] = useState<ViewFilter>("all");

//   // useQuery replaces the old hardcoded `jobs` array entirely. queryKey
//   // ["jobs"] is the cache identity — any other component using the same
//   // key would share this exact cached result. queryFn is the fetchJobs
//   // function from src/lib/api.ts. We rename `data` to `jobs` on
//   // destructure to keep the rest of the component's variable names
//   // unchanged from before.

//   const {
//     data: jobs,
//     isPending,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["jobs"],
//     queryFn: fetchJobs,
//   });

//   const selectedJob = jobs?.find((job) => job.id === selectedId) ?? null;

//   const openJobs = jobs?.filter(isJobActive) ?? [];
//   const closedJobs = jobs?.filter((j) => !isJobActive(j)) ?? [];
//   const visibleJobs =
//     view === "open" ? openJobs : view === "closed" ? closedJobs : jobs ?? [];

//   // Effect 1 — restore from sessionStorage on mount (runs once).
//   // No longer validated against `jobs` — jobs is undefined on mount while
//   // the query is pending. If the stored ID doesn't match a loaded job,
//   // `selectedJob` simply evaluates to null and nothing renders in the
//   // summary panel — a graceful degradation, not an error.
//   useEffect(() => {
//     const stored = sessionStorage.getItem(STORAGE_KEY);
//     if (stored !== null) {
//       setSelectedId(stored);
//     }
//   }, []);

//   // Effect 2 — unchanged from before. Persists selectedId to
//   // sessionStorage any time it changes, so a refresh remembers the
//   // selection.
//   useEffect(() => {
//     if (selectedId !== null) {
//       sessionStorage.setItem(STORAGE_KEY, selectedId);
//     } else {
//       sessionStorage.removeItem(STORAGE_KEY);
//     }
//   }, [selectedId]);

//   function handleSelect(id: string) {
//     setSelectedId((current) => (current === id ? null : id));
//   }

//   return (
//     <div className="flex min-h-screen bg-[var(--canvas)] dark:bg-[var(--canvas)]">
//       <Sidebar
//         view={view}
//         onViewChange={setView}
//         openCount={openJobs.length}
//         closedCount={closedJobs.length}
//       />

//       <main className="flex-1 px-6 py-10 md:px-12">
//         <div className="mx-auto max-w-6xl">
//           <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//             CareerHub
//           </p>
//           <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
//             Find your next role.
//           </h1>

//           {selectedJob && (
//             <div
//               className="relative mt-6 overflow-hidden rounded-xl
//                          bg-[var(--paper)] dark:bg-[var(--paper)]
//                          py-4 pl-6 pr-5
//                          ring-1 ring-[var(--line)] dark:ring-[var(--line)]"
//             >
//               <span className="absolute top-0 left-0 h-full w-1.5 bg-[var(--amber)]" />

//               <p className="font-meta text-[11px] uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//                 Selected listing
//               </p>
//               <p className="font-display mt-1 font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
//                 {selectedJob.title}
//               </p>
//               <p className="text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//                 {selectedJob.companyName}
//               </p>
//             </div>
//           )}

//           <div className="mt-8">
//             {isPending && <JobListSkeleton />}

//             {isError && (
//               <div
//                 className="rounded-xl border border-red-300 bg-red-50 px-6 py-8 text-center
//                            dark:border-red-900 dark:bg-red-950/40"
//               >
//                 <p className="font-display text-base font-medium text-red-800 dark:text-red-300">
//                   Couldn&apos;t load job listings
//                 </p>
//                 <p className="mt-1 text-sm text-red-700 dark:text-red-400">
//                   {error.message}
//                 </p>
//                 <button
//                   onClick={() => refetch()}
//                   className="font-meta mt-4 rounded-full bg-red-700 px-4 py-2 text-xs uppercase
//                              text-white transition-colors hover:bg-red-800
//                              dark:bg-red-600 dark:hover:bg-red-500"
//                 >
//                   Try again
//                 </button>
//               </div>
//             )}

//             {!isPending && !isError && jobs !== undefined && (
//               <JobList
//                 jobs={visibleJobs}
//                 selectedId={selectedId}
//                 onSelect={handleSelect}
//               />
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { JobList } from "@/components/JobList";
import { JobListSkeleton } from "@/components/JobCardSkeleton";
import { Sidebar, ViewFilter } from "@/components/Sidebar";
import { ApplicationForm } from "@/components/ApplicationForm";
import { isJobActive } from "@/lib/job-status";
import { fetchJobs } from "@/lib/api";

const STORAGE_KEY = "careerhub:selectedJobId";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ViewFilter>("all");

  // useQuery replaces the old hardcoded `jobs` array entirely. queryKey
  // ["jobs"] is the cache identity — any other component using the same
  // key would share this exact cached result. queryFn is the fetchJobs
  // function from src/lib/api.ts. We rename `data` to `jobs` on
  // destructure to keep the rest of the component's variable names
  // unchanged from before.

  const {
    data: jobs,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const selectedJob = jobs?.find((job) => job.id === selectedId) ?? null;

  const openJobs = jobs?.filter(isJobActive) ?? [];
  const closedJobs = jobs?.filter((j) => !isJobActive(j)) ?? [];
  const visibleJobs =
    view === "open" ? openJobs : view === "closed" ? closedJobs : jobs ?? [];

  // Effect 1 — restore from sessionStorage on mount (runs once).
  // No longer validated against `jobs` — jobs is undefined on mount while
  // the query is pending. If the stored ID doesn't match a loaded job,
  // `selectedJob` simply evaluates to null and nothing renders in the
  // summary panel — a graceful degradation, not an error.
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setSelectedId(stored);
    }
  }, []);

  // Effect 2 — unchanged from before. Persists selectedId to
  // sessionStorage any time it changes, so a refresh remembers the
  // selection.
  useEffect(() => {
    if (selectedId !== null) {
      sessionStorage.setItem(STORAGE_KEY, selectedId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedId]);

  function handleSelect(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <div className="flex min-h-screen bg-[var(--canvas)] dark:bg-[var(--canvas)]">
      <Sidebar
        view={view}
        onViewChange={setView}
        openCount={openJobs.length}
        closedCount={closedJobs.length}
      />

      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            CareerHub
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
            Find your next role.
          </h1>

          {selectedJob && (
            <div
              className="relative mt-6 overflow-hidden rounded-xl
                         bg-[var(--paper)] dark:bg-[var(--paper)]
                         py-4 pl-6 pr-5
                         ring-1 ring-[var(--line)] dark:ring-[var(--line)]"
            >
              <span className="absolute top-0 left-0 h-full w-1.5 bg-[var(--amber)]" />

              <p className="font-meta text-[11px] uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                Selected listing
              </p>
              <p className="font-display mt-1 font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                {selectedJob.title}
              </p>
              <p className="text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                {selectedJob.companyName}
              </p>
            </div>
          )}

          {/* ApplicationForm renders only once the query has succeeded
              AND a job is selected — rendering it while isPending or
              isError would mean offering a form for data that might not
              exist yet, or might be wrong by the time it loads. */}
          {!isPending && !isError && selectedJob !== null && (
            <ApplicationForm
              jobId={selectedJob.id}
              jobTitle={selectedJob.title}
            />
          )}

          <div className="mt-8">
            {isPending && <JobListSkeleton />}

            {isError && (
              <div
                className="rounded-xl border border-red-300 bg-red-50 px-6 py-8 text-center
                           dark:border-red-900 dark:bg-red-950/40"
              >
                <p className="font-display text-base font-medium text-red-800 dark:text-red-300">
                  Couldn&apos;t load job listings
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {error.message}
                </p>
                <button
                  onClick={() => refetch()}
                  className="font-meta mt-4 rounded-full bg-red-700 px-4 py-2 text-xs uppercase
                             text-white transition-colors hover:bg-red-800
                             dark:bg-red-600 dark:hover:bg-red-500"
                >
                  Try again
                </button>
              </div>
            )}

            {!isPending && !isError && jobs !== undefined && (
              <JobList
                jobs={visibleJobs}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}