"use server";

import { getSession, getToken } from "@/lib/session";

// ─────────────────────────────────────────────────────────────────────────
// Why this is a Server Action and not a plain client-side fetch:
// the real .NET endpoint requires an Authorize(Roles="Applicant") JWT,
// and that JWT lives in an httpOnly cookie — unreadable from browser JS
// by design. Routing the submission through a Server Action means the
// cookie is read here, server-side, and the token is attached to the
// outgoing request without ever exposing it to the client bundle.
// ─────────────────────────────────────────────────────────────────────────

export interface ApplicationFormFields {
  phone?: string;
  yearsOfExperience: number;
  coverLetter: string;
  linkedInUrl?: string;
  availableImmediately: boolean;
  noticePeriodWeeks: number;
}

interface ApplicationResponse {
  jobListingId: string;
  applicantId: string;
  applicantName: string;
  submittedAt: string;
  status: string;
  phone?: string;
  coverLetter?: string;
  yearsOfExperience?: number;
  linkedInUrl?: string;
  availableImmediately?: boolean;
  noticePeriodWeeks?: number;
}

// RFC 7807 Problem Details shape — what ASP.NET Core's
// AddProblemDetails() + GlobalExceptionHandler produce for thrown
// domain exceptions (ListingClosedException, DuplicateApplicationException,
// etc.) and what UseStatusCodePages() produces for plain 401/403/404s.
interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
}

export async function submitApplication(
  jobId: string,
  fields: ApplicationFormFields
): Promise<ApplicationResponse> {
  const session = await getSession("Applicant");
  const token = await getToken("Applicant");

  if (!session || !token) {
    throw new Error("You must be signed in as an applicant to apply.");
  }

  if (!session.applicantId) {
    // Should not happen for the dev login (which always carries this
    // claim) or for a properly registered user — but a session predating
    // this feature, or a malformed token, could land here.
    throw new Error(
      "Your session is missing applicant details. Please sign out and sign in again."
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(
    `${baseUrl}/api/v1/jobs/${jobId}/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        applicantId: session.applicantId,
        phone: fields.phone,
        coverLetter: fields.coverLetter,
        yearsOfExperience: fields.yearsOfExperience,
        linkedInUrl: fields.linkedInUrl,
        availableImmediately: fields.availableImmediately,
        noticePeriodWeeks: fields.noticePeriodWeeks,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    let message = `Failed to submit application (${res.status}).`;
    try {
      const problem: ProblemDetails = await res.json();
      message = problem.detail ?? problem.title ?? message;
    } catch {
      // Response body wasn't JSON (e.g. a 429 plain-text rate-limit
      // response from Program.cs's OnRejected handler) — fall back to
      // the generic message above rather than throwing on a parse error.
    }
    throw new Error(message);
  }

  return res.json() as Promise<ApplicationResponse>;
}