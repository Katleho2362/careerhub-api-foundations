import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-[var(--line)] bg-[var(--paper)] px-4 py-8">
        <div>
          <p className="font-meta mb-6 text-[11px] uppercase text-[var(--muted-text)]">
            Employer Dashboard
          </p>
          <nav className="flex flex-col gap-1">
            <Link href="/dashboard/listings" className="rounded-lg px-3 py-2 text-sm text-[var(--ink)] transition-colors hover:bg-[var(--canvas)]">
              All Listings
            </Link>
            <Link href="/jobs" className="rounded-lg px-3 py-2 text-sm text-[var(--muted-text)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--ink)]">
              View as Candidate
            </Link>
          </nav>
        </div>

        {session?.user && (
          <div className="border-t border-[var(--line)] pt-4">
            <p className="font-meta text-[11px] uppercase text-[var(--muted-text)]">Signed in as</p>
            <p className="mt-0.5 text-sm font-medium text-[var(--ink)]">{session.user.name}</p>
            <form action={handleSignOut} className="mt-3">
              <button type="submit" className="w-full rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--muted-text)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--ink)]">
                Sign out
              </button>
            </form>
          </div>
        )}
      </aside>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}