import { JobListing } from "@/types";

export function isJobActive(job: JobListing): boolean {
  return new Date(job.closingDate).getTime() > Date.now();
}