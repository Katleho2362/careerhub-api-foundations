"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { submitApplication } from "@/app/actions/applications";
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

// ── Schema ────────────────────────────────────────────────────────────────────

const wizardSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-()\d]{8,15}$/, "Enter a valid phone number")
      .or(z.literal(""))
      .transform((v) => v || undefined)
      .optional(),
    coverLetter: z
      .string()
      .max(2000, "Cover letter must be at most 2000 characters")
      .or(z.literal(""))
      .transform((v) => v || undefined)
      .optional(),
    linkedInUrl: z
      .string()
      .or(z.literal(""))
      .transform((v) => v || undefined)
      .optional(),
    hearAboutRole: z.string().min(1, "Please select an option"),
  })
  .refine(
    (data) =>
      !data.linkedInUrl ||
      data.linkedInUrl.startsWith("https://linkedin.com/") ||
      data.linkedInUrl.startsWith("https://www.linkedin.com/"),
    {
      message: "Must be a valid LinkedIn URL (https://linkedin.com/…)",
      path: ["linkedInUrl"],
    }
  );

type WizardInput = z.input<typeof wizardSchema>;
type WizardOutput = z.output<typeof wizardSchema>;

// ── Step config ───────────────────────────────────────────────────────────────

const STEP_FIELDS: Record<number, (keyof WizardInput)[]> = {
  1: ["fullName", "email", "phone"],
  2: ["coverLetter", "linkedInUrl", "hearAboutRole"],
  3: [],
};

const STEP_LABELS = ["Your Details", "Your Application", "Review & Submit"];

