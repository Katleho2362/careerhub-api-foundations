"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { closeJobListing } from "@/app/actions/closeJob";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CloseJobButtonProps {
  jobId: string;
  jobTitle: string;
  currentStatus: string;
}

export function CloseJobButton({ jobId, jobTitle, currentStatus }: CloseJobButtonProps) {
  if (currentStatus === "Closed") return null;

  const [closed, setClosed] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Called from AlertDialogAction's onClick — not from a form submit.
  // AlertDialogAction renders in a Radix portal outside any <form> element,
  // so type="submit" would do nothing. Instead we call the Server Action
  // programmatically here inside startTransition.
  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("jobTitle", jobTitle);

      const result = await closeJobListing(null, formData);

      if (result?.status === "success") {
        setClosed(true);
        toast.success(`"${result.jobTitle}" has been closed.`);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  }

  if (closed) {
    return (
      <span className="text-xs text-emerald-600 dark:text-emerald-400">
        Closed ✓
      </span>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={isPending}
          className="font-meta rounded-full border border-rose-300 px-3 py-1
                     text-xs uppercase text-rose-600 transition-colors
                     hover:bg-rose-50 disabled:cursor-not-allowed
                     disabled:opacity-50 dark:border-rose-800
                     dark:text-rose-400 dark:hover:bg-rose-950"
        >
          {isPending ? "Closing…" : "Close"}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this listing?</AlertDialogTitle>
          <AlertDialogDescription>
            This listing will be marked as closed and removed from the public
            jobs board. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep listing</AlertDialogCancel>
          {/* onClick, not type="submit" — this element is in a Radix portal,
              outside any <form>, so submit would be a no-op */}
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-rose-600 text-white hover:bg-rose-700"
          >
            Close listing
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}