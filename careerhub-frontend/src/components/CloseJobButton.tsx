"use client";

import { useActionState } from "react";
import { closeJobListing } from "@/app/actions/closeJob";

type CloseJobState =
  | { status: "success"; jobTitle: string }
  | { status: "error"; message: string }
  | null;

interface CloseJobButtonProps {
  jobId: string;
  jobTitle: string;
  currentStatus: string;
}
export function CloseJobButton({ jobId, jobTitle,currentStatus }: CloseJobButtonProps) {
  // Already closed — render nothing in the Action column
  if (currentStatus === "Closed") return null;

  const [state, formAction, isPending] = useActionState<CloseJobState, FormData>(
    closeJobListing,
    null
  );

  if (state?.status === "success") {
    return (
      <span className="text-xs text-emerald-600 dark:text-emerald-400">
        Closed ✓
      </span>
    );
  }

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="jobId" value={jobId} />
        <input type="hidden" name="jobTitle" value={jobTitle} />
        <button
            type="submit"
            disabled={isPending}
            className="font-meta rounded-full border border-rose-300 px-3 py-1
                    text-xs uppercase text-rose-600 transition-colors
                    hover:bg-rose-50 disabled:cursor-not-allowed
                    disabled:opacity-50 dark:border-rose-800
                    dark:text-rose-400 dark:hover:bg-rose-950"
        >
            {isPending ? "Closing…" : "Close"}
        </button>
        </form>
      {state?.status === "error" && (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
          {state.message}
        </p>
      )}
    </div>
  );
}