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

  // ── Step navigation test ───────────────────────────────────────────────

describe("ApplicationWizard", () => {


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

  // ── 422 validation mapping ──────────────────────────────────────

  it("Test 12 — 422: field error navigates back and shows inline message", async () => {
    const { submitApplication } = await import("@/app/actions/applications");
    const { ApiError } = await import("@/lib/api-error");

    vi.mocked(submitApplication).mockRejectedValueOnce(
      new ApiError("One or more fields are invalid.", 422, "VALIDATION", {
        coverLetter: ["Cover letter must be at least 100 characters."],
      })
    );

    const user = userEvent.setup();
    localStorage.clear();
    renderWithProviders(<ApplicationWizard {...defaultProps} />);

    await fillAllSteps(user);

    await user.click(
      screen.getByRole("button", { name: /submit application/i })
    );

    // The wizard should navigate back to step 2 (the step that owns
    // coverLetter), not stay on the confirm step.
    await waitFor(() => {
      expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
    });
    expect(
      screen.queryByText("Review your application")
    ).not.toBeInTheDocument();

    // The cover letter field shows the server's error message inline.
    expect(
      screen.getByText("Cover letter must be at least 100 characters.")
    ).toBeInTheDocument();

    // Note: toast.error(...) does fire here (verified manually in the
    // browser), but <Toaster /> is mounted in the root layout, not in
    // this test's provider tree — same reason none of the other tests
    // in this file assert on toast content either. The two assertions
    // above are what actually prove the 422 mapping behaviour.
  });
});