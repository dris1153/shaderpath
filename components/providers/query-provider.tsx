"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { isAuthError } from "@/lib/hooks/fetch-json";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Account-only endpoints answer 401 to a signed-out reader. That is
            // a settled answer, not a blip: retrying it three times just costs
            // four requests and an auth round-trip each to reach the same place.
            retry: (failureCount, error) =>
              !isAuthError(error) && failureCount < 3,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
