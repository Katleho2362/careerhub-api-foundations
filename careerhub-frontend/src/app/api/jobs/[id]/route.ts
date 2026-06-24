import { NextRequest, NextResponse } from "next/server";

// Module-level mutable array — mutations persist for the duration of the
// server process, which is exactly what the assignment requires for a mock.
// `let` instead of `const` is not needed since we mutate the objects
// in-place (not reassign the array), but the status field is now mutable.
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
    status: "Open",
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
    status: "Open",
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
    closingDate: "2024-01-01T00:00:00Z",
    status: "Open",
  },
];

// ── GET /api/jobs/[id] ───────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = MOCK_JOBS.find((j) => j.id === id);

  if (!job) {
    return NextResponse.json(
      { title: "Not Found", detail: `No job with id '${id}' exists.`, status: 404 },
      { status: 404 }
    );
  }

  return NextResponse.json(job, { status: 200 });
}

// ── PATCH /api/jobs/[id] ─────────────────────────────────────────────────────
// Reads `status` from the request body and updates the job in-place.
// Returns 400 if status is missing, 404 if job not found, 200 with the
// updated job on success.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { title: "Bad Request", detail: "Request body must be valid JSON.", status: 400 },
      { status: 400 }
    );
  }

  if (!body.status || typeof body.status !== "string") {
    return NextResponse.json(
      { title: "Bad Request", detail: "The 'status' field is required.", status: 400 },
      { status: 400 }
    );
  }

  const job = MOCK_JOBS.find((j) => j.id === id);
  if (!job) {
    return NextResponse.json(
      { title: "Not Found", detail: `No job with id '${id}' exists.`, status: 404 },
      { status: 404 }
    );
  }

  // Mutate in-place — persists for the server process lifetime
  job.status = body.status;

  return NextResponse.json(job, { status: 200 });
}

// ── Method guards ─────────────────────────────────────────────────────────────
export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET, PATCH" } });
}

export async function PUT() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET, PATCH" } });
}

export async function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET, PATCH" } });
}