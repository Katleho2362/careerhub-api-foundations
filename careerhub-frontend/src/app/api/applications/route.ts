import { NextRequest, NextResponse } from "next/server";
// This file is a Next.js Route Handler. Because it lives at
// src/app/api/applications/route.ts, Next.js automatically serves it at
// the URL /api/applications. It acts as our mock backend for application
// submissions — standing in for a real database write until one exists.


// =====================================================
// POST /api/applications
// =====================================================
export async function POST(request: NextRequest) {
  const body = await request.json();
  // 400 in Problem Details shape if either required field is missing.
  // We check this BEFORE the artificial delay — there is no reason to
  // make a candidate wait 800ms to find out their request was malformed
  // before it ever reached "the network."
  if (!body.jobId || !body.email) {
    return NextResponse.json(
      {
        title: "Validation failed",
        detail: "Both jobId and email are required fields.",
        status: 400,
      },
      { status: 400 }
    );
  }
  // Simulates real network latency so the loading state in the UI is
  // actually observable instead of resolving instantly.
  await new Promise<void>((resolve) => setTimeout(resolve, 800));
  return NextResponse.json(
    {
      id: crypto.randomUUID(),
      jobId: body.jobId,
      email: body.email,
      submittedAt: new Date().toISOString(),
    },
    { status: 201 }
  );
}
// =====================================================
// GET /api/applications — not supported
// =====================================================
// Next.js route handlers return 405 automatically for any HTTP method
// that is not exported from this file, EXCEPT this assignment wants an
// explicit, intentional 405 — so we define GET ourselves rather than
// relying on the framework default, making the decision visible in code.
export async function GET() {
  return NextResponse.json(
    {
      title: "Method Not Allowed",
      detail: "This endpoint only accepts POST requests.",
      status: 405,
    },
    { status: 405 }
  );
}

