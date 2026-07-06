// export type JobType = "FullTime" | "PartTime" | "Contract" | "Internship";

// export interface JobListing {
//   id: string;
//   title: string;
//   description: string;
//   companyName: string;
//   location: string;
//   type: JobType;
//   salaryMin: number | null;
//   salaryMax: number | null;
//   salaryDisplay: string;
//   postedAt: string;
//   closingDate: string;
//   applicationCount: number;
// }
// export interface ApplicationRequest {
//   jobId: string;
//   fullName: string;
//   email: string;
//   phone?: string;
//   yearsOfExperience: number;
//   coverLetter: string;
//   linkedInUrl?: string;
//   availableImmediately: boolean;
//   noticePeriodWeeks: number;
// }

// export interface ApplicationResponse {
//   id: string;
//   jobId: string;
//   email: string;
//   submittedAt: string;
// }
import type { components } from "./api.generated";

// ============================================================
// Hand-maintained enum overrides
// ============================================================
// Program.cs registers a global JsonStringEnumConverter, so JobType and
// ApplicationStatus are serialized as strings at runtime (e.g. "FullTime",
// "Submitted"). openapi-typescript has no visibility into that converter
// and documents both enums as plain integers in api.generated.ts.
//
// Trusting the generated types here would silently break the frontend.
// These two types are intentionally maintained by hand and were verified
// against real GET /jobs and GET /applications responses in DevTools.
export type JobType =
  | "FullTime"
  | "PartTime"
  | "Contract"
  | "Internship";

export type ApplicationStatus =
  | "Submitted"
  | "UnderReview"
  | "Interviewed"
  | "Offered"
  | "Accepted"
  | "Rejected"
  | "Withdrawn";

// ============================================================
// Generated DTOs
// Source of truth: api.generated.ts
// Only enum fields are overridden with string unions.
// ============================================================

export type JobResponse = Omit<
  components["schemas"]["JobResponse"],
  "type"
> & {
  type: JobType;
};

// Backwards-compatibility alias.
// TODO: Rename remaining call sites to JobResponse and remove this alias.
export type JobListing = JobResponse;

export type ApplicationResponse = Omit<
  components["schemas"]["ApplicationResponse"],
  "status"
> & {
  status: ApplicationStatus;
};

export type PagedResponse<T> = Omit<
  components["schemas"]["PagedResponseOfJobResponse"],
  "data"
> & {
  data: T[];
};

export type JobListingStatsResponse =
  components["schemas"]["JobListingStatsResponse"];

// ============================================================
// Frontend-only types
// No backend DTO equivalent
// ============================================================
//
// NOTE:
// fullName and email do not exist on the backend's
// SubmitApplicationRequest. See the README ("Type generation findings")
// for the rationale. Confirm this type is still required before
// extending or relying on it.
export interface ApplicationRequest {
  jobId: string;
  fullName: string;
  email: string;
  phone?: string;
  yearsOfExperience: number;
  coverLetter: string;
  linkedInUrl?: string;
  availableImmediately: boolean;
  noticePeriodWeeks: number;
}