import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────
// Route protection.
//
// Why middleware instead of checking the session inside each page: this
// runs BEFORE any Server Component renders, on every matching request —
// so an unauthenticated visit to /dashboard/listings never even starts
// rendering the page (no flash of dashboard content, no wasted fetch to
// the .NET API). Middleware can only read cookies, not decode/verify
// them in depth — it doesn't import session.ts (which uses next/headers'
// full cookies() API meant for Server Components) because middleware
// has its own lighter request.cookies API. We only need a quick presence
// + expiry check here; the real, deeper checks already happen on every
// .NET API call via [Authorize], which independently validates the JWT
// signature and expiry. Middleware is a UX guard, not the security
// boundary — the API is.
// ─────────────────────────────────────────────────────────────────────────

const EMPLOYER_COOKIE = "careerhub_employer_token";
const APPLICANT_COOKIE = "careerhub_applicant_token";

function isTokenPresentAndUnexpired(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return false;
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const claims = JSON.parse(json);
    return typeof claims.exp === "number" && claims.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const employerToken = request.cookies.get(EMPLOYER_COOKIE)?.value;
  const applicantToken = request.cookies.get(APPLICANT_COOKIE)?.value;

  const hasEmployerSession = isTokenPresentAndUnexpired(employerToken);
  const hasApplicantSession = isTokenPresentAndUnexpired(applicantToken);

  // Guard: /dashboard/* requires an Employer session.
  if (pathname.startsWith("/dashboard") && !hasEmployerSession) {
    const loginUrl = new URL("/login/employer", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Convenience: already logged in as Employer → skip the login form.
  if (pathname === "/login/employer" && hasEmployerSession) {
    return NextResponse.redirect(new URL("/dashboard/listings", request.url));
  }

  // Convenience: already logged in as Applicant → skip the login form.
  if (pathname === "/login/applicant" && hasApplicantSession) {
    return NextResponse.redirect(new URL("/jobs", request.url));
  }

  return NextResponse.next();
}

// Only run this middleware on the routes it actually cares about — every
// other route (static assets, /api/*, etc.) skips it entirely.
export const config = {
  matcher: ["/dashboard/:path*", "/login/employer", "/login/applicant"],
};