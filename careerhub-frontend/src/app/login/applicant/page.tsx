import { LoginForm } from "@/components/LoginForm";
import { loginApplicant } from "@/app/actions/auth";

export default function ApplicantLoginPage() {
  return (
    <main className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-sm">
        <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
          CareerHub
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Applicant sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          Sign in to apply for jobs and track your applications.
        </p>

        <LoginForm
          action={loginApplicant}
          roleLabel="Applicant"
          hint='Dev credentials: username "applicant", password "password123".'
        />
      </div>
    </main>
  );
}