import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CloseJobButton } from "@/components/CloseJobButton";
import { renderWithProviders } from "./utils";

// Mock the server action — it's a Next.js server action and cannot
// run in jsdom. We replace it with a vi.fn() that returns success.
vi.mock("@/app/actions/closeJob", () => ({
  closeJobListing: vi.fn().mockResolvedValue({
    status: "success",
    jobTitle: "Backend Developer",
  }),
}));

const defaultProps = {
  jobId: "22222222-0000-0000-0000-000000000001",
  jobTitle: "Backend Developer",
  currentStatus: "Open",
};

describe("CloseJobButton", () => {
  it("opens the AlertDialog when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CloseJobButton {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(screen.getByText("Close this listing?")).toBeInTheDocument();
  });

  it("shows closed state after the user confirms", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CloseJobButton {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(screen.getByText("Close this listing?")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /close listing/i }));

    await waitFor(() => {
      expect(screen.getByText(/closed/i)).toBeInTheDocument();
    });
  });
});