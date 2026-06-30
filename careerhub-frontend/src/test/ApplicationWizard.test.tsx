// import { screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { describe, it, expect, vi } from "vitest";
// import { ApplicationWizard } from "@/components/ApplicationWizard";
// import { renderWithProviders } from "./utils";

// // Mock the server action — cannot run in jsdom
// vi.mock("@/app/actions/applications", () => ({
//   submitApplication: vi.fn().mockResolvedValue({
//     jobListingId: "22222222-0000-0000-0000-000000000001",
//     applicantId: "33333333-0000-0000-0000-000000000099",
//     submittedAt: new Date().toISOString(),
//     status: "Submitted",
//   }),
// }));

// const defaultProps = {
//   jobId: "22222222-0000-0000-0000-000000000001",
//   jobTitle: "Backend Developer",
//   userRole: "candidate",
//   applicantName: "Alice",
// };

// // ── Helper ────────────────────────────────────────────────────────────────────

// async function fillAllSteps(user: ReturnType<typeof userEvent.setup>) {
//   await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
//   await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
//   await user.click(screen.getByRole("button", { name: /next/i }));

//   await waitFor(() => {
//     expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
//   });
//   await user.selectOptions(
//     screen.getByLabelText(/how did you hear about this role/i),
//     "linkedin"
//   );
//   await user.click(screen.getByRole("button", { name: /next/i }));

//   await waitFor(() => {
//     expect(screen.getByText("Review your application")).toBeInTheDocument();
//   });
// }

// describe("ApplicationWizard", () => {

//   // ── Step navigation ───────────────────────────────────────────────────────

//   it("renders the step 1 heading on mount", () => {
//     renderWithProviders(<ApplicationWizard {...defaultProps} />);
//     expect(screen.getByText("Your Details")).toBeInTheDocument();
//   });

//   it("blocks advancement when required step 1 fields are empty", async () => {
//     const user = userEvent.setup();
//     renderWithProviders(<ApplicationWizard {...defaultProps} />);

//     await user.click(screen.getByRole("button", { name: /next/i }));

//     expect(screen.getByText(/full name must be at least/i)).toBeInTheDocument();
//     expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
//     expect(screen.getByText("Your Details")).toBeInTheDocument();
//   });

//   it("advances to step 2 when step 1 required fields are filled", async () => {
//     const user = userEvent.setup();
//     localStorage.clear();
//     renderWithProviders(<ApplicationWizard {...defaultProps} />);

//     await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
//     await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
//     await user.click(screen.getByRole("button", { name: /next/i }));

//     await waitFor(() => {
//       expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
//     });
//   });

//   it("back button preserves step 1 values", async () => {
//     const user = userEvent.setup();
//     localStorage.clear();
//     renderWithProviders(<ApplicationWizard {...defaultProps} />);

//     await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
//     await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
//     await user.click(screen.getByRole("button", { name: /next/i }));

//     await waitFor(() => {
//       expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
//     });

//     await user.click(screen.getByRole("button", { name: /back/i }));

//     expect(screen.getByDisplayValue("Alice Smith")).toBeInTheDocument();
//     expect(screen.getByDisplayValue("alice@example.com")).toBeInTheDocument();
//   });

//   // ── Auth gate ─────────────────────────────────────────────────────────────

//   it("shows sign-in message when Next is clicked and user is not authenticated", async () => {
//     const user = userEvent.setup();
//     localStorage.clear();
//     renderWithProviders(
//       <ApplicationWizard {...defaultProps} userRole={null} />,
//       { session: null }
//     );

//     await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
//     await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
//     await user.click(screen.getByRole("button", { name: /next/i }));

//     expect(
//       screen.getByText(/you need to be signed in as a candidate/i)
//     ).toBeInTheDocument();
//     expect(screen.queryByLabelText(/cover letter/i)).not.toBeInTheDocument();
//   });

//   it("advances normally when the user is authenticated as a candidate", async () => {
//     const user = userEvent.setup();
//     localStorage.clear();
//     renderWithProviders(<ApplicationWizard {...defaultProps} userRole="candidate" />);

//     await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
//     await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
//     await user.click(screen.getByRole("button", { name: /next/i }));

//     await waitFor(() => {
//       expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
//     });
//   });

//   // ── Review step ───────────────────────────────────────────────────────────

//   it("review step shows all entered values and Not provided for empty optional fields", async () => {
//     const user = userEvent.setup();
//     localStorage.clear();
//     renderWithProviders(<ApplicationWizard {...defaultProps} />);

//     await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
//     await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
//     await user.click(screen.getByRole("button", { name: /next/i }));

//     await waitFor(() => {
//       expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
//     });

//     await user.selectOptions(
//       screen.getByLabelText(/how did you hear about this role/i),
//       "linkedin"
//     );
//     await user.click(screen.getByRole("button", { name: /next/i }));

//     await waitFor(() => {
//       expect(screen.getByText("Review your application")).toBeInTheDocument();
//     });

//     expect(screen.getByText("Alice Smith")).toBeInTheDocument();
//     expect(screen.getByText("alice@example.com")).toBeInTheDocument();
//     expect(screen.getByText("linkedin")).toBeInTheDocument();
//     const notProvided = screen.getAllByText("Not provided");
//     expect(notProvided.length).toBeGreaterThan(0);
//   });

//   // ── Submit flow ───────────────────────────────────────────────────────────

//   it("resets to step 1 after successful submission", async () => {
//     const user = userEvent.setup();
//     localStorage.clear();
//     renderWithProviders(<ApplicationWizard {...defaultProps} />);

