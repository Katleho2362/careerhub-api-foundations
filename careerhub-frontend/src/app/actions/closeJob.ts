"use server";

import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/session";

type CloseJobState =
  | { status: "success"; jobTitle: string }
  | { status: "error"; message: string }
  | null;

export async function closeJobListing(
  prevState: CloseJobState,
  formData: FormData
): Promise<CloseJobState> {
  const jobId = formData.get("jobId");
  const jobTitle = formData.get("jobTitle");

  if (!jobId || typeof jobId !== "string" || jobId.trim() === "") {
    return { status: "error", message: "Job ID is missing." };
  }

  // The DELETE endpoint requires an Employer JWT — read it from the
  // httpOnly cookie server-side and forward it in the Authorization header.
  const token = await getToken("Employer");
  if (!token) {
    return { status: "error", message: "Not authenticated as employer." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return { status: "error", message: "Could not reach the server." };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      status: "error",
      message: body?.detail ?? `Failed to close job (${res.status}).`,
    };
  }

  // 204 NoContent — no body to read. The title was passed in via a hidden
  // form field so the success message can still name the closed listing.
  revalidatePath("/jobs", "page");
  revalidatePath("/dashboard/listings", "page");

  return {
    status: "success",
    jobTitle: typeof jobTitle === "string" ? jobTitle : "the listing",
  };
}