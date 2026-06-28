// import { notFound } from "next/navigation";
// import Link from "next/link";
// import { fetchJobById } from "@/lib/api";
// import { isJobActive } from "@/lib/job-status";
// //import { getSession } from "@/lib/session";
// import { auth } from "@/auth";
// import { ApplicationForm } from "@/components/ApplicationForm";
// import { EmploymentTypeBadge, JobStatusBadge } from "@/components/JobStatusBadge";

// // async Server Component — no "use client". Next.js passes `params`
// // automatically from the dynamic segment [id] in the folder name.
// // params.id is always a string, regardless of what the URL looks like
// // (/jobs/42 or /jobs/some-guid) — URL segments are always text.
// interface JobDetailPageProps {
//   params: Promise<{ id: string }>;
// }

// export default async function JobDetailPage({ params }: JobDetailPageProps) {
//   const { id } = await params;

//   // fetchJobById returns null on 404, throws on any other non-ok status.
//   // notFound() triggers the nearest not-found.tsx boundary (the file we
//   // create alongside this one). It does NOT throw a JS Error — it throws
//   // a special Next.js signal that the router intercepts to render the
//   // not-found UI and set the HTTP status to 404.
//   const job = await fetchJobById(id);
//   if (job === null) {
//     notFound();
//   }

//   const active = isJobActive(job);

//   // Applicant session is read here, server-side, because ApplicationForm
//   // (a Client Component) cannot read the httpOnly session cookie itself.
//   // The session's username is passed down as a read-only display value —
//   // the applicant's identity comes from their account (the Applicant row
//   // tied to session.applicantId on the real API), not from a freshly
//   // typed-in field, since the real SubmitApplicationRequest never
//   // accepts a name/email at all.
  
//   //const session = await getSession("Applicant");
//   const session = await auth();

//   return (
//     <main className="px-6 py-10 md:px-12">
//       <div className="mx-auto max-w-3xl">
//         {/* Back navigation */}
//         <Link
//           href="/jobs"
//           className="font-meta inline-flex items-center gap-1 text-xs uppercase
//                      text-[var(--muted-text)] transition-colors
//                      hover:text-[var(--ink)] dark:text-[var(--muted-text)]
//                      dark:hover:text-[var(--ink)]"
//         >
//           ← Back to jobs
//         </Link>

//         {/* Job header */}
//         <div className="mt-6">
//           <div className="flex flex-wrap items-start gap-3">
//             <h1 className="font-display flex-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
//               {job.title}
//             </h1>
//             <EmploymentTypeBadge type={job.type} />
//           </div>

//           <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//             {job.companyName} · {job.location}
//           </p>

//           {/* JobStatusBadge only renders when the job is closed */}
//           <div className="mt-2">
//             <JobStatusBadge isActive={active} />
//           </div>
//         </div>

//         {/* Salary range */}
//         {(job.salaryMin != null || job.salaryMax != null) && (
//           <div
//             className="mt-6 inline-block rounded-lg border border-[var(--line)]
//                        bg-[var(--paper)] px-4 py-2 dark:border-[var(--line)]
//                        dark:bg-[var(--paper)]"
//           >
//             <p className="font-meta text-[11px] uppercase text-[var(--muted-text)]">
//               Salary
//             </p>
//             <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
//               {job.salaryMin != null && job.salaryMax != null
//                 ? `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`
//                 : job.salaryMin != null
//                   ? `From $${job.salaryMin.toLocaleString()}`
//                   : `Up to $${job.salaryMax!.toLocaleString()}`}
//             </p>
//           </div>
//         )}

//         {/* Description */}
//         <div
//           className="mt-8 rounded-xl bg-[var(--paper)] p-6 ring-1 ring-[var(--line)]
//                      dark:bg-[var(--paper)] dark:ring-[var(--line)]"
//         >
//           <h2 className="font-display mb-3 font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
//             About the role
//           </h2>
//           <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//             {job.description}
//           </p>
//         </div>

//         {/* Closing date */}
//         <p className="mt-4 text-xs text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//           {active
//             ? `Applications close ${new Date(job.closingDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`
//             : `Closed ${new Date(job.closingDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`}
//         </p>

//         {/* ── The composition moment ──────────────────────────────────────
//             This page is a Server Component. ApplicationForm is a Client
//             Component ("use client" at its top). The Server Component runs
//             on the server, fetches the job and the session, and passes
//             serialisable props across the boundary. Next.js serialises
//             those into the RSC payload; the browser hydrates
//             ApplicationForm separately, wiring up its form state, Zod
//             validation, and submitApplication mutation. Neither side
//             needs to know how the other works internally.
//             ─────────────────────────────────────────────────────────────── */}
//         <div className="mt-10">
//           {!session ? (
//             <div
//               className="rounded-xl border border-[var(--line)] bg-[var(--paper)]
//                          px-6 py-8 text-center dark:border-[var(--line)]
//                          dark:bg-[var(--paper)]"
//             >
//               <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
//                 Sign in to apply
//               </p>
//               <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//                 You need an applicant account to submit an application.
//               </p>
//               <Link
//                 //href={`/login/applicant?from=/jobs/${job.id}`}
//                  href="/login"
//                 className="font-meta mt-4 inline-block rounded-full bg-[var(--amber)]
//                            px-5 py-2 text-xs uppercase text-[var(--ink)]
//                            transition-opacity hover:opacity-90"
//               >
//                 Sign in as applicant
//               </Link>
//             </div>
//           ) : active ? (
//             <ApplicationForm
//               jobId={job.id}
//               jobTitle={job.title}
//               //applicantName={session.username}
//               applicantName={session?.user?.name ?? ""}
//             />
//           ) : (
//             <div
//               className="rounded-xl border border-[var(--line)] bg-[var(--paper)]
//                          px-6 py-8 text-center dark:border-[var(--line)]
//                          dark:bg-[var(--paper)]"
//             >
//               <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
//                 Applications are closed
//               </p>
//               <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
//                 This role is no longer accepting applications. Browse{" "}
//                 <Link
//                   href="/jobs"
//                   className="underline underline-offset-2 hover:text-[var(--ink)]"
//                 >
//                   open roles
//                 </Link>{" "}
//                 to find current opportunities.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }

import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchJobById } from "@/lib/api";
import { isJobActive } from "@/lib/job-status";
import { auth } from "@/auth";
import { ApplicationForm } from "@/components/ApplicationForm";
import { EmploymentTypeBadge, JobStatusBadge } from "@/components/JobStatusBadge";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  // Run job fetch and session read in parallel
  const [job, session] = await Promise.all([fetchJobById(id), auth()]);

  if (job === null) {
    notFound();
  }

  const active = isJobActive(job);

  return (
    <main className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/jobs"
          className="font-meta inline-flex items-center gap-1 text-xs uppercase
                     text-[var(--muted-text)] transition-colors
                     hover:text-[var(--ink)] dark:text-[var(--muted-text)]
                     dark:hover:text-[var(--ink)]"
        >
          ← Back to jobs
        </Link>

        <div className="mt-6">
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="font-display flex-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
              {job.title}
            </h1>
            <EmploymentTypeBadge type={job.type} />
          </div>

          <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            {job.companyName} · {job.location}
          </p>

          <div className="mt-2">
            <JobStatusBadge isActive={active} />
          </div>
        </div>

        {(job.salaryMin != null || job.salaryMax != null) && (
          <div
            className="mt-6 inline-block rounded-lg border border-[var(--line)]
                       bg-[var(--paper)] px-4 py-2 dark:border-[var(--line)]
                       dark:bg-[var(--paper)]"
          >
            <p className="font-meta text-[11px] uppercase text-[var(--muted-text)]">
              Salary
            </p>
            <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
              {job.salaryMin != null && job.salaryMax != null
                ? `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`
                : job.salaryMin != null
                  ? `From $${job.salaryMin.toLocaleString()}`
                  : `Up to $${job.salaryMax!.toLocaleString()}`}
            </p>
          </div>
        )}

        <div
          className="mt-8 rounded-xl bg-[var(--paper)] p-6 ring-1 ring-[var(--line)]
                     dark:bg-[var(--paper)] dark:ring-[var(--line)]"
        >
          <h2 className="font-display mb-3 font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
            About the role
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            {job.description}
          </p>
        </div>

        <p className="mt-4 text-xs text-[var(--muted-text)] dark:text-[var(--muted-text)]">
          {active
            ? `Applications close ${new Date(job.closingDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`
            : `Closed ${new Date(job.closingDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`}
        </p>

        <div className="mt-10">
          {session?.user?.role === "employer" ? (
            // Employer — can view but cannot apply
            <div
              className="rounded-xl border border-[var(--line)] bg-[var(--paper)]
                         px-6 py-8 text-center dark:border-[var(--line)]
                         dark:bg-[var(--paper)]"
            >
              <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                Employers cannot apply for jobs.
              </p>
            </div>

          ) : !session ? (
            // Signed out — show sign-in prompt
            <div
              className="rounded-xl border border-[var(--line)] bg-[var(--paper)]
                         px-6 py-8 text-center dark:border-[var(--line)]
                         dark:bg-[var(--paper)]"
            >
              <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                Sign in to apply
              </p>
              <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                You must be signed in to apply.{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-2 hover:text-[var(--ink)]"
                >
                  Sign in here.
                </Link>
              </p>
            </div>

          ) : active ? (
            // Candidate + job open — show form
            <ApplicationForm
              jobId={job.id}
              jobTitle={job.title}
              applicantName={session?.user?.name ?? ""}
            />

          ) : (
            // Candidate + job closed
            <div
              className="rounded-xl border border-[var(--line)] bg-[var(--paper)]
                         px-6 py-8 text-center dark:border-[var(--line)]
                         dark:bg-[var(--paper)]"
            >
              <p className="font-display font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                Applications are closed
              </p>
              <p className="mt-2 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                This role is no longer accepting applications.{" "}
                <Link
                  href="/jobs"
                  className="underline underline-offset-2 hover:text-[var(--ink)]"
                >
                  Browse open roles
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}