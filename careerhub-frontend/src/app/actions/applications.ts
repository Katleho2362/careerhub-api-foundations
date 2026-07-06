// "use server";

// import { auth } from "@/auth";

// export interface ApplicationFormFields {
//   phone?: string;
//   coverLetter?: string;
//   linkedInUrl?: string;
//   hearAboutRole: string;
// }

// interface ApplicationResponse {
//   jobListingId: string;
//   applicantId: string;
//   applicantName: string;
//   submittedAt: string;
//   status: string;
// }

// interface ProblemDetails {
//   title?: string;
//   detail?: string;
//   status?: number;
// }

// export async function submitApplication(
//   jobId: string,
//   fields: ApplicationFormFields
// ): Promise<ApplicationResponse> {
//   const session = await auth();
  
//     // Temporary debug — remove after fixing
//   console.log("SESSION:", JSON.stringify(session, null, 2));
//   const backendToken = (session as unknown as { backendToken?: string })?.backendToken;

//   if (!backendToken) {
//     throw new Error("You must be signed in as a candidate to apply.");
//   }

//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//   const res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/applications`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${backendToken}`,
//     },
//     body: JSON.stringify(fields),
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     let message = `Failed to submit application (${res.status}).`;
//     try {
//       const problem: ProblemDetails = await res.json();
//       message = problem.detail ?? problem.title ?? message;
//     } catch { /* non-JSON response */ }
//     throw new Error(message);
//   }

//   return res.json() as Promise<ApplicationResponse>;
// }

"use server";

import { auth } from "@/auth";
import { parseApiError, ApiError } from "@/lib/api-error";

export interface ApplicationFormFields {
  phone?: string;
  coverLetter?: string;
  linkedInUrl?: string;
  hearAboutRole: string;
}

export interface ApplicationResponse {
  jobListingId: string;
  applicantId: string;
  applicantName: string;
  submittedAt: string;
  status: string;
}

export async function submitApplication(
  jobId: string,
  fields: ApplicationFormFields
): Promise<ApplicationResponse> {
  const session = await auth();
  const backendToken = (session as unknown as { backendToken?: string })
    ?.backendToken;

  if (!backendToken) {
    // Same UNAUTHORIZED code as any other missing/expired session, so
    // ApplicationWizard's onError and the route error.tsx files treat
    // this identically to a real 401 from the API.
    throw new ApiError(
      "You must be signed in as a candidate to apply.",
      401,
      "UNAUTHORIZED"
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
    body: JSON.stringify(fields),
    cache: "no-store",
  });

  if (!res.ok) {
    throw await parseApiError(res);
  }

  return res.json() as Promise<ApplicationResponse>;
}