import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Providers } from "./providers";

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

// RootLayout does NOT need "use client" — Server Components are allowed to
// import and render Client Components. The "use client" boundary lives
// inside Providers.tsx (and ThemeToggle.tsx) only.
export default function RootLayout({ children }: { children: React.ReactNode }) {
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
              <span
                className="font-display text-sm font-semibold text-[var(--ink)]
                           dark:text-[var(--ink)]"
              >
                CareerHub
              </span>
              <ThemeToggle />
            </div>
          </header>

          {children}
        </Providers>
      </body>
    </html>
  );
}