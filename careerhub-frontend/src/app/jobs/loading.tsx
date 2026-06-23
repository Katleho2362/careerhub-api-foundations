// // No "use client" needed — this is also a Server Component. Next.js
// // renders this immediately (it has no async work of its own) while the
// // sibling page.tsx in this same folder is still awaiting fetchJobs().

// export default function Loading() {
//   return (
//     <main className="px-6 py-10 md:px-12">
//       <div className="mx-auto max-w-6xl">
//         <div className="h-3 w-20 animate-pulse rounded bg-[var(--line)] dark:bg-[var(--line)]" />
//         <div className="mt-2 h-8 w-48 animate-pulse rounded bg-[var(--line)] dark:bg-[var(--line)]" />

//         <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div
//               key={i}
//               className="h-32 animate-pulse rounded-xl bg-[var(--paper)] ring-1 ring-[var(--line)]
//                          dark:bg-[var(--paper)] dark:ring-[var(--line)]"
//             />
//           ))}
//         </div>
//       </div>
//     </main>
//   );
// }

// loading.tsx is a special Next.js file. When JobsPage (page.tsx in this
// same folder) is still awaiting its data on the server, Next.js
// automatically wraps it in a Suspense boundary and shows this file's
// export as the fallback. The user sees this skeleton immediately — the
// HTML for it arrives in the first response — and it is swapped for the
// real grid once the server finishes fetching and streaming the page.
// No "use client" needed: animate-pulse is pure CSS; nothing here runs
// in the browser.

export default function JobsLoading() {
  return (
    <main className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Mirror the heading block from page.tsx so the layout doesn't
            shift when real content arrives */}
        <div className="h-3 w-20 animate-pulse rounded bg-[var(--line)]" />
        <div className="mt-2 h-8 w-48 animate-pulse rounded bg-[var(--line)]" />

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Six skeleton cards — matches a typical jobs list page.
              Each card mirrors the structure of JobLinkCard:
              a title-bar row at the top, a subtitle line below. */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[var(--paper)] p-5 ring-1 ring-[var(--line)]
                         dark:bg-[var(--paper)] dark:ring-[var(--line)]"
            >
              {/* Title row + badge placeholder */}
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--line)]" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--line)]" />
              </div>
              {/* Company · Location line */}
              <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--line)]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}