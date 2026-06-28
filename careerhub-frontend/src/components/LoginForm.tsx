// "use client";

// import { useActionState } from "react";
// //import type { LoginState } from "@/app/actions/auth";

// interface LoginFormProps {
//   action: (prevState: LoginState, formData: FormData) => Promise<LoginState>;
//   roleLabel: string;
//   hint?: string;
// }

// // One shared form for both /login/employer and /login/applicant — the
// // only difference between the two pages is which Server Action gets
// // passed in as `action`, and a label/hint for display. Keeping this as
// // a single Client Component avoids duplicating the pending/error UI
// // logic across two near-identical files.
// export function LoginForm({ action, roleLabel, hint }: LoginFormProps) {
//   const [state, formAction, isPending] = useActionState<LoginState, FormData>(
//     action,
//     null
//   );

//   return (
//     <form action={formAction} className="mt-8 space-y-4">
//       <div>
//         <label
//           htmlFor="username"
//           className="font-meta text-xs uppercase text-[var(--muted-text)]"
//         >
//           Username
//         </label>
//         <input
//           id="username"
//           name="username"
//           type="text"
//           required
//           autoComplete="username"
//           disabled={isPending}
//           className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--paper)]
//                      px-3 py-2 text-sm text-[var(--ink)] outline-none
//                      focus:ring-2 focus:ring-[var(--amber)] disabled:opacity-60"
//         />
//       </div>

//       <div>
//         <label
//           htmlFor="password"
//           className="font-meta text-xs uppercase text-[var(--muted-text)]"
//         >
//           Password
//         </label>
//         <input
//           id="password"
//           name="password"
//           type="password"
//           required
//           autoComplete="current-password"
//           disabled={isPending}
//           className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--paper)]
//                      px-3 py-2 text-sm text-[var(--ink)] outline-none
//                      focus:ring-2 focus:ring-[var(--amber)] disabled:opacity-60"
//         />
//       </div>

//       {state?.status === "error" && (
//         <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
//           {state.message}
//         </p>
//       )}

//       <button
//         type="submit"
//         disabled={isPending}
//         className="w-full rounded-md bg-[var(--amber)] px-4 py-2 text-sm font-medium
//                    text-white transition-opacity hover:opacity-90 disabled:opacity-60"
//       >
//         {isPending ? "Signing in…" : `Sign in as ${roleLabel}`}
//       </button>

//       {hint && (
//         <p className="text-xs text-[var(--muted-text)]">{hint}</p>
//       )}
//     </form>
//   );
// }