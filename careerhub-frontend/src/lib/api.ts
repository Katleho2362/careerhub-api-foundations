import { JobListing, ApplicationRequest, ApplicationResponse } from "@/types";
import { isJobActive } from "./job-status";

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
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
    );
  }

  if (filters?.location) {
    const loc = filters.location.toLowerCase();
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc));
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

// Shape of an RFC 7807 Problem Details error response — used by the
// applications mock route's error bodies.
interface ProblemDetails {
  title: string;
  detail?: string;
  status: number;
}

export async function submitApplication(
  data: ApplicationRequest
): Promise<ApplicationResponse> {
  // Deliberately NOT using NEXT_PUBLIC_API_URL here. That variable points
  // at the real .NET API (used by fetchJobs above), but
  // src/app/api/applications is a Next.js route handler that lives on
  // Next.js's own origin, not on the .NET API. A relative path resolves
  // against whatever origin the browser is already on, so it reaches the
  // Next.js mock route correctly regardless of what NEXT_PUBLIC_API_URL
  // is set to.
  const res = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // Same res.ok pattern as fetchJobs: fetch() resolves even on 4xx/5xx, so
  // we must check ok ourselves. On failure, the mock route responds with
  // a Problem Details body ({ title, detail, status }) — we parse that
  // and prefer `detail` (the specific reason) over `title` (the generic
  // category), falling back to title only if detail is absent.
  if (!res.ok) {
    const problem: ProblemDetails = await res.json();
    throw new Error(problem.detail ?? problem.title);
  }

  return res.json() as Promise<ApplicationResponse>;
}