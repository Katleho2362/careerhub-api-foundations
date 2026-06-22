"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { submitApplication } from "@/lib/api";
import { cn } from "@/lib/utils";

// =====================================================
// Schema
// =====================================================
// Defined before the component on purpose — the component's prop types,
// useForm's generic, and the mutation's input type all derive from this
// schema. Schema first means there is one source of truth for shape and
// validation; everything else is inferred from it, not hand-typed
// separately and kept in sync by hand.

const applicationSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be at most 100 characters"),

    email: z.string().email("Enter a valid email address"),

    // Phone is optional, but an HTML input never submits `undefined` when
    // left blank — it submits an empty string "". z.string().optional()
    // alone only accepts `undefined` or a valid string; it does NOT treat
    // "" as equivalent to "not provided", so an empty field would fail
    // the regex check instead of being treated as absent.
    // .or(z.literal("")) widens the schema to accept the literal empty
    // string as a second valid shape, and the trailing .transform turns
    // that empty string into `undefined` after validation passes — so the
    // outer type the form actually receives is `string | undefined`,
    // matching the optional `phone?` field in ApplicationRequest.
    phone: z
      .string()
      .regex(/^\+?[\d\s\-()\d]{8,15}$/, "Enter a valid phone number")
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val))
      .optional(),

    // Solution B from Part 1, Question 2: z.coerce.number() converts the
    // string the HTML input returns into a number at the schema layer,
    // before any other check runs. This is applied instead of
    // valueAsNumber on register so that ALL validation logic (including
    // coercion) lives in one place — the schema — rather than being split
    // between register options and schema rules.
    yearsOfExperience: z.coerce
      .number()
      .int("Years of experience must be a whole number")
      .min(0, "Years of experience cannot be negative")
      .max(50, "Years of experience must be 50 or less"),

    coverLetter: z
      .string()
      .min(
        50,
        "Cover letter must be at least 50 characters — tell us why you're a strong fit"
      )
      .max(2000, "Cover letter must be at most 2000 characters"),

    // Same empty-string-as-absent pattern as phone, but with a URL +
    // substring check instead of a regex.
    linkedInUrl: z
      .string()
      .url("Enter a valid URL")
      .refine(
        (val) => val.includes("linkedin.com"),
        "URL must be a linkedin.com link"
      )
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val))
      .optional(),

    availableImmediately: z.boolean(),

    noticePeriodWeeks: z.coerce
      .number()
      .int("Notice period must be a whole number of weeks")
      .min(0, "Notice period cannot be negative"),
  })
  // Cross-field rule: refine runs AFTER every field-level check above has
  // already passed. It receives the entire parsed object as its first
  // argument (not a single field), which is the only way to compare two
  // fields against each other — a field-level rule on noticePeriodWeeks
  // alone has no way to see the value of availableImmediately.
  .refine(
    (data) => data.availableImmediately || data.noticePeriodWeeks > 0,
    {
      message: "Notice period is required when not available immediately",
      // path tells Zod (and therefore zodResolver) which field this error
      // belongs to. Without it, the error attaches to the form root, not
      // to noticePeriodWeeks — so errors.noticePeriodWeeks would stay
      // undefined and the message would never render next to the field.
      path: ["noticePeriodWeeks"],
    }
  );

// Derived entirely from the schema — never written by hand. If a field is
// added or changed above, this type updates automatically on next build,
// so the form, the schema, and the TypeScript types can never drift apart.
//
// z.output (same as z.infer) gives the shape AFTER coercion runs —
// yearsOfExperience and noticePeriodWeeks are `number` here, which is
// what submitApplication and ApplicationRequest expect.
type ApplicationFormData = z.output<typeof applicationSchema>;

// z.input gives the shape BEFORE coercion — yearsOfExperience and
// noticePeriodWeeks are typed as `unknown` here, matching what
// z.coerce.number() actually accepts as raw input from an HTML field
// before it runs the string-to-number conversion. useForm needs this
// type for its field values, because RHF's internal field state holds
// pre-coercion values while the user is typing — not the post-coercion
// output.
type ApplicationFormInput = z.input<typeof applicationSchema>;

// =====================================================
// Component
// =====================================================

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

