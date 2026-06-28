
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

// The challenge: signIn() runs before the session cookie is written,
// so we can't call auth() inside the Server Action to get the role.
// Solution: Auth.js's signIn() with credentials accepts a `redirectTo`
// param. We use a redirect to /api/auth/callback/credentials which
// then triggers our session callback — but the simpler approach is
// to redirect to a role-routing endpoint after sign-in.
// Actually the correct Auth.js v5 pattern: after signIn resolves
// successfully, the jwt+session callbacks have already run and written
// the cookie. We can then call auth() to read the role and redirect.

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error } = await searchParams;

  // If already signed in, send them away
  const session = await auth();
    if (session?.user) {
    const role = (session.user as unknown as { role: string }).role;
    if (role === "employer") redirect("/dashboard/listings");
    else redirect("/jobs");
    }

  async function handleLogin(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      // signIn with no redirectTo — we handle redirect manually below
      await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
    } catch {
      redirect("/login?error=CredentialsSignin");
    }

    // At this point the JWT cookie has been written and the session
    // callbacks have run — now we can read the role
    const session = await auth();
   const role = (session?.user as { role?: string } | undefined)?.role;

    if (role === "employer") redirect("/dashboard/listings");
    else redirect("/jobs");
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-meta text-xs uppercase text-[var(--muted-text)]">
          CareerHub
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Sign in
        </h1>

        {/* Error panel — shown when Auth.js redirects back with ?error= */}
        {error === "CredentialsSignin" && (
          <div
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3
                       text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950
                       dark:text-rose-300"
            role="alert"
          >
            Incorrect username or password. Please try again.
          </div>
        )}

        <form action={handleLogin} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="username"
              className="font-meta text-xs uppercase text-[var(--muted-text)]"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--paper)]
                         px-3 py-2 text-sm text-[var(--ink)] outline-none
                         focus:ring-2 focus:ring-[var(--amber)]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="font-meta text-xs uppercase text-[var(--muted-text)]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--paper)]
                         px-3 py-2 text-sm text-[var(--ink)] outline-none
                         focus:ring-2 focus:ring-[var(--amber)]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[var(--amber)] px-4 py-2 text-sm
                       font-medium text-white transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}