// import { JobListing, ApplicationRequest, ApplicationResponse } from "@/types";
// import { isJobActive } from "./job-status";
// import { parseApiError } from "@/lib/api-error";

// // Shape returned by the real .NET API's GetJobs endpoint
// // (DTOs/PagedResponse.cs). We only need `data` for now — pagination
// // controls (page/pageSize navigation) are not part of this assignment,
// // so the other fields are typed but unused.
// interface PagedResponse<T> {
//   data: T[];
//   page: number;
//   pageSize: number;
//   totalCount: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
// }

// // fetchJobs and fetchJobById are PUBLIC, unauthenticated reads. Per the
// // Assignment 3.4 spec, these may keep the generic Error — their failures
// // surface at the nearest route error.tsx (a boundary, not a form-level
// // or toast-level concern), so there's no need to distinguish error codes
// // here the way an authenticated write path needs to.

// export async function fetchJobs(filters?: {
//   q?: string;
//   location?: string;
//   status?: string;
// }): Promise<JobListing[]> {
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//   const res = await fetch(`${baseUrl}/api/v1/jobs`, {
//     next: { tags: ["jobs"] },
//   });

//   if (!res.ok) {
//     throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
//   }

//   const paged: PagedResponse<JobListing> = await res.json();
//   let jobs = paged.data;

//   // Filter in JS after fetch — mock API doesn't support query params
//   if (filters?.q) {
//     const q = filters.q.toLowerCase();
//     jobs = jobs.filter(
//       (j) =>
//         j.title.toLowerCase().includes(q) ||
//         j.companyName.toLowerCase().includes(q) ||
//         j.description.toLowerCase().includes(q)
//     );
//   }

//   if (filters?.location) {
//     const loc = filters.location.toLowerCase();
//     jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc));
//   }

//   if (filters?.status === "open") {
//     jobs = jobs.filter((j) => isJobActive(j));
//   }

//   return jobs;
// }

// // =====================================================
// // Assignment 2.1 — single job fetch for /jobs/[id]
// // =====================================================
// // Used by Server Components (app/jobs/[id]/page.tsx), so this can be
// // called with `await` directly in an async component body — no useQuery,
// // no client-side loading state. cache: "no-store" is passed by the
// // CALLER (the page), not hardcoded here, matching the assignment's
// // requirement that the page itself specifies the fetch's cache option.
// //
// // Returns null on 404 instead of throwing, so the calling page can decide
// // to call notFound() — distinguishing "doesn't exist" (404, expected,
// // handled) from "something went wrong" (500/network error, unexpected,
// // should surface as a thrown Error).
// export async function fetchJobById(id: string): Promise<JobListing | null> {
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//   const res = await fetch(`${baseUrl}/api/v1/jobs/${id}`, {
//     next: { tags: ["jobs"] }, // was cache: "no-store"
//   });

//   if (res.status === 404) return null;

//   if (!res.ok) {
//     throw new Error(`Failed to fetch job: ${res.status} ${res.statusText}`);
//   }

//   return res.json() as Promise<JobListing>;
// }

// // submitApplication is an AUTHENTICATED write. Per Assignment 3.4 Part 2
// // Step 2, this must throw ApiError (via parseApiError) instead of a plain
// // Error, so callers (ApplicationWizard's mutation, error.tsx boundaries)
// // can branch on error.code — e.g. distinguishing a 409 duplicate
// // application from a 422 validation failure from a 401 expired session.
// export async function submitApplication(
//   data: ApplicationRequest
// ): Promise<ApplicationResponse> {
//   // Deliberately NOT using NEXT_PUBLIC_API_URL here. That variable points
//   // at the real .NET API, but /api/applications is a Next.js route
//   // handler that lives on Next.js's own origin, not on the .NET API. A
//   // relative path resolves against whatever origin the browser is
//   // already on, so it reaches the Next.js route correctly regardless of
//   // what NEXT_PUBLIC_API_URL is set to.
//   const res = await fetch("/api/applications", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) {
//     throw await parseApiError(res);
//   }

//   return res.json() as Promise<ApplicationResponse>;
// }
import { JobListing, ApplicationRequest, ApplicationResponse } from "@/types";
import { isJobActive } from "./job-status";
import { parseApiError } from "@/lib/api-error";

// Shape returned by the real .NET API's GetJobs endpoint
// (DTOs/PagedResponse.cs). We only need `data` for now — pagination
// controls (page/pageSize navigation) are not part of this assignment,
// so the other fields are typed but unused.
interface PagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// fetchJobs and fetchJobById are PUBLIC, unauthenticated reads. Per the
// Assignment 3.4 spec, these may keep the generic Error — their failures
// surface at the nearest route error.tsx (a boundary, not a form-level
// or toast-level concern), so there's no need to distinguish error codes
// here the way an authenticated write path needs to.