const EMPTY_DEFAULTS: WizardInput = {
  fullName: "",
  email: "",
  phone: "",
  coverLetter: "",
  linkedInUrl: "",
  hearAboutRole: "",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface ApplicationWizardProps {
  jobId: string;
  jobTitle: string;
  userRole: string | null | undefined;
  applicantName: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ApplicationWizard({
  jobId,
  jobTitle,
  userRole,
  applicantName,
}: ApplicationWizardProps) {
  const storageKey = `careerhub-application-${jobId}`;
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<WizardInput, unknown, WizardOutput>({
    resolver: zodResolver(wizardSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  // ── Restore draft on mount ────────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<WizardInput>;
        reset({ ...EMPTY_DEFAULTS, ...saved });
        setHasDraft(true);
        setDraftBannerVisible(true);
      }
    } catch {
      // corrupt — ignore
    }
  }, [storageKey, reset]);

  // ── Auto-save on every field change ──────────────────────────────────────

  useEffect(() => {
    const subscription = watch((values) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
        setHasDraft(true);
      } catch {
        // storage full — ignore
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, storageKey]);

  // ── Submit mutation ───────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: (data: WizardOutput) => {
      const { fullName, email, ...payload } = data;
      void fullName;
      void email;
      return submitApplication(jobId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setDraftBannerVisible(false);
      reset(EMPTY_DEFAULTS);
      setStep(1);
      toast.success(`Application for "${jobTitle}" submitted!`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Discard draft ─────────────────────────────────────────────────────────

  function discardDraft() {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    setDraftBannerVisible(false);
    reset(EMPTY_DEFAULTS);
    setStep(1);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async function goNext() {
    if (step === 1 && userRole !== "candidate") return;
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  // async function onSubmit(data: WizardOutput) {
  //   await mutation.mutateAsync(data);
  // }
    async function onSubmit(data: WizardOutput) {
      try {
        await mutation.mutateAsync(data);
      } catch {
 
      }
    }
  // ── Employer guard ────────────────────────────────────────────────────────

  if (userRole === "employer") {
    return (
      <div className="mt-6 rounded-xl bg-[var(--paper)] p-6 ring-1 ring-[var(--line)]">
        <p className="font-display font-semibold text-[var(--ink)]">
          Employers cannot apply for jobs.
        </p>
      </div>
    );
  }

  const values = getValues();

  return (
    <div className="mt-6 rounded-xl bg-[var(--paper)] p-6 ring-1 ring-[var(--line)]">

      {/* Draft restored banner */}
      {draftBannerVisible && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm dark:border-amber-700 dark:bg-amber-950">
          <span className="text-amber-800 dark:text-amber-300">
            You have a saved draft for this application. Restored automatically.
          </span>
          <button
            type="button"
            onClick={() => setDraftBannerVisible(false)}
            className="ml-4 text-amber-700 hover:text-amber-900 dark:text-amber-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Discard draft button */}
      {hasDraft && (
        <div className="mb-4 flex justify-end">
          <DiscardDraftButton onConfirm={discardDraft} />
        </div>
      )}

      {/* Step indicator */}
      <StepIndicator current={step} labels={STEP_LABELS} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">

        {/* ── Step 1: Your Details ── */}
        {step === 1 && (
          <>
            <Field htmlFor="fullName" label="Full name" error={errors.fullName?.message}>
              <input
                id="fullName"
                type="text"
                {...register("fullName")}
                aria-invalid={!!errors.fullName}
                className={inputCn(!!errors.fullName)}
              />
            </Field>

            <Field htmlFor="email" label="Email" error={errors.email?.message}>
              <input
                id="email"
                type="email"
                {...register("email")}
                aria-invalid={!!errors.email}
                className={inputCn(!!errors.email)}
              />
            </Field>

            <Field htmlFor="phone" label="Phone (optional)" error={errors.phone?.message}>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                aria-invalid={!!errors.phone}
                className={inputCn(!!errors.phone)}
              />
            </Field>

            {userRole !== "candidate" && (
              <p className="rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--muted-text)]">
                You need to be signed in as a candidate to apply.{" "}
                <a href="/login" className="underline hover:text-[var(--ink)]">
                  Sign in here.
                </a>
              </p>
            )}
          </>
        )}

        {/* ── Step 2: Your Application ── */}
        {step === 2 && (
          <>
            <Field htmlFor="coverLetter" label="Cover letter (optional)" error={errors.coverLetter?.message}>
              <textarea
                id="coverLetter"
                rows={5}
                {...register("coverLetter")}
                aria-invalid={!!errors.coverLetter}
                className={inputCn(!!errors.coverLetter)}
              />
            </Field>

            <Field htmlFor="linkedInUrl" label="LinkedIn URL (optional)" error={errors.linkedInUrl?.message}>
              <input
                id="linkedInUrl"
                type="url"
                {...register("linkedInUrl")}
                aria-invalid={!!errors.linkedInUrl}
                className={inputCn(!!errors.linkedInUrl)}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </Field>

            <Field
              htmlFor="hearAboutRole"
              label="How did you hear about this role?"
              error={errors.hearAboutRole?.message}
            >
              <select
                id="hearAboutRole"
                {...register("hearAboutRole")}
                aria-invalid={!!errors.hearAboutRole}
                className={inputCn(!!errors.hearAboutRole)}
              >
                <option value="">Select an option…</option>
                <option value="linkedin">LinkedIn</option>
                <option value="jobboard">Job board</option>
                <option value="referral">Referral</option>
                <option value="company_website">Company website</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </>
        )}

        {/* ── Step 3: Review & Submit ── */}
        {step === 3 && (
          <div className="space-y-1 text-sm">
            <h3 className="mb-3 font-semibold text-[var(--ink)]">Review your application</h3>
            <ReviewRow label="Full name" value={values.fullName} />
            <ReviewRow label="Email" value={values.email} />
            <ReviewRow label="Phone" value={values.phone} />
            <ReviewRow label="Cover letter" value={values.coverLetter} />
            <ReviewRow label="LinkedIn URL" value={values.linkedInUrl} />
            <ReviewRow label="How you heard" value={values.hearAboutRole} />
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button type="button" onClick={goBack} className={secondaryBtn}>
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={step === 1 && userRole !== "candidate"}
              className={cn(
                primaryBtn,
                step === 1 && userRole !== "candidate" && "cursor-not-allowed opacity-40"
              )}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={mutation.isPending}
              className={cn(primaryBtn, mutation.isPending && "cursor-not-allowed opacity-60")}
            >
              {mutation.isPending ? "Submitting…" : "Submit Application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                done && "bg-emerald-500 text-white",
                active && "bg-[var(--amber)] text-[var(--ink)]",
                !done && !active && "border border-[var(--line)] text-[var(--muted-text)]"
              )}
            >
              {done ? "✓" : n}
            </div>
            <span
              className={cn(
                "text-xs",
                active ? "font-semibold text-[var(--ink)]" : "text-[var(--muted-text)]"
              )}
            >
              {label}
            </span>
            {i < labels.length - 1 && <div className="h-px w-6 bg-[var(--line)]" />}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="font-meta text-xs uppercase text-[var(--muted-text)]"
      >
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between border-b border-[var(--line)] py-2">
      <span className="text-[var(--muted-text)]">{label}</span>
      <span className={cn("max-w-[60%] text-right", !value && "italic text-[var(--muted-text)]")}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

function DiscardDraftButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="font-meta text-xs uppercase text-rose-500 hover:text-rose-700"
        >
          Discard draft
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard your draft?</AlertDialogTitle>
          <AlertDialogDescription>
            Your saved application progress will be permanently deleted. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep draft</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-rose-600 text-white hover:bg-rose-700"
          >
            Discard draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const inputCn = (hasError: boolean) =>
  cn(
    "w-full rounded-lg border bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]",
    hasError ? "border-red-500" : "border-[var(--line)]"
  );

const primaryBtn =
  "font-meta rounded-full bg-[var(--amber)] px-4 py-2 text-xs uppercase text-[var(--ink)] transition-opacity hover:opacity-90";

const secondaryBtn =
  "font-meta rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase text-[var(--muted-text)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]";