// import "server-only";
// import { cookies } from "next/headers";

// // ─────────────────────────────────────────────────────────────────────────
// // Session helpers — server-only.
// //
// // Why server-only: the JWT lives in an httpOnly cookie, which means
// // document.cookie in the browser can never read it (that's the whole
// // point of httpOnly — it mitigates XSS token theft). So every function
// // here that reads or writes the session cookie can only run on the
// // server: Server Components, Server Actions, Route Handlers, middleware.
// // The "server-only" import throws a build-time error if this file is
// // ever accidentally imported into a Client Component bundle.
// // ─────────────────────────────────────────────────────────────────────────

// export type Role = "Employer" | "Applicant";

// const COOKIE_NAMES: Record<Role, string> = {
//   Employer: "careerhub_employer_token",
//   Applicant: "careerhub_applicant_token",
// };

// export interface SessionPayload {
//   username: string;
//   role: Role;
//   /** Unix seconds — from the JWT's `exp` claim. */
//   exp: number;
//   /**
//    * Only present for Applicant sessions — links this session to a real
//    * Applicant row in the database. Absent for Employer sessions, which
//    * have no equivalent entity to reference.
//    */
//   applicantId?: string;
// }

// // ── JWT decoding ─────────────────────────────────────────────────────────
// // We only ever need to READ claims out of a token we already trust,
// // because the token was handed to us directly by our own .NET API over
// // HTTPS at login time. Verifying the signature again here would mean
// // duplicating the HMAC secret into this codebase, which is unnecessary —
// // the .NET API re-validates signature AND expiry on every request we
// // forward the token to. Decoding here is purely so Next.js can know
// // "whose session is this" without a network round trip on every render.
// function decodeJwtPayload(token: string): SessionPayload | null {
//   try {
//     const [, payloadB64] = token.split(".");
//     if (!payloadB64) return null;

//     const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
//     const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
//     const json = Buffer.from(padded, "base64").toString("utf-8");
//     const claims = JSON.parse(json);

//     // AuthController.cs uses ClaimTypes.Name / ClaimTypes.Role, which
//     // .NET's JWT handler serializes as long URI keys unless explicitly
//     // mapped to short names — so we check both forms defensively.
//     const username =
//       claims["unique_name"] ??
//       claims["name"] ??
//       claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

//       const role =
//       claims["role"] ??
//       claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

//     if (!username || !role || !claims.exp) return null;

//     // applicantId is a plain custom claim (not a standard ClaimTypes.*
//     // URI), so .NET's JWT serialization keeps the key exactly as written
//     // server-side — no long-URI alternate form to check here, unlike
//     // username/role above.
//     const applicantId: string | undefined = claims["applicantId"];

//     return { username, role, exp: claims.exp, applicantId };
//   } catch {
//     return null;
//   }
// }

// // ── Writing a session (called right after a successful login) ──────────
// export async function setSessionCookie(role: Role, token: string) {
//   const payload = decodeJwtPayload(token);
//   const cookieStore = await cookies();

//   cookieStore.set(COOKIE_NAMES[role], token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     expires: payload
//       ? new Date(payload.exp * 1000)
//       : new Date(Date.now() + 2 * 60 * 60 * 1000),
//   });
// }

// export async function clearSessionCookie(role: Role) {
//   const cookieStore = await cookies();
//   cookieStore.delete(COOKIE_NAMES[role]);
// }

// // ── Reading a session ─────────────────────────────────────────────────
// export async function getSession(role: Role): Promise<SessionPayload | null> {
//   const cookieStore = await cookies();
//   const token = cookieStore.get(COOKIE_NAMES[role])?.value;
//   if (!token) return null;

//   const payload = decodeJwtPayload(token);
//   if (!payload) return null;

//   if (payload.exp * 1000 < Date.now()) return null;

//   return payload;
// }

// export async function getToken(role: Role): Promise<string | null> {
//   const cookieStore = await cookies();
//   return cookieStore.get(COOKIE_NAMES[role])?.value ?? null;
// }

// export { COOKIE_NAMES };