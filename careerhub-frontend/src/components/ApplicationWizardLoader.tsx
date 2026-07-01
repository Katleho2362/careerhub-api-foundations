"use client";

import dynamic from "next/dynamic";

export const ApplicationWizard = dynamic(
  () =>
    import("@/components/ApplicationWizard").then((mod) => ({
      default: mod.ApplicationWizard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 animate-pulse rounded-xl bg-[var(--paper)] ring-1 ring-[var(--line)]" />
    ),
  }
);