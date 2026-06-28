// "use client";

// import { useQueryStates, parseAsString } from "nuqs";
// import { useState, useEffect } from "react";

// export function JobFilters() {
//   const [filters, setFilters] = useQueryStates({
//     q: parseAsString.withDefault(""),
//     location: parseAsString.withDefault(""),
//     status: parseAsString.withDefault("all"),
//   });

//   // Local state for debounced inputs
//   const [keywordInput, setKeywordInput] = useState(filters.q);
//   const [locationInput, setLocationInput] = useState(filters.location);

//   // Debounce keyword — only update URL after 300ms of no typing
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setFilters({ q: keywordInput });
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [keywordInput]);

//   // Debounce location
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setFilters({ location: locationInput });
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [locationInput]);

//   return (
//     <div className="flex flex-wrap gap-3">
//       {/* Keyword search */}
//       <input
//         type="text"
//         placeholder="Search jobs..."
//         value={keywordInput}
//         onChange={(e) => setKeywordInput(e.target.value)}
//         className="rounded-md border border-[var(--line)] bg-[var(--paper)]
//                    px-3 py-2 text-sm text-[var(--ink)] outline-none
//                    focus:ring-2 focus:ring-[var(--amber)]"
//       />

//       {/* Location search */}
//       <input
//         type="text"
//         placeholder="Location..."
//         value={locationInput}
//         onChange={(e) => setLocationInput(e.target.value)}
//         className="rounded-md border border-[var(--line)] bg-[var(--paper)]
//                    px-3 py-2 text-sm text-[var(--ink)] outline-none
//                    focus:ring-2 focus:ring-[var(--amber)]"
//       />

//       {/* Status toggle — no debounce needed */}
//       <div className="flex rounded-md border border-[var(--line)] overflow-hidden">
//         <button
//           onClick={() => setFilters({ status: "all" })}
//           className={`px-4 py-2 text-sm transition-colors
//             ${filters.status === "all"
//               ? "bg-[var(--amber)] text-[var(--ink)]"
//               : "bg-[var(--paper)] text-[var(--muted-text)] hover:text-[var(--ink)]"
//             }`}
//         >
//           All
//         </button>
//         <button
//           onClick={() => setFilters({ status: "open" })}
//           className={`px-4 py-2 text-sm transition-colors border-l border-[var(--line)]
//             ${filters.status === "open"
//               ? "bg-[var(--amber)] text-[var(--ink)]"
//               : "bg-[var(--paper)] text-[var(--muted-text)] hover:text-[var(--ink)]"
//             }`}
//         >
//           Open
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useQueryStates, parseAsString } from "nuqs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function JobFilters() {
  const router = useRouter();
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(""),
    location: parseAsString.withDefault(""),
    status: parseAsString.withDefault("all"),
  }, {
    shallow: false, // forces a server re-render when URL changes
  });

  const [keywordInput, setKeywordInput] = useState(filters.q);
  const [locationInput, setLocationInput] = useState(filters.location);

  // Debounce keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ q: keywordInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  // Debounce location
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ location: locationInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [locationInput]);

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search jobs..."
        value={keywordInput}
        onChange={(e) => setKeywordInput(e.target.value)}
        className="rounded-md border border-[var(--line)] bg-[var(--paper)]
                   px-3 py-2 text-sm text-[var(--ink)] outline-none
                   focus:ring-2 focus:ring-[var(--amber)]"
      />

      <input
        type="text"
        placeholder="Location..."
        value={locationInput}
        onChange={(e) => setLocationInput(e.target.value)}
        className="rounded-md border border-[var(--line)] bg-[var(--paper)]
                   px-3 py-2 text-sm text-[var(--ink)] outline-none
                   focus:ring-2 focus:ring-[var(--amber)]"
      />

      <div className="flex overflow-hidden rounded-md border border-[var(--line)]">
        <button
          onClick={() => setFilters({ status: "all" })}
          className={`px-4 py-2 text-sm transition-colors
            ${filters.status === "all"
              ? "bg-[var(--amber)] text-[var(--ink)]"
              : "bg-[var(--paper)] text-[var(--muted-text)] hover:text-[var(--ink)]"
            }`}
        >
          All
        </button>
        <button
          onClick={() => setFilters({ status: "open" })}
          className={`border-l border-[var(--line)] px-4 py-2 text-sm transition-colors
            ${filters.status === "open"
              ? "bg-[var(--amber)] text-[var(--ink)]"
              : "bg-[var(--paper)] text-[var(--muted-text)] hover:text-[var(--ink)]"
            }`}
        >
          Open
        </button>
      </div>
    </div>
  );
}