import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { JobType } from "@/types";

const typeStyles: Record<JobType, string> = {
  FullTime:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PartTime:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
  Contract:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  Internship:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
};

interface EmploymentTypeBadgeProps {
  type: JobType;
}

export function EmploymentTypeBadge({ type }: EmploymentTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn("shrink-0", typeStyles[type])}>
      {type}
    </Badge>
  );
}

interface JobStatusBadgeProps {
  isActive: boolean;
}

export function JobStatusBadge({ isActive }: JobStatusBadgeProps) {
  if (isActive) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn("mt-2 shrink-0 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300")}
    >
      Closed
    </Badge>
  );
}