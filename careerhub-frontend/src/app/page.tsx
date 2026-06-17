"use client";

import { useState, useEffect } from "react";
import { JobListing } from "@/types";
import { JobList } from "@/components/JobList";
import { Sidebar, ViewFilter } from "@/components/Sidebar";
import { isJobActive } from "@/lib/job-status";

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

const STORAGE_KEY = "careerhub:selectedJobId";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ViewFilter>("all");
  const selectedJob = jobs.find((job) => job.id === selectedId) ?? null;

  const openJobs = jobs.filter(isJobActive);
  const closedJobs = jobs.filter((j) => !isJobActive(j));
  const visibleJobs =
    view === "open" ? openJobs : view === "closed" ? closedJobs : jobs;

  // Effect 1 — restore from sessionStorage on mount (runs once).
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null && jobs.some((j) => j.id === stored)) {
      setSelectedId(stored);
    }
  }, []);

  // Effect 2 — persist to sessionStorage whenever selectedId changes.
  useEffect(() => {
    if (selectedId !== null) {
      sessionStorage.setItem(STORAGE_KEY, selectedId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedId]);

  function handleSelect(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    // Page background: dark variant uses --canvas which is remapped to
    // --teal-dark (#15332e) in the .dark block in globals.css.
    <div className="flex min-h-screen bg-[var(--canvas)] dark:bg-[var(--canvas)]">
      <Sidebar
        view={view}
        onViewChange={setView}
        openCount={openJobs.length}
        closedCount={closedJobs.length}
      />

      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Muted label — --muted-text remaps to #9fb3ac in dark mode */}
          <p className="font-meta text-xs uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
            CareerHub
          </p>
          {/* Primary heading — --ink remaps to #f3efe6 (near-white) in dark mode */}
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-[var(--ink)] dark:text-[var(--ink)]">
            Find your next role.
          </h1>

          {selectedJob && (
            // Summary panel: --paper becomes a raised teal card (#1f4b43) in dark
            // mode, --line becomes a lighter teal border (#316058), maintaining the
            // "card raised above background" hierarchy in both modes.
            <div
              className="relative mt-6 overflow-hidden rounded-xl
                         bg-[var(--paper)] dark:bg-[var(--paper)]
                         py-4 pl-6 pr-5
                         ring-1 ring-[var(--line)] dark:ring-[var(--line)]"
            >
              {/* Amber accent bar — --amber is not remapped in dark mode,
                  it reads well against both light white and dark teal paper. */}
              <span className="absolute top-0 left-0 h-full w-1.5 bg-[var(--amber)]" />

              <p className="font-meta text-[11px] uppercase text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                Selected listing
              </p>
              <p className="font-display mt-1 font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                {selectedJob.title}
              </p>
              <p className="text-sm text-[var(--muted-text)] dark:text-[var(--muted-text)]">
                {selectedJob.companyName}
              </p>
            </div>
          )}

          <div className="mt-8">
            <JobList
              jobs={visibleJobs}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}