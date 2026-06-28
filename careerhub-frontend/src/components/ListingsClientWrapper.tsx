"use client";

import { useStore } from "zustand";
import { useDashboardStore } from "@/stores/dashboardStore";
import { ListingsTable } from "./ListingsTable";
import type { JobListing } from "@/types";

interface Props {
  jobs: JobListing[];
  stats: { jobId: string; applicationCount: number }[];
}

export function ListingsClientWrapper({ jobs, stats }: Props) {
  const view = useStore(useDashboardStore, (s) => s.view);
  const showClosedJobs = useStore(useDashboardStore, (s) => s.showClosedJobs);

  return <ListingsTable jobs={jobs} stats={stats} view={view} showClosedJobs={showClosedJobs} />;
}