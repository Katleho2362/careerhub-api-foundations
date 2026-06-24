import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono, Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Providers } from "./providers";
import { getSession } from "@/lib/session";
import { logoutEmployer, logoutApplicant } from "@/app/actions/auth";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "CareerHub",
  description: "Find your next role.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check both sessions — only one will be active at a time
  const [employerSession, applicantSession] = await Promise.all([
    getSession("Employer"),
    getSession("Applicant"),
  ]);

  const isEmployer = !!employerSession;
  const isApplicant = !!applicantSession;
  const isLoggedIn = isEmployer || isApplicant;

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}
                    bg-[var(--canvas)] dark:bg-[var(--canvas)]`}
      >
        <Providers>
          <header
            className="border-b border-[var(--line)] bg-[var(--paper)] px-8 py-3
                       dark:border-[var(--line)] dark:bg-[var(--paper)]"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <Link
                href="/"
                className="font-display text-sm font-semibold text-[var(--ink)]
                           transition-opacity hover:opacity-70 dark:text-[var(--ink)]"
              >
                CareerHub
              </Link>

              <div className="flex items-center gap-6">
                {/* Nav links — only shown when logged in */}
                {isLoggedIn && (
                  <nav className="flex items-center gap-4">
                    {isApplicant && (
                      <Link
                        href="/jobs"
                        className="font-meta text-xs uppercase text-[var(--muted-text)]
                                   transition-colors hover:text-[var(--ink)]
                                   dark:text-[var(--muted-text)] dark:hover:text-[var(--ink)]"
                      >
                        Jobs
                      </Link>
                    )}
                    {isEmployer && (
                      <Link
                        href="/dashboard/listings"
                        className="font-meta text-xs uppercase text-[var(--muted-text)]
                                   transition-colors hover:text-[var(--ink)]
                                   dark:text-[var(--muted-text)] dark:hover:text-[var(--ink)]"
                      >
                        Dashboard
                      </Link>
                    )}
                  </nav>
                )}

                <div className="flex items-center gap-3">
                  <ThemeToggle />

                  {/* Logout — role-aware */}
                  {isEmployer && (
                    <form action={logoutEmployer}>
                      <button
                        type="submit"
                        className="font-meta rounded-full border border-[var(--line)]
                                   px-3 py-1.5 text-xs uppercase text-[var(--muted-text)]
                                   transition-colors hover:border-[var(--ink)]
                                   hover:text-[var(--ink)]"
                      >
                        Sign out
                      </button>
                    </form>
                  )}

                  {isApplicant && (
                    <form action={logoutApplicant}>
                      <button
                        type="submit"
                        className="font-meta rounded-full border border-[var(--line)]
                                   px-3 py-1.5 text-xs uppercase text-[var(--muted-text)]
                                   transition-colors hover:border-[var(--ink)]
                                   hover:text-[var(--ink)]"
                      >
                        Sign out
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </header>

          {children}
        </Providers>
      </body>
    </html>
  );
}