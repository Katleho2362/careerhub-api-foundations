import { NextRequest, NextResponse } from "next/server";

// ── Mock data ────────────────────────────────────────────────────────────────
// These IDs must match what your real /api/v1/jobs list returns so that
// clicking a card on /jobs actually resolves here during local testing.
// The shape matches JobListing from src/types/index.ts.
const MOCK_JOBS = [
  {
    id: "1",
    title: "Cloud Architect",
    companyName: "Bitcube",
    location: "Remote",
    type: "FullTime",
    description: "Design and implement cloud infrastructure solutions on AWS and Azure.",
    salaryMin: 60000,
    salaryMax: 90000,
    closingDate: "2027-06-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Senior Developer",
    companyName: "Bitcube",
    location: "Cape Town",
    type: "FullTime",
    description: "Lead frontend development across a suite of enterprise products.",
    salaryMin: 70000,
    salaryMax: 100000,
    closingDate: "2027-07-01T00:00:00Z",
  },
  {
    id: "3",
    title: "Junior Backend Developer",
    companyName: "Bitcube",
    location: "Durban",
    type: "PartTime",
    description: "Build and maintain REST APIs using .NET Core and SQL Server.",
    salaryMin: 30000,
    salaryMax: 45000,
    closingDate: "2024-01-01T00:00:00Z", // intentionally in the past → Closed
  },
];

// ── GET /api/jobs/[id] ───────────────────────────────────────────────────────
// Returns a single job object (200) or a Problem Details 404.
// All other methods are rejected with 405.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = MOCK_JOBS.find((j) => j.id === id);

  if (!job) {
    // RFC 7807 Problem Details shape — matches what the assignment spec
    // requires for the 404 body. The `detail` field carries the specific
    // reason; `title` is the generic category.
    return NextResponse.json(
      {
        title: "Not Found",
        detail: `No job with id '${id}' exists.`,
        status: 404,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(job, { status: 200 });
}

// ── All other methods → 405 ──────────────────────────────────────────────────
// Next.js App Router automatically returns 405 for any method that has no
// export in this file — but exporting a named handler makes it explicit
// and allows us to include an Allow header, which the HTTP spec requires
// for 405 responses.
export async function POST() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "GET" },
  });
}

export async function PUT() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "GET" },
  });
}

export async function DELETE() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "GET" },
  });
}