"use client";

import { useStore } from "zustand";
import { useDashboardStore } from "@/stores/dashboardStore";

export function DashboardToolbar() {
  const view = useStore(useDashboardStore, (s) => s.view);
  const setView = useStore(useDashboardStore, (s) => s.setView);
  const showClosedJobs = useStore(useDashboardStore, (s) => s.showClosedJobs);
  const toggleShowClosedJobs = useStore(useDashboardStore, (s) => s.toggleShowClosedJobs);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* View toggle */}
      <div className="flex overflow-hidden rounded-md border border-[var(--line)]">
        <button
          onClick={() => setView("table")}
          className={`px-4 py-2 text-sm transition-colors
            ${view === "table"
              ? "bg-[var(--amber)] text-[var(--ink)]"
              : "bg-[var(--paper)] text-[var(--muted-text)] hover:text-[var(--ink)]"
            }`}
        >
          Table
        </button>
        <button
          onClick={() => setView("grid")}
          className={`border-l border-[var(--line)] px-4 py-2 text-sm transition-colors
            ${view === "grid"
              ? "bg-[var(--amber)] text-[var(--ink)]"
              : "bg-[var(--paper)] text-[var(--muted-text)] hover:text-[var(--ink)]"
            }`}
        >
          Grid
        </button>
      </div>

      {/* Show closed jobs toggle */}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted-text)]">
        <input
          type="checkbox"
          checked={showClosedJobs}
          onChange={toggleShowClosedJobs}
          className="h-4 w-4 accent-[var(--amber)]"
        />
        Show closed jobs
      </label>
    </div>
  );
}