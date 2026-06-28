import { create } from "zustand";

interface DashboardStore {
  view: "table" | "grid";
  setView: (view: "table" | "grid") => void;
  showClosedJobs: boolean;
  toggleShowClosedJobs: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  view: "table",
  setView: (view) => set({ view }),
  showClosedJobs: true,
  toggleShowClosedJobs: () =>
    set((state) => ({ showClosedJobs: !state.showClosedJobs })),
}));