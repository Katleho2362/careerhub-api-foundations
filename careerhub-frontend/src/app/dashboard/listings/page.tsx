import { Suspense } from "react";
import { ApplicationsSummary, ApplicationsSummarySkeleton } from "@/components/ApplicationsSummary";
import { ListingsTableSkeleton } from "@/components/ListingsTable";
import { ListingsClientWrapper } from "@/components/ListingsClientWrapper";
import { DashboardToolbar } from "@/components/DashboardToolbar";
import { fetchJobs } from "@/lib/api";

async function getApplicationStats() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/applications/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json();
}

async function ListingsSection() {
  const [jobs, stats] = await Promise.all([fetchJobs(), getApplicationStats()]);
  return <ListingsClientWrapper jobs={jobs} stats={stats} />;
}

export default async function DashboardListingsPage() {
  return (
    <main className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
            Employer Dashboard
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            All Listings
          </h1>
        </div>

        <DashboardToolbar />

        <Suspense fallback={<ApplicationsSummarySkeleton />}>
          <ApplicationsSummary />
        </Suspense>

        <Suspense fallback={<ListingsTableSkeleton />}>
          <ListingsSection />
        </Suspense>
      </div>
    </main>
  );
}