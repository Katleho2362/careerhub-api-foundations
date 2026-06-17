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