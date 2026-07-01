
// import Link from "next/link";

// export default function HomePage() {
//   return (
//     <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
//       <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//         CareerHub
//       </p>

//       <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)] sm:text-5xl">
//         Find your next role.
//       </h1>

//       <p className="mt-4 max-w-md text-base text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//         CareerHub connects candidates with open roles. Browse live listings,
//         read job details, and submit applications — all in one place.
//         Employers can manage listings from the dashboard.
//       </p>

//       <p className="mt-10 font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//         Sign in as
//       </p>

//       <div className="mt-3 flex flex-wrap justify-center gap-4">
//         <Link
//           href="/login"
//           className="font-meta rounded-full bg-[var(--amber)] px-6 py-3 text-xs
//                     uppercase text-[var(--ink)] transition-opacity hover:opacity-80"
//         >
//           Applicant
//         </Link>
//         <Link
//           href="/login"
//           className="font-meta rounded-full border border-[var(--line)] bg-[var(--paper)]
//                     px-6 py-3 text-xs uppercase text-[var(--ink)] transition-colors
//                     hover:border-[var(--amber)] dark:border-[var(--line)]
//                     dark:bg-[var(--paper)] dark:text-[var(--ink)]
//                     dark:hover:border-[var(--amber)]"
//         >
//           Employer
//         </Link>
//       </div>

//       {/* <p className="mt-6 text-xs text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//         New here?{" "}
//         <Link
//           href="/login/applicant/register"
//           className="font-medium text-[var(--ink)] underline-offset-2 hover:underline dark:text-[var(--ink)]"
//         >
//           Create an applicant account
//         </Link>
//       </p> */}
//     </main>
//   );
// }

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <Image
        src="/hero-illustration.svg"
        alt="Illustration of a completed job application checklist"
        width={480}
        height={360}
        priority
        className="mb-6 h-auto w-full max-w-sm"
      />

      <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
        CareerHub
      </p>

      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)] sm:text-5xl">
        Find your next role.
      </h1>

      <p className="mt-4 max-w-md text-base text-[var(--muted-text)] dark:text-[var(--muted-text)]">
        CareerHub connects candidates with open roles. Browse live listings,
        read job details, and submit applications — all in one place.
        Employers can manage listings from the dashboard.
      </p>

      <p className="mt-10 font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
        Sign in as
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="font-meta rounded-full bg-[var(--amber)] px-6 py-3 text-xs
                    uppercase text-[var(--ink)] transition-opacity hover:opacity-80"
        >
          Applicant
        </Link>
        <Link
          href="/login"
          className="font-meta rounded-full border border-[var(--line)] bg-[var(--paper)]
                    px-6 py-3 text-xs uppercase text-[var(--ink)] transition-colors
                    hover:border-[var(--amber)] dark:border-[var(--line)]
                    dark:bg-[var(--paper)] dark:text-[var(--ink)]
                    dark:hover:border-[var(--amber)]"
        >
          Employer
        </Link>
      </div>
    </main>
  );
}