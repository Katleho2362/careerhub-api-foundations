
// This file is a Next.js Route Handler. Because it lives at
// src/app/api/jobs/route.ts, Next.js automatically serves it at the URL
// /api/jobs. It acts as our mock backend  — standing in
// for a real database/API until one is connected later.

import { NextResponse } from "next/server";
import { JobListing } from "@/types";

const DAY = 86_400_000;

const jobs: JobListing[] = [
  {
    id: "b3a1e2c4-1234-4a1b-8c2d-111111111111",
    title: "Junior Frontend Developer",
    description: "Build and maintain customer-facing React features.",
    companyName: "Bitcube",
    location: "Cape Town",
    type: "FullTime",
    salaryMin: 25000,
    salaryMax: 35000,
    salaryDisplay: "R25 000 – R35 000 pm",
    postedAt: new Date(Date.now()).toISOString(),
    closingDate: new Date(Date.now() + 21 * DAY).toISOString(),
    applicationCount: 0,
  },
  {
    id: "b3a1e2c4-1234-4a1b-8c2d-222222222222",
    title: "Backend Engineer (.NET)",
    description: "Design and maintain core API services.",
    companyName: "AMAZON",
    location: "Johannesburg",
    type: "FullTime",
    salaryMin: 45000,
    salaryMax: 65000,
    salaryDisplay: "R45 000 – R65 000 pm",
    postedAt: new Date(Date.now() - 3 * DAY).toISOString(),
    closingDate: new Date(Date.now() + 14 * DAY).toISOString(),
    applicationCount: 12,
  },
  {
    id: "b3a1e2c4-1234-4a1b-8c2d-333333333333",
    title: "UI/UX Design Intern",
    description: "Support the design team on research and prototyping.",
    companyName: "NET CAMPUS GROUP",
    location: "Remote",
    type: "Internship",
    salaryMin: 8000,
    salaryMax: 12000,
    salaryDisplay: "R8 000 – R12 000 pm",
    postedAt: new Date(Date.now() - 10 * DAY).toISOString(),
    closingDate: new Date(Date.now() + 30 * DAY).toISOString(),
    applicationCount: 4,
  },
  {
    id: "b3a1e2c4-1234-4a1b-8c2d-444444444444",
    title: "DevOps Contractor",
    description: "Manage CI/CD pipelines and cloud infrastructure.",
    companyName: "Standard Bank",
    location: "Johannesburg",
    type: "Contract",
    salaryMin: 60000,
    salaryMax: 90000,
    salaryDisplay: "R60 000 – R90 000 pm",
    postedAt: new Date(Date.now() - 45 * DAY).toISOString(),
    closingDate: new Date(Date.now() - 5 * DAY).toISOString(),
    applicationCount: 31,
  },
  {
    id: "b3a1e2c4-1234-4a1b-8c2d-555555555555",
    title: "Part-Time QA Tester",
    description: "Manual and automated testing across web platforms.",
    companyName: "MLIFI SOLUTIONS",
    location: "Cape Town",
    type: "PartTime",
    salaryMin: 15000,
    salaryMax: 20000,
    salaryDisplay: "R15 000 – R20 000 pm",
    postedAt: new Date(Date.now() - 1 * DAY).toISOString(),
    closingDate: new Date(Date.now() + 10 * DAY).toISOString(),
    applicationCount: 2,
  },
  {
    id: "b3a1e2c4-1234-4a1b-8c2d-666666666666",
    title: "Data Analyst",
    description: "Turn transaction data into actionable reporting.",
    companyName: "MTN",
    location: "Johannesburg",
    type: "FullTime",
    salaryMin: null,
    salaryMax: null,
    salaryDisplay: "Market related",
    postedAt: new Date(Date.now() - 60 * DAY).toISOString(),
    closingDate: new Date(Date.now() + 7 * DAY).toISOString(),
    applicationCount: 7,
  },
];

// Only GET is implemented — this route is read-only
export async function GET() {
  return NextResponse.json(jobs);
}