export function ApplicationForm({ jobId, jobTitle }: ApplicationFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormInput, unknown, ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      availableImmediately: true,
      noticePeriodWeeks: 0,
      yearsOfExperience: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: submitApplication,
    // Option A — in the useMutation options object. Chosen over passing
    // onSuccess per-call to mutate/mutateAsync because this effect (cache
    // invalidation + form reset) must happen exactly once per successful
    // submission regardless of which code path triggers it — there's only
    // one call site here, but defining it on the mutation itself documents
    // the effect as a property of "what success means for this mutation"
    // rather than "what this particular call site wants to do afterwards".
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      reset();
    },
  });

  // isBusy combines two flags because they answer different questions.
  // isSubmitting (from RHF) is true from the moment handleSubmit's
  // internal validation starts until the onValid callback's returned
  // promise settles. mutation.isPending (from TanStack Query) is true
  // from the moment mutate/mutateAsync fires until the network request
  // settles. Using mutateAsync and awaiting it inside onValid means
  // isSubmitting cannot resolve before the mutation does — RHF is
  // literally waiting on the same promise — so in this implementation the
  // two flags rise and fall together. Combining them with OR is a safety
  // net: if either flag is true for any reason, the button stays
  // disabled.
  const isBusy = isSubmitting || mutation.isPending;

  async function onValid(data: ApplicationFormData) {
    // mutateAsync (not mutate) inside the onValid handler. mutate fires
    // the request and returns void immediately — handleSubmit has
    // nothing to await, so isSubmitting drops to false the instant
    // onValid returns, even though the request is still in flight.
    // mutateAsync returns the promise itself, so awaiting it here means
    // onValid does not resolve — and therefore isSubmitting does not drop
    // — until the request actually settles.
    await mutation.mutateAsync({ jobId, ...data });
  }

  if (mutation.isSuccess) {
    return (
      <div
        className="mt-6 rounded-xl bg-[var(--paper)] dark:bg-[var(--paper)]
                   p-6 text-center ring-1 ring-[var(--line)] dark:ring-[var(--line)]"
      >
        <p className="font-display text-lg font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
          Application submitted
        </p>
            <p className="mt-1 text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            Your application for <strong>{jobTitle}</strong>{" "}has been received. We&apos;ll be in touch.
            </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      // noValidate disables the browser's native HTML5 validation
      // (required, type="email", min/max popups). Without it, the
      // browser's own validation UI would fire on submit BEFORE React
      // Hook Form's handleSubmit ever runs, showing native tooltip
      // bubbles that bypass our styled, accessible Zod error messages
      // entirely and produce two competing validation systems.
      noValidate
      className="mt-6 space-y-5 rounded-xl bg-[var(--paper)] dark:bg-[var(--paper)]
                 p-6 ring-1 ring-[var(--line)] dark:ring-[var(--line)]"
    >
      {mutation.isError && (
        <div
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3
                     dark:border-red-900 dark:bg-red-950/40"
          role="alert"
        >
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {mutation.error.message}
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="fullName"
          className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]"
        >
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          {...register("fullName")}
          aria-invalid={!!errors.fullName}
          className={cn(
            "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
            "dark:bg-[var(--canvas)] dark:text-[var(--ink)]",
            errors.fullName
              ? "border-red-500 dark:border-red-500"
              : "border-[var(--line)] dark:border-[var(--line)]"
          )}
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          className={cn(
            "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
            "dark:bg-[var(--canvas)] dark:text-[var(--ink)]",
            errors.email
              ? "border-red-500 dark:border-red-500"
              : "border-[var(--line)] dark:border-[var(--line)]"
          )}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]"
        >
          Phone (optional)
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          aria-invalid={!!errors.phone}
          className={cn(
            "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
            "dark:bg-[var(--canvas)] dark:text-[var(--ink)]",
            errors.phone
              ? "border-red-500 dark:border-red-500"
              : "border-[var(--line)] dark:border-[var(--line)]"
          )}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="yearsOfExperience"
          className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]"
        >
          Years of experience
        </label>
        <input
          id="yearsOfExperience"
          type="number"
          {...register("yearsOfExperience")}
          aria-invalid={!!errors.yearsOfExperience}
          className={cn(
            "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
            "dark:bg-[var(--canvas)] dark:text-[var(--ink)]",
            errors.yearsOfExperience
              ? "border-red-500 dark:border-red-500"
              : "border-[var(--line)] dark:border-[var(--line)]"
          )}
        />
        {errors.yearsOfExperience && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.yearsOfExperience.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="coverLetter"
          className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]"
        >
          Cover letter
        </label>
        <textarea
          id="coverLetter"
          rows={5}
          {...register("coverLetter")}
          aria-invalid={!!errors.coverLetter}
          className={cn(
            "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
            "dark:bg-[var(--canvas)] dark:text-[var(--ink)]",
            errors.coverLetter
              ? "border-red-500 dark:border-red-500"
              : "border-[var(--line)] dark:border-[var(--line)]"
          )}
        />
        {errors.coverLetter && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.coverLetter.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="linkedInUrl"
          className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]"
        >
          LinkedIn URL (optional)
        </label>
        <input
          id="linkedInUrl"
          type="url"
          {...register("linkedInUrl")}
          aria-invalid={!!errors.linkedInUrl}
          className={cn(
            "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
            "dark:bg-[var(--canvas)] dark:text-[var(--ink)]",
            errors.linkedInUrl
              ? "border-red-500 dark:border-red-500"
              : "border-[var(--line)] dark:border-[var(--line)]"
          )}
        />
        {errors.linkedInUrl && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.linkedInUrl.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="availableImmediately"
          type="checkbox"
          {...register("availableImmediately")}
          className="h-4 w-4 rounded border-[var(--line)] dark:border-[var(--line)]"
        />
        <label
          htmlFor="availableImmediately"
          className="text-sm text-[var(--ink)] dark:text-[var(--ink)]"
        >
          Available immediately
        </label>
      </div>

      <div>
        <label
          htmlFor="noticePeriodWeeks"
          className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]"
        >
          Notice period (weeks)
        </label>
        <input
          id="noticePeriodWeeks"
          type="number"
          {...register("noticePeriodWeeks")}
          aria-invalid={!!errors.noticePeriodWeeks}
          className={cn(
            "mt-1 w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
            "dark:bg-[var(--canvas)] dark:text-[var(--ink)]",
            errors.noticePeriodWeeks
              ? "border-red-500 dark:border-red-500"
              : "border-[var(--line)] dark:border-[var(--line)]"
          )}
        />
        {errors.noticePeriodWeeks && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {errors.noticePeriodWeeks.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isBusy}
        className={cn(
          "font-meta w-full rounded-full px-4 py-2.5 text-xs uppercase transition-colors",
          isBusy
            ? "cursor-not-allowed bg-[var(--muted-text)] text-[var(--paper)] dark:bg-[var(--muted-text)] dark:text-[var(--paper)]"
            : "bg-[var(--amber)] text-[var(--ink)] hover:opacity-90 dark:bg-[var(--amber)] dark:text-[var(--ink)]"
        )}
      >
        {isBusy ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}