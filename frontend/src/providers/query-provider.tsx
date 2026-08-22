"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

import { createAppQueryClient } from "@/lib/queryClient";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createAppQueryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== "production" ? <ReactQueryDevtools /> : null}
    </QueryClientProvider>
  );
}