//     await fillAllSteps(user);

//     await user.click(screen.getByRole("button", { name: /submit application/i }));

//     await waitFor(() => {
//       expect(screen.getByText("Your Details")).toBeInTheDocument();
//     });

//     expect(screen.getByLabelText(/full name/i)).toHaveValue("");
//   });

//   it("retains values when the API returns an error", async () => {
//     const { server } = await import("./msw/server");
//     const { http, HttpResponse } = await import("msw");

//     server.use(
//       http.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs/:jobId/applications`,
//         () => new HttpResponse(null, { status: 500 })
//       )
//     );

//     const { submitApplication } = await import("@/app/actions/applications");
//     vi.mocked(submitApplication).mockRejectedValueOnce(
//       new Error("Failed to submit application (500).")
//     );

//     const user = userEvent.setup();
//     localStorage.clear();
//     renderWithProviders(<ApplicationWizard {...defaultProps} />);

//     await fillAllSteps(user);

//     await user.click(screen.getByRole("button", { name: /submit application/i }));

//     await waitFor(() => {
//       expect(screen.getByText("Review your application")).toBeInTheDocument();
//     });
//   });
// });


import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ApplicationWizard } from "@/components/ApplicationWizard";
import { renderWithProviders } from "./utils";

// Mock the server action — cannot run in jsdom
vi.mock("@/app/actions/applications", () => ({
  submitApplication: vi.fn().mockResolvedValue({
    jobListingId: "22222222-0000-0000-0000-000000000001",
    applicantId: "33333333-0000-0000-0000-000000000099",
    submittedAt: new Date().toISOString(),
    status: "Submitted",
  }),
}));

const defaultProps = {
  jobId: "22222222-0000-0000-0000-000000000001",
  jobTitle: "Backend Developer",
  userRole: "candidate",
  applicantName: "Alice",
};

// ── Helper ─────────────────────────────────────────────────────────────

async function fillAllSteps(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
  await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
  await user.click(screen.getByRole("button", { name: /next/i }));

  await waitFor(() => {
    expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
  });

  await user.selectOptions(
    screen.getByLabelText(/how did you hear about this role/i),
    "linkedin"
  );

  await user.click(screen.getByRole("button", { name: /next/i }));

  await waitFor(() => {
    expect(screen.getByText("Review your application")).toBeInTheDocument();
  });
}

describe("ApplicationWizard", () => {
  // ── Step navigation ───────────────────────────────────────────────

  it("renders the step 1 heading on mount", () => {
    renderWithProviders(<ApplicationWizard {...defaultProps} />);
    expect(screen.getByText("Your Details")).toBeInTheDocument();
  });

  it("blocks advancement when required step 1 fields are empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplicationWizard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText(/full name must be at least/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    expect(screen.getByText("Your Details")).toBeInTheDocument();
  });

  it("advances to step 2 when step 1 required fields are filled", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    renderWithProviders(<ApplicationWizard {...defaultProps} />);

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
    });
  });

  it("back button preserves step 1 values", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    renderWithProviders(<ApplicationWizard {...defaultProps} />);

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByDisplayValue("Alice Smith")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice@example.com")).toBeInTheDocument();
  });

  // ── Auth gate ────────────────────────────────────────────────────

  it("shows sign-in message when Next is clicked and user is not authenticated", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    renderWithProviders(
      <ApplicationWizard {...defaultProps} userRole={null} />,
      { session: null }
    );

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      screen.getByText(/you need to be signed in as a candidate/i)
    ).toBeInTheDocument();

    expect(screen.queryByLabelText(/cover letter/i)).not.toBeInTheDocument();
  });

  it("advances normally when the user is authenticated as a candidate", async () => {
    const user = userEvent.setup();
    localStorage.clear();

    renderWithProviders(
      <ApplicationWizard {...defaultProps} userRole="candidate" />
    );

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
    });
  });

  // ── Review step ──────────────────────────────────────────────────

  it("review step shows all entered values and Not provided for empty optional fields", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    renderWithProviders(<ApplicationWizard {...defaultProps} />);

    await user.type(screen.getByLabelText(/full name/i), "Alice Smith");
    await user.type(screen.getByLabelText(/^email$/i), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByLabelText(/how did you hear about this role/i),
      "linkedin"
    );

    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText("Review your application")).toBeInTheDocument();
    });

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("linkedin")).toBeInTheDocument();

    const notProvided = screen.getAllByText("Not provided");
    expect(notProvided.length).toBeGreaterThan(0);
  });

  // ── Submit flow ──────────────────────────────────────────────────

  it("resets to step 1 after successful submission", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    renderWithProviders(<ApplicationWizard {...defaultProps} />);

    await fillAllSteps(user);

    await user.click(
      screen.getByRole("button", { name: /submit application/i })
    );

    await waitFor(() => {
      expect(screen.getByText("Your Details")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/full name/i)).toHaveValue("");
  });

  it("retains values when the API returns an error", async () => {
    const { submitApplication } = await import("@/app/actions/applications");

    vi.mocked(submitApplication).mockRejectedValueOnce(
      new Error("Failed to submit application (500).")
    );

    const user = userEvent.setup();
    localStorage.clear();
    renderWithProviders(<ApplicationWizard {...defaultProps} />);

    await fillAllSteps(user);

    await user.click(
      screen.getByRole("button", { name: /submit application/i })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /submit application/i })
      ).not.toBeDisabled();
    });

    expect(
      screen.getByText("Review your application")
    ).toBeInTheDocument();
  });
});

