import { LoginForm } from "@/components/LoginForm";
import { loginEmployer } from "@/app/actions/auth";

export default function EmployerLoginPage() {
  return (
    <main className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-sm">
        <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
          CareerHub
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Employer sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          Sign in to manage your job listings.
        </p>

        <LoginForm
          action={loginEmployer}
          roleLabel="Employer"
          hint='Dev credentials: username "employer", password "password123".'
        />
      </div>
    </main>
  );
}