export async function fetchJobs(filters?: {
  q?: string;
  location?: string;
  status?: string;
}): Promise<JobListing[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${baseUrl}/api/v1/jobs`, {
    next: { tags: ["jobs"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }

  const paged: PagedResponse<JobListing> = await res.json();
  let jobs = paged.data;

  // Filter in JS after fetch — mock API doesn't support query params
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        (j.title ?? "").toLowerCase().includes(q) ||
        (j.companyName ?? "").toLowerCase().includes(q) ||
        (j.description ?? "").toLowerCase().includes(q)
    );
  }

  if (filters?.location) {
    const loc = filters.location.toLowerCase();
    jobs = jobs.filter((j) => (j.location ?? "").toLowerCase().includes(loc));
  }

  if (filters?.status === "open") {
    jobs = jobs.filter((j) => isJobActive(j));
  }

  return jobs;
}

// =====================================================
// Assignment 2.1 — single job fetch for /jobs/[id]
// =====================================================
// Used by Server Components (app/jobs/[id]/page.tsx), so this can be
// called with `await` directly in an async component body — no useQuery,
// no client-side loading state. cache: "no-store" is passed by the
// CALLER (the page), not hardcoded here, matching the assignment's
// requirement that the page itself specifies the fetch's cache option.
//
// Returns null on 404 instead of throwing, so the calling page can decide
// to call notFound() — distinguishing "doesn't exist" (404, expected,
// handled) from "something went wrong" (500/network error, unexpected,
// should surface as a thrown Error).
export async function fetchJobById(id: string): Promise<JobListing | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${baseUrl}/api/v1/jobs/${id}`, {
    next: { tags: ["jobs"] }, // was cache: "no-store"
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Failed to fetch job: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<JobListing>;
}

// ─────────────────────────────────────────────────────────────────────────
// ASSUMPTION: the exact endpoint paths below (/api/v1/applications/me and
// /api/v1/jobs/{jobId}/applicants) have not been confirmed against the
// real .NET controllers. Adjust these two URLs to match your actual API
// once verified — everything else (auth header, error handling) is correct
// regardless of the final path.
// ─────────────────────────────────────────────────────────────────────────

// Authenticated read: the signed-in candidate's own application history,
// used by /applications. Requires the backend JWT (relayed onto the
// NextAuth session as session.backendToken in auth.ts).
export async function fetchMyApplications(
  applicantId: string,
  backendToken: string
): Promise<ApplicationResponse[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${baseUrl}/api/v1/applicants/${applicantId}/applications`,
    {
      headers: { Authorization: `Bearer ${backendToken}` },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw await parseApiError(res);
  }
  return res.json() as Promise<ApplicationResponse[]>;
}
// Authenticated read: the applicants for one listing, used by
// /dashboard/listings/[id]/applicants. The .NET API is expected to
// enforce ownership itself (403 if this employer doesn't own the
// listing) — the frontend does not duplicate that check, it only
// surfaces whatever the API decides via parseApiError.
export async function fetchApplicantsForListing(
  jobId: string,
  backendToken: string
): Promise<ApplicationResponse[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/applications`, {
      headers: { Authorization: `Bearer ${backendToken}` },
      cache: "no-store",
    });

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return res.json() as Promise<ApplicationResponse[]>;
}

// submitApplication is an AUTHENTICATED write. Per Assignment 3.4 Part 2
// Step 2, this must throw ApiError (via parseApiError) instead of a plain
// Error, so callers (ApplicationWizard's mutation, error.tsx boundaries)
// can branch on error.code — e.g. distinguishing a 409 duplicate
// application from a 422 validation failure from a 401 expired session.
// export async function submitApplication(
//   data: ApplicationRequest
// ): Promise<ApplicationResponse> {
//   // Deliberately NOT using NEXT_PUBLIC_API_URL here. That variable points
//   // at the real .NET API, but /api/applications is a Next.js route
//   // handler that lives on Next.js's own origin, not on the .NET API. A
//   // relative path resolves against whatever origin the browser is
//   // already on, so it reaches the Next.js route correctly regardless of
//   // what NEXT_PUBLIC_API_URL is set to.
//   const res = await fetch("/api/applications", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) {
//     throw await parseApiError(res);
//   }

//   return res.json() as Promise<ApplicationResponse>;
// }