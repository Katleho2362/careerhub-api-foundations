export type JobType = "FullTime" | "PartTime" | "Contract" | "Internship";

export interface JobListing {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  type: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryDisplay: string;
  postedAt: string;
  closingDate: string;
  applicationCount: number;
}
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

export interface ApplicationResponse {
  id: string;
  jobId: string;
  email: string;
  submittedAt: string;
}