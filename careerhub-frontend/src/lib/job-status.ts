import { JobListing } from "@/types";

export function isJobActive(job: { closingDate?: string }): boolean {
  if (!job.closingDate) return false;
  return new Date(job.closingDate).getTime() > Date.now();
}