// "use server";

// import { redirect } from "next/navigation";
// import { setSessionCookie, clearSessionCookie, type Role } from "@/lib/session";

// // ─────────────────────────────────────────────────────────────────────────
// // Auth Server Actions.
// //
// // Why Server Actions instead of a client-side fetch to /api/auth/login:
// // if the browser called the .NET login endpoint directly, the JWT would
// // arrive in client-side JS, and we'd have to manually shuttle it into a
// // cookie via document.cookie — which CANNOT set httpOnly cookies at all.
// // Routing the login through a Server Action means the token is born on
// // the server and never leaves it; only the httpOnly Set-Cookie header
// // reaches the browser.
// // ─────────────────────────────────────────────────────────────────────────

// export type LoginState = { status: "error"; message: string } | null;

// interface LoginResponse {
//   token: string;
// }

// async function loginWithRole(
//   role: Role,
//   endpointPath: string,
//   redirectTo: string,
//   _prevState: LoginState,
//   formData: FormData
// ): Promise<LoginState> {
//   const username = formData.get("username");
//   const password = formData.get("password");

//   if (typeof username !== "string" || !username.trim()) {
//     return { status: "error", message: "Username is required." };
//   }
//   if (typeof password !== "string" || !password) {
//     return { status: "error", message: "Password is required." };
//   }

//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//   let res: Response;
//   try {
//     res = await fetch(`${baseUrl}${endpointPath}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//       cache: "no-store",
//     });
//   } catch {
//     return {
//       status: "error",
//       message: "Could not reach the server. Is the API running?",
//     };
//   }

//   if (res.status === 401) {
//     return { status: "error", message: "Incorrect username or password." };
//   }

//   if (!res.ok) {
//     return {
//       status: "error",
//       message: `Login failed (${res.status}). Please try again.`,
//     };
//   }

//   const body: LoginResponse = await res.json();

//   if (!body.token) {
//     return { status: "error", message: "Login response was missing a token." };
//   }

//   await setSessionCookie(role, body.token);

//   // redirect() throws internally (NEXT_REDIRECT) — it must run AFTER the
//   // try/catch above has already exited, never inside it, or the throw
//   // would be swallowed as if it were a network error.
//   redirect(redirectTo);
// }

// export async function loginEmployer(
//   prevState: LoginState,
//   formData: FormData
// ): Promise<LoginState> {
//   return loginWithRole(
//     "Employer",
//     "/api/auth/login",
//     "/dashboard/listings",
//     prevState,
//     formData
//   );
// }

// export async function loginApplicant(
//   prevState: LoginState,
//   formData: FormData
// ): Promise<LoginState> {
//   return loginWithRole(
//     "Applicant",
//     "/api/auth/login/applicant",
//     "/jobs",
//     prevState,
//     formData
//   );
// }

// export async function logoutEmployer() {
//   await clearSessionCookie("Employer");
//   redirect("/");
// }

// export async function logoutApplicant() {
//   await clearSessionCookie("Applicant");
//   redirect("/");
// }


// export type RegisterState = { status: "error"; message: string } | null;

// export async function registerApplicant(
//   prevState: RegisterState,
//   formData: FormData
// ): Promise<RegisterState> {
//   const fullName = formData.get("fullName");
//   const email = formData.get("email");
//   const password = formData.get("password");

//   if (typeof fullName !== "string" || fullName.trim().length < 2)
//     return { status: "error", message: "Full name must be at least 2 characters." };
//   if (typeof email !== "string" || !email.includes("@"))
//     return { status: "error", message: "Enter a valid email address." };
//   if (typeof password !== "string" || password.length < 8)
//     return { status: "error", message: "Password must be at least 8 characters." };

//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//   let res: Response;
//   try {
//     res = await fetch(`${baseUrl}/api/auth/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ fullName, email, password }),
//       cache: "no-store",
//     });
//   } catch {
//     return { status: "error", message: "Could not reach the server. Is the API running?" };
//   }

//   if (res.status === 409) {
//     return { status: "error", message: "An account with that email already exists." };
//   }

//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));
//     return {
//       status: "error",
//       message: body?.title ?? `Registration failed (${res.status}).`,
//     };
//   }

//   const body: { token: string } = await res.json();
//   if (!body.token) {
//     return { status: "error", message: "Registration response was missing a token." };
//   }

//   await setSessionCookie("Applicant", body.token);

//   // Logged in immediately after registering — send straight to jobs.
//   redirect("/jobs");
// }