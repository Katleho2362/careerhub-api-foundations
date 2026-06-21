"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: React.ReactNode }) {
  // The QueryClient is created with the useState initialiser form
  // (`useState(() => new QueryClient())`) rather than as a module-level
  // `const queryClient = new QueryClient()`. This matters in Next.js:
  // a module-level client would be created once and shared across every
  // request on the server, leaking cached data between different users.
  // Creating it inside useState ties its lifetime to this component
  // instance instead
  const [queryClient] = useState(() => new QueryClient());

  return (
    // Every descendant of QueryClientProvider can now call useQuery() and
    // automatically share this one client's cache
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}