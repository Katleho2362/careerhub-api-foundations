
// "use server";

// import { revalidatePath } from "next/cache";

// type CloseJobState =
//   | { status: "success"; jobTitle: string }
//   | { status: "error"; message: string }
//   | null;

// export async function closeJobListing(
//   prevState: CloseJobState,
//   formData: FormData
// ): Promise<CloseJobState> {
//   const jobId = formData.get("jobId");
//   const jobTitle = formData.get("jobTitle");

//   if (!jobId || typeof jobId !== "string" || jobId.trim() === "") {
//     return { status: "error", message: "Job ID is missing." };
//   }

//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//   let res: Response;
//   try {
//     res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}`, {
//       method: "DELETE",
//       cache: "no-store",
//     });
//   } catch {
//     return { status: "error", message: "Could not reach the server." };
//   }

//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));
//     return {
//       status: "error",
//       message: body?.detail ?? `Failed to close job (${res.status}).`,
//     };
//   }

//   revalidatePath("/jobs", "page");
//   revalidatePath("/dashboard/listings", "page");

//   return {
//     status: "success",
//     jobTitle: typeof jobTitle === "string" ? jobTitle : "the listing",
//   };
// }

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { JWT } from "next-auth/jwt";

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

  // Get the backend token from the Auth.js session
  const session = await auth();
  const backendToken = (session as unknown as { backendToken?: string })?.backendToken;

  if (!backendToken) {
    return { status: "error", message: "Not authenticated." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${backendToken}`,
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

  revalidatePath("/jobs", "page");
  revalidatePath("/dashboard/listings", "page");

  return {
    status: "success",
    jobTitle: typeof jobTitle === "string" ? jobTitle : "the listing",
  };
}