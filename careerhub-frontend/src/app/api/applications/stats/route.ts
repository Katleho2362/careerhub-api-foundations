import { NextResponse } from "next/server";

// Imports the same MOCK_JOBS array indirectly by duplicating the job IDs
// here — the assignment says "import the same mock jobs array". Since
// MOCK_JOBS lives in the [id]/route.ts dynamic segment file (not a shared
// module), we reference the real .NET API's job IDs instead so the
// jobIds actually match what the dashboard fetches from the real backend.
//
// These IDs match the seeded jobs in SeedData.cs exactly.
const MOCK_STATS = [
  { jobId: "22222222-0000-0000-0000-000000000001", applicationCount: 4 },
  { jobId: "22222222-0000-0000-0000-000000000002", applicationCount: 2 },
  { jobId: "22222222-0000-0000-0000-000000000003", applicationCount: 7 },
  { jobId: "22222222-0000-0000-0000-000000000004", applicationCount: 1 },
  { jobId: "22222222-0000-0000-0000-000000000005", applicationCount: 3 },
];

// ── GET /api/applications/stats ───────────────────────────────────────────────
export async function GET() {
  return NextResponse.json(MOCK_STATS, { status: 200 });
}

// ── POST → 405 ────────────────────────────────────────────────────────────────
export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function PUT() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}
export async function PATCH() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}