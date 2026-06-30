import React from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { useSession } from "next-auth/react";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

const candidateSession = {
  user: { name: "alice", role: "candidate" },
  expires: "2099-01-01T00:00:00.000Z",
  backendToken: "fake-token",
};

export function renderWithProviders(
  ui: React.ReactElement,
  { session = candidateSession }: { session?: object | null } = {}
) {
  vi.mocked(useSession).mockReturnValue({
    data: session as never,
    status: session ? "authenticated" : "unauthenticated",
    update: vi.fn(),
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}