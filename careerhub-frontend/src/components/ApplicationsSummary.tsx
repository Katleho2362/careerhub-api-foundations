interface ApplicationStat {
  jobId: string;
  applicationCount: number;
}

async function getApplicationStats(): Promise<ApplicationStat[]> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/applications/stats`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json();
}

// ── Skeleton — used as the Suspense fallback ──────────────────────────────────
export function ApplicationsSummarySkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-[var(--paper)] p-6 ring-1 ring-[var(--line)]">
      <div className="h-3 w-32 rounded bg-[var(--line)]" />
      <div className="mt-3 h-8 w-16 rounded bg-[var(--line)]" />
    </div>
  );
}

// ── Async Server Component ─────────────────────────────────────────────────────
export async function ApplicationsSummary() {
  const stats = await getApplicationStats();
  const total = stats.reduce((sum, s) => sum + s.applicationCount, 0);

  return (
    <div className="rounded-xl bg-[var(--paper)] p-6 ring-1 ring-[var(--line)]">
      <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
        Total Applications
      </p>
      <p className="font-display mt-2 text-4xl font-semibold text-[var(--ink)]">
        {total}
      </p>
    </div>
  );
}