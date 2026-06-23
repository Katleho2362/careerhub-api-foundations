import { JobListing, ApplicationRequest, ApplicationResponse } from "@/types";

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

export async function fetchJobs(): Promise<JobListing[]> {
  // Base URL comes from the environment, not hardcoded, so this same code
  // works against a local mock, a staging API, or production just by
  // changing NEXT_PUBLIC_API_URL — no code changes required.
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // The real backend is versioned (Asp.Versioning) and route-mapped to
  // api/v{version}/jobs, not /api/jobs. The Next.js mock route at
  // src/app/api/jobs/route.ts is no longer the data source — this now
  // points directly at CareerHub.Api.
  // cache: "no-store" tells Next.js's extended fetch to skip its
  // server-side data cache entirely and always hit the network. Without
  // this, Next.js could serve a stale cached response on the /jobs
  // Server Component route, which is exactly the staleness this
  // assignment is testing for.
  const res = await fetch(`${baseUrl}/api/v1/jobs`, { cache: "no-store" });

  // fetch() only rejects on network-level failure (DNS, no connection,
  // CORS). A 404 or 500 still resolves successfully — res.ok is what
  // tells us the server returned an error status. Without this check,
  // an error response's body would silently be parsed and returned as if
  // it were valid job data.
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }

  // The .NET endpoint returns a PagedResponse<JobResponse>, not a bare
  // array — { data, page, pageSize, totalCount, ... }. JobResponse's
  // field names already match JobListing because ASP.NET Core's default
  // System.Text.Json camelCase naming policy turns CompanyName into
  // companyName, SalaryMin into salaryMin, etc. So no field mapping is
  // needed beyond unwrapping `.data`.
  const paged: PagedResponse<JobListing> = await res.json();
  return paged.data;
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
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch job: ${res.status} ${res.statusText}`);
  }

  // GetJobById returns the JobResponse object directly (Ok(job)) — not
  // wrapped in a PagedResponse like the list endpoint, since there's only
  // ever one job here. No unwrapping needed.
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