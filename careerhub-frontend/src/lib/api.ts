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
  const res = await fetch(`${baseUrl}/api/v1/jobs`);

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