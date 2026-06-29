// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { z } from "zod";
// import { toast } from "sonner";
// import { submitApplication } from "@/app/actions/applications";
// import { cn } from "@/lib/utils";

// const applicationSchema = z
//   .object({
//     fullName: z
//       .string()
//       .min(2, "Full name must be at least 2 characters")
//       .max(100, "Full name must be at most 100 characters"),
//     email: z.string().email("Enter a valid email address"),
//     phone: z
//       .string()
//       .regex(/^\+?[\d\s\-()\d]{8,15}$/, "Enter a valid phone number")
//       .or(z.literal(""))
//       .transform((val) => (val === "" ? undefined : val))
//       .optional(),
//     yearsOfExperience: z.coerce
//       .number()
//       .int("Years of experience must be a whole number")
//       .min(0, "Years of experience cannot be negative")
//       .max(50, "Years of experience must be 50 or less"),
//     coverLetter: z
//       .string()
//       .min(50, "Cover letter must be at least 50 characters — tell us why you're a strong fit")
//       .max(2000, "Cover letter must be at most 2000 characters"),
//     linkedInUrl: z
//       .string()
//       .url("Enter a valid URL")
//       .refine((val) => val.includes("linkedin.com"), "URL must be a linkedin.com link")
//       .or(z.literal(""))
//       .transform((val) => (val === "" ? undefined : val))
//       .optional(),
//     availableImmediately: z.boolean(),
//     noticePeriodWeeks: z.coerce
//       .number()
//       .int("Notice period must be a whole number of weeks")
//       .min(0, "Notice period cannot be negative"),
//   })
//   .refine((data) => data.availableImmediately || data.noticePeriodWeeks > 0, {
//     message: "Notice period is required when not available immediately",
//     path: ["noticePeriodWeeks"],
//   });

// type ApplicationFormData = z.output<typeof applicationSchema>;
// type ApplicationFormInput = z.input<typeof applicationSchema>;

// interface ApplicationFormProps {
//   jobId: string;
//   jobTitle: string;
//   applicantName: string;
// }

// export function ApplicationForm({ jobId, jobTitle, applicantName }: ApplicationFormProps) {
//   const queryClient = useQueryClient();

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<ApplicationFormInput, unknown, ApplicationFormData>({
//     resolver: zodResolver(applicationSchema),
//     defaultValues: {
//       availableImmediately: true,
//       noticePeriodWeeks: 0,
//       yearsOfExperience: 0,
//     },
//   });

//   const mutation = useMutation({
//     mutationFn: (data: ApplicationFormData) => {
//       const { fullName, email, ...payload } = data;
//       void fullName;
//       void email;
//       return submitApplication(jobId, payload);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["jobs"] });
//       reset();
//       // Success toast replaces the inline success state
//       toast.success(`Application for "${jobTitle}" submitted successfully!`);
//     },
//     onError: (error: Error) => {
//       // Error toast replaces the inline error banner
//       toast.error(error.message);
//     },
//   });

//   const isBusy = isSubmitting || mutation.isPending;

//   async function onValid(data: ApplicationFormData) {
//     await mutation.mutateAsync(data);
//   }

//   return (
//     <form
//       onSubmit={handleSubmit(onValid)}
//       noValidate
//       className="mt-6 space-y-5 rounded-xl bg-[var(--paper)] dark:bg-[var(--paper)]
//                  p-6 ring-1 ring-[var(--line)] dark:ring-[var(--line)]"
//     >
//       {/* Read-only signed-in-as banner */}
//       <div
//         className="flex items-center justify-between rounded-lg border border-[var(--line)]
//                    bg-[var(--canvas)] px-3 py-2 dark:border-[var(--line)] dark:bg-[var(--canvas)]"
//       >
//         <span className="font-meta text-xs uppercase text-[var(--muted-text)]">
//           Signed in as
//         </span>
//         <span className="text-sm font-medium text-[var(--ink)]">{applicantName}</span>
//       </div>

//       {/* fullName */}
//       <div>
//         <label htmlFor="fullName" className="font-meta text-xs uppercase text-[var(--muted-text)]">
//           Full name
//         </label>
//         <input
//           id="fullName"
//           type="text"
//           {...register("fullName")}
//           aria-invalid={!!errors.fullName}
//           className={cn(
//             "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
//             errors.fullName ? "border-red-500" : "border-[var(--line)]"
//           )}
//         />
//         {errors.fullName && (
//           <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
//         )}
//       </div>

//       {/* email */}
//       <div>
//         <label htmlFor="email" className="font-meta text-xs uppercase text-[var(--muted-text)]">
//           Email
//         </label>
//         <input
//           id="email"
//           type="email"
//           {...register("email")}
//           aria-invalid={!!errors.email}
//           className={cn(
//             "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
//             errors.email ? "border-red-500" : "border-[var(--line)]"
//           )}
//         />
//         {errors.email && (
//           <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
//         )}
//       </div>

//       {/* phone */}
//       <div>
//         <label htmlFor="phone" className="font-meta text-xs uppercase text-[var(--muted-text)]">
//           Phone (optional)
//         </label>
//         <input
//           id="phone"
//           type="tel"
//           {...register("phone")}
//           aria-invalid={!!errors.phone}
//           className={cn(
//             "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
//             errors.phone ? "border-red-500" : "border-[var(--line)]"
//           )}
//         />
//         {errors.phone && (
//           <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
//         )}
//       </div>

//       {/* yearsOfExperience */}
//       <div>
//         <label htmlFor="yearsOfExperience" className="font-meta text-xs uppercase text-[var(--muted-text)]">
//           Years of experience
//         </label>
//         <input
//           id="yearsOfExperience"
//           type="number"
//           {...register("yearsOfExperience")}
//           aria-invalid={!!errors.yearsOfExperience}
//           className={cn(
//             "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
//             errors.yearsOfExperience ? "border-red-500" : "border-[var(--line)]"
//           )}
//         />
//         {errors.yearsOfExperience && (
//           <p className="mt-1 text-xs text-red-600">{errors.yearsOfExperience.message}</p>
//         )}
//       </div>

//       {/* coverLetter */}
//       <div>
//         <label htmlFor="coverLetter" className="font-meta text-xs uppercase text-[var(--muted-text)]">
//           Cover letter
//         </label>
//         <textarea
//           id="coverLetter"
//           rows={5}
//           {...register("coverLetter")}
//           aria-invalid={!!errors.coverLetter}
//           className={cn(
//             "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
//             errors.coverLetter ? "border-red-500" : "border-[var(--line)]"
//           )}
//         />
//         {errors.coverLetter && (
//           <p className="mt-1 text-xs text-red-600">{errors.coverLetter.message}</p>
//         )}
//       </div>

//       {/* linkedInUrl */}
//       <div>
//         <label htmlFor="linkedInUrl" className="font-meta text-xs uppercase text-[var(--muted-text)]">
//           LinkedIn URL (optional)
//         </label>
//         <input
//           id="linkedInUrl"
//           type="url"
//           {...register("linkedInUrl")}
//           aria-invalid={!!errors.linkedInUrl}
//           className={cn(
//             "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
//             errors.linkedInUrl ? "border-red-500" : "border-[var(--line)]"
//           )}
//         />
//         {errors.linkedInUrl && (
//           <p className="mt-1 text-xs text-red-600">{errors.linkedInUrl.message}</p>
//         )}
//       </div>

//       {/* availableImmediately */}
//       <div className="flex items-center gap-2">
//         <input
//           id="availableImmediately"
//           type="checkbox"
//           {...register("availableImmediately")}
//           className="h-4 w-4 rounded border-[var(--line)]"
//         />
//         <label htmlFor="availableImmediately" className="text-sm text-[var(--ink)]">
//           Available immediately
//         </label>
//       </div>

//       {/* noticePeriodWeeks */}
//       <div>
//         <label htmlFor="noticePeriodWeeks" className="font-meta text-xs uppercase text-[var(--muted-text)]">
//           Notice period (weeks)
//         </label>
//         <input
//           id="noticePeriodWeeks"
//           type="number"
//           {...register("noticePeriodWeeks")}
//           aria-invalid={!!errors.noticePeriodWeeks}
//           className={cn(
//             "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
//             errors.noticePeriodWeeks ? "border-red-500" : "border-[var(--line)]"
//           )}
//         />
//         {errors.noticePeriodWeeks && (
//           <p className="mt-1 text-xs text-red-600">{errors.noticePeriodWeeks.message}</p>
//         )}
//       </div>

//       <button
//         type="submit"
//         disabled={isBusy}
//         className={cn(
//           "font-meta w-full rounded-full px-4 py-2.5 text-xs uppercase transition-colors",
//           isBusy
//             ? "cursor-not-allowed bg-[var(--muted-text)] text-[var(--paper)]"
//             : "bg-[var(--amber)] text-[var(--ink)] hover:opacity-90"
//         )}
//       >
//         {isBusy ? "Submitting…" : "Submit Application"}
//       </button>
//     </form>
//   );
// }