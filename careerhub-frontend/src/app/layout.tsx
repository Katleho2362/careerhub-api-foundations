// import type { Metadata } from "next";
// import { Space_Grotesk, Inter, IBM_Plex_Mono, Geist } from "next/font/google";
// import Link from "next/link";
// import "./globals.css";
// import { cn } from "@/lib/utils";
// import { ThemeToggle } from "@/components/ThemeToggle";
// import { Providers } from "./providers";
// import { auth, signOut } from "@/auth";
// import { Toaster } from "sonner";

// const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
// const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["500", "700"] });
// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["500"] });

// export const metadata: Metadata = {
//   title: "CareerHub",
//   description: "Find your next role.",
// };

// export default async function RootLayout({ children }: { children: React.ReactNode }) {
//   const session = await auth();
//   const isEmployer = session?.user?.role === "employer";
//   const isCandidate = session?.user?.role === "candidate";

//   async function handleSignOut() {
//     "use server";
//     await signOut({ redirectTo: "/" });
//   }

//   return (
//     <html lang="en" className={cn("font-sans", geist.variable)}>
//       <body className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} bg-[var(--canvas)] dark:bg-[var(--canvas)]`}>
//         <Providers>
//           <header className="border-b border-[var(--line)] bg-[var(--paper)] px-8 py-3">
//             <div className="mx-auto flex max-w-6xl items-center justify-between">
//               <Link href="/" className="font-display text-sm font-semibold text-[var(--ink)] transition-opacity hover:opacity-70">
//                 CareerHub
//               </Link>

//               <div className="flex items-center gap-6">
//                 {session?.user && (
//                   <nav className="flex items-center gap-4">
//                     {isCandidate && (
//                       <Link href="/jobs" className="font-meta text-xs uppercase text-[var(--muted-text)] transition-colors hover:text-[var(--ink)]">
//                         Jobs
//                       </Link>
//                     )}
//                     {isEmployer && (
//                       <Link href="/dashboard/listings" className="font-meta text-xs uppercase text-[var(--muted-text)] transition-colors hover:text-[var(--ink)]">
//                         Dashboard
//                       </Link>
//                     )}
//                   </nav>
//                 )}

//                 <div className="flex items-center gap-3">
//                   <ThemeToggle />

//                   {session?.user && (
//                     <>
//                       <span className="font-meta text-xs text-[var(--muted-text)]">
//                         {session.user.name}
//                         <span className="ml-1.5 rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] uppercase">
//                           {session.user.role}
//                         </span>
//                       </span>
//                       <form action={handleSignOut}>
//                         <button
//                           type="submit"
//                           className="font-meta rounded-full border border-[var(--line)] px-3 py-1.5
//                                      text-xs uppercase text-[var(--muted-text)] transition-colors
//                                      hover:border-[var(--ink)] hover:text-[var(--ink)]"
//                         >
//                           Sign out
//                         </button>
//                       </form>
//                     </>
//                   )}

//                   {!session?.user && (
//                     <Link
//                       href="/login"
//                       className="font-meta rounded-full border border-[var(--line)] px-3 py-1.5
//                                  text-xs uppercase text-[var(--muted-text)] transition-colors
//                                  hover:border-[var(--ink)] hover:text-[var(--ink)]"
//                     >
//                       Sign In
//                     </Link>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </header>
//           {children}
//           <Providers>
//           <header>...</header>
//           {children}
//           <Toaster position="top-right" richColors />
//         </Providers>
//         </Providers>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono, Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Providers } from "./providers";
import { auth, signOut } from "@/auth";
import { Toaster } from "sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["500"] });

export const metadata: Metadata = {
  title: "CareerHub",
  description: "Find your next role.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isEmployer = session?.user?.role === "employer";
  const isCandidate = session?.user?.role === "candidate";

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} bg-[var(--canvas)] dark:bg-[var(--canvas)]`}>
        <Providers>
          <header className="border-b border-[var(--line)] bg-[var(--paper)] px-8 py-3">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <Link href="/" className="font-display text-sm font-semibold text-[var(--ink)] transition-opacity hover:opacity-70">
                CareerHub
              </Link>

              <div className="flex items-center gap-6">
                {session?.user && (
                  <nav className="flex items-center gap-4">
                    {isCandidate && (
                      <Link href="/jobs" className="font-meta text-xs uppercase text-[var(--muted-text)] transition-colors hover:text-[var(--ink)]">
                        Jobs
                      </Link>
                    )}
                    {isEmployer && (
                      <Link href="/dashboard/listings" className="font-meta text-xs uppercase text-[var(--muted-text)] transition-colors hover:text-[var(--ink)]">
                        Dashboard
                      </Link>
                    )}
                  </nav>
                )}

                <div className="flex items-center gap-3">
                  <ThemeToggle />

                  {session?.user && (
                    <>
                      <span className="font-meta text-xs text-[var(--muted-text)]">
                        {session.user.name}
                        <span className="ml-1.5 rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] uppercase">
                          {session.user.role}
                        </span>
                      </span>
                      <form action={handleSignOut}>
                        <button
                          type="submit"
                          className="font-meta rounded-full border border-[var(--line)] px-3 py-1.5
                                     text-xs uppercase text-[var(--muted-text)] transition-colors
                                     hover:border-[var(--ink)] hover:text-[var(--ink)]"
                        >
                          Sign out
                        </button>
                      </form>
                    </>
                  )}

                  {!session?.user && (
                    <Link
                      href="/login"
                      className="font-meta rounded-full border border-[var(--line)] px-3 py-1.5
                                 text-xs uppercase text-[var(--muted-text)] transition-colors
                                 hover:border-[var(--ink)] hover:text-[var(--ink)]"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </header>